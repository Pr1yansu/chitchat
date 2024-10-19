import { useState } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

type PasswordResetStep = "request" | "reset";

export default function PasswordReset() {
  const [step, setStep] = useState<PasswordResetStep>("request");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [expirationTime, setExpirationTime] = useState<Date | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (step === "request") {
      // Here you would typically make an API call to request a password reset
      console.log("Password reset requested for:", email);
      setSuccess("Password reset link sent. Please check your email.");
      setResetToken("dummy-token");
      const expiration = new Date();
      expiration.setHours(expiration.getHours() + 1); // Set expiration to 1 hour from now
      setExpirationTime(expiration);
      setStep("reset");
    } else if (step === "reset") {
      if (password !== confirmPassword) {
        setError("Passwords do not match");
      } else {
        // Here you would typically make an API call to reset the password
        console.log("Password reset for token:", resetToken);
        setSuccess(
          "Password reset successful. You can now login with your new password."
        );
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="flex w-full justify-center items-center">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <CardTitle>
            {step === "request" ? "Forgot Password" : "Reset Password"}
          </CardTitle>
          <CardDescription>
            {step === "request"
              ? "Enter your email to receive a password reset link."
              : "Enter your new password."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {step === "request" && (
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
            )}
            {step === "reset" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                  />
                </div>
              </>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert
                variant="default"
                className="bg-green-50 text-green-800 border-green-300"
              >
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            {expirationTime && (
              <p className="text-sm text-muted-foreground">
                This reset link will expire on {expirationTime.toLocaleString()}
                .
              </p>
            )}
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading
                ? "Processing..."
                : step === "request"
                ? "Send Reset Link"
                : "Reset Password"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link
            to="/auth"
            className="text-sm text-blue-600 hover:underline flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
