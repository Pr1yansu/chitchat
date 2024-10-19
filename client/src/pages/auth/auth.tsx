import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Facebook, Github } from "lucide-react";
import { Link } from "react-router-dom";
import { z } from "zod";
import FormError from "@/components/forms/form-error";
import {
  useCreateUserMutation,
  useLoginMutation,
} from "@/store/api/users/user";

import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const registerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function Auth() {
  const [createUser] = useCreateUserMutation();
  const [login] = useLoginMutation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("login");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const action = formData.get("action") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;

    try {
      if (action === "login") {
        const validatedData = loginSchema.parse({ email, password });

        await login(validatedData)
          .unwrap()
          .then((res) => {
            toast.success(res.message);
          })
          .catch((err) => toast.error(err));
      } else if (action === "register") {
        const validatedData = registerSchema.parse({
          firstName,
          lastName,
          email,
          password,
        });

        await createUser(validatedData)
          .unwrap()
          .then((res) => {
            toast.success(res.message);
          })
          .catch((err) => toast.error(err));
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setError(null);
        toast.dismiss();
      }, 5000);
    }
  };

  const handleOAuthSignIn = (provider: "google" | "github" | "facebook") => {
    if (provider === "google") {
      window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
    } else if (provider === "github") {
      window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/github`;
    } else if (provider === "facebook") {
      window.location.href = `${
        import.meta.env.VITE_API_URL
      }/api/auth/facebook`;
    }
  };

  return (
    <div className="w-full flex justify-center items-center">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
          <CardDescription>
            Sign in to your account or create a new one.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            <form onSubmit={handleSubmit}>
              <input type="hidden" name="action" value={activeTab} />
              <TabsContent value="login" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                  />
                </div>
                <div className="text-right">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              </TabsContent>
              <TabsContent value="register" className="space-y-4">
                <div className="flex gap-2">
                  <div className="space-y-2 w-full">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                    />
                  </div>
                  <div className="space-y-2 w-full">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" name="lastName" type="text" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                  />
                </div>
              </TabsContent>
              {error && (
                <FormError
                  error={error}
                  className="mt-4"
                  onClose={() => setError(null)}
                />
              )}
              <Button
                className="w-full mt-4"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Submit"}
              </Button>
            </form>
            <div className="mt-6">
              <Separator />
              <p className="text-center text-sm text-muted-foreground my-4">
                Or continue with
              </p>
              <div className="flex max-lg:flex-col gap-2 flex-wrap">
                <Button
                  variant="outline"
                  onClick={() => handleOAuthSignIn("google")}
                  className="flex-1"
                >
                  <svg
                    className="mr-2 h-4 w-4"
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fab"
                    data-icon="google"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 488 512"
                  >
                    <path
                      fill="currentColor"
                      d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                    ></path>
                  </svg>
                  Sign in with Google
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleOAuthSignIn("github")}
                  className="flex-1"
                >
                  <Github className="mr-2 h-4 w-4" />
                  Sign in with GitHub
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleOAuthSignIn("facebook")}
                  className="flex-1"
                >
                  <Facebook className="mr-2 h-4 w-4" />
                  Sign in with Facebook
                </Button>
              </div>
            </div>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Protected by reCAPTCHA and subject to the Privacy Policy and Terms
            of Service.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
