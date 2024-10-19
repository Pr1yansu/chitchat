import passport from "passport";
import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import {
  addContact,
  getAllUsers,
  getContact,
  getProfile,
  register,
} from "../controller/user";
import { ensureAuthenticated } from "../middleware/auth";

const router = Router();

// @route POST /auth/register
router.post("/register", register);

// @route POST /auth/login
router.post("/login", (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    "local",
    (err: Error, user: Express.User, info: { message: string }) => {
      if (err) return next(err);
      if (!user) return res.status(400).json({ message: info.message });

      req.login(user, (err) => {
        if (err) return next(err);
        return res.json({ message: "Logged in successfully.", user });
      });
    }
  )(req, res, next);
});

// @route GET /auth/logout
router.post("/logout", (req: Request, res: Response) => {
  req.logout(() => {
    res.json({ message: "Logged out successfully." });
  });
});

// @route GET /auth/google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// @route GET /auth/google/callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/auth`,
  }),
  (req: Request, res: Response) => {
    res.redirect(process.env.CLIENT_URL || "http://localhost:5173");
  }
);

// @route GET /auth/facebook
router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

// @route GET /auth/facebook/callback
router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: `${process.env.CLIENT_URL}/auth`,
  }),
  (req: Request, res: Response) => {
    res.redirect(process.env.CLIENT_URL || "http://localhost:5173");
  }
);

// @route GET /auth/github
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

// @route GET /auth/github/callback
router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: `${process.env.CLIENT_URL}/auth`,
  }),
  (req: Request, res: Response) => {
    res.redirect(process.env.CLIENT_URL || "http://localhost:5173");
  }
);

// @route GET /auth/profile
router.get("/profile", ensureAuthenticated, getProfile);

// @route GET /auth/all
router.get("/all", ensureAuthenticated, getAllUsers);

// @route PUT /auth/add/contact/:id
router.put("/add/contact/:contactId", ensureAuthenticated, addContact);

// @route GET /auth/contact/:userId
router.get("/contact/:contactId", ensureAuthenticated, getContact);

export default router;
