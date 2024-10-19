import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as GitHubStrategy } from "passport-github";
import bcrypt from "bcryptjs";
import User from "../schemas/user";

passport.serializeUser((user: Express.User, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) return done(null, false, { message: "Incorrect email." });

        if (!user.password)
          return done(null, false, { message: "No password set. Use OAuth." });

        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch)
          return done(null, false, { message: "Incorrect password." });

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_REDIRECT_URI!,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await User.findOne({ googleId: profile.id });
        if (existingUser) return done(null, existingUser);

        const email = profile.emails![0].value;
        const userByEmail = await User.findOne({ email });

        if (userByEmail) {
          if (userByEmail.password) {
            return done(null, false, {
              message: "Email already exists. Use email and password to login.",
            });
          }
          userByEmail.googleId = profile.id;
          await userByEmail.save();
          return done(null, userByEmail);
        }

        const newUser = new User({
          firstName: profile.name?.givenName || "GoogleUser",
          lastName: profile.name?.familyName || "Google",
          email: email,
          googleId: profile.id,
          avatar: {
            url: profile.photos![0].value,
            public_id: "",
          },
          status: "offline",
        });

        await newUser.save();
        return done(null, newUser);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      callbackURL: process.env.FACEBOOK_REDIRECT_URI!,
      profileFields: ["id", "emails", "name", "photos"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await User.findOne({ facebookId: profile.id });
        if (existingUser) return done(null, existingUser);

        // If email exists, link Facebook account
        const email = profile.emails ? profile.emails[0].value : null;
        if (email) {
          const userByEmail = await User.findOne({ email });
          if (userByEmail) {
            if (userByEmail.password) {
              return done(null, false, {
                message:
                  "Email already exists. Use email and password to login.",
              });
            }
            userByEmail.facebookId = profile.id;
            await userByEmail.save();
            return done(null, userByEmail);
          }
        }

        // Create new user
        const newUser = new User({
          firstName: profile.name?.givenName || "FacebookUser",
          lastName: profile.name?.familyName || "Facebook",
          email: email || `facebook_${profile.id}@example.com`, // Fallback email
          facebookId: profile.id,
          avatar: {
            url: profile.photos ? profile.photos[0].value : "",
            public_id: "",
          },
          status: "offline",
        });

        await newUser.save();
        return done(null, newUser);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: process.env.GITHUB_REDIRECT_URI!,
      scope: ["user:email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await User.findOne({ githubId: profile.id });
        if (existingUser) return done(null, existingUser);

        const emailResponse = await fetch(
          "https://api.github.com/user/emails",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const emails = await emailResponse.json();

        const primaryEmail = emails.find(
          (email: { primary: boolean; verified: boolean; email: string }) =>
            email.primary && email.verified
        );

        if (!primaryEmail) {
          return done(null, false, {
            message: "Primary email not set or verified on GitHub.",
          });
        }

        const userByEmail = await User.findOne({
          email: primaryEmail?.email,
        });

        if (userByEmail) {
          if (userByEmail.password) {
            return done(null, false, {
              message: "Email already exists. Use email and password to login.",
            });
          }
          userByEmail.githubId = profile.id;
          await userByEmail.save();
          return done(null, userByEmail);
        }

        const newUser = new User({
          firstName: profile.displayName?.split(" ")[0] || "GitHubUser",
          lastName: profile.displayName?.split(" ")[1] || "GitHub",
          email: primaryEmail?.email,
          githubId: profile.id,
          avatar: {
            url: profile.photos ? profile.photos[0].value : "",
            public_id: "",
          },
          status: "offline",
        });

        await newUser.save();
        return done(null, newUser);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);
