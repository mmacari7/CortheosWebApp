"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Page() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState<"invite" | "credentials">("invite");
  const [isValidating, setIsValidating] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  const handleValidateCode = async () => {
    if (!inviteCode.trim()) {
      toast.error("Please enter an invite code");
      return;
    }

    setIsValidating(true);
    try {
      const response = await fetch("/api/invite-code/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: inviteCode }),
      });

      const data = await response.json();

      if (data.valid) {
        toast.success("Invite code validated!");
        setStep("credentials");
      } else {
        toast.error("Invalid or expired invite code");
      }
    } catch (error) {
      console.error("Error validating invite code:", error);
      toast.error("Error validating invite code");
    } finally {
      setIsValidating(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsCreatingAccount(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, inviteCode }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Account created! Signing you in...");

        // Automatically sign in the user
        const signInResult = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (signInResult?.error) {
          toast.error("Account created but sign-in failed. Please try logging in manually.");
          router.push("/login");
        } else {
          toast.success("Signed in! Redirecting to chat...");
          router.push("/chat");
          router.refresh();
        }
      } else {
        toast.error(data.error || "Failed to create account");
      }
    } catch (error) {
      console.error("Error creating account:", error);
      toast.error("Error creating account");
    } finally {
      setIsCreatingAccount(false);
    }
  };

  return (
    <div className="flex h-dvh w-screen items-start justify-center bg-background pt-12 md:items-center md:pt-0">
      <div className="flex w-full max-w-md flex-col gap-12 overflow-hidden rounded-2xl">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="font-semibold text-xl dark:text-zinc-50">Sign Up</h3>
          <p className="text-gray-500 text-sm dark:text-zinc-400">
            {step === "invite"
              ? "Enter your invite code to create an account"
              : "Create your account credentials"}
          </p>
        </div>
        <div className="flex flex-col gap-4 px-4 sm:px-16">
          {step === "invite" ? (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="inviteCode">Invite Code</Label>
                <Input
                  id="inviteCode"
                  type="text"
                  placeholder="Enter your invite code"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  disabled={isValidating}
                />
              </div>
              <Button
                onClick={handleValidateCode}
                disabled={isValidating || !inviteCode.trim()}
              >
                {isValidating ? "Validating..." : "Continue"}
              </Button>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isCreatingAccount}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password (min 8 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isCreatingAccount}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isCreatingAccount}
                />
              </div>
              <Button
                onClick={handleCreateAccount}
                disabled={isCreatingAccount || !email.trim() || !password.trim() || !confirmPassword.trim()}
              >
                {isCreatingAccount ? "Creating Account..." : "Create Account"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setStep("invite")}
                disabled={isCreatingAccount}
              >
                Back
              </Button>
            </>
          )}
          <p className="mt-4 text-center text-gray-600 text-sm dark:text-zinc-400">
            {"Already have an account? "}
            <Link
              className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
              href="/login"
            >
              Sign in
            </Link>
            {" instead."}
          </p>
        </div>
      </div>
    </div>
  );
}
