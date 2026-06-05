import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export default function LoginPage({ searchParams }: { searchParams: { reset?: string; verified?: string } }) {
  const verificationStatus =
    searchParams.verified === "1"
      ? "Email verified. You can log in now."
      : searchParams.verified === "invalid"
        ? "Verification link is invalid or expired. Sign up again to receive a fresh link."
        : searchParams.reset === "1"
          ? "Password updated. You can log in with your new password."
        : "";

  return (
    <AuthForm
      mode="login"
      title="Welcome back"
      subtitle="Sign in to continue your interview practice history."
      initialStatus={verificationStatus}
      footer={
        <>
          <Link href="/forgot-password" className="font-black text-teal">
            Forgot password?
          </Link>
          <span className="px-2">/</span>
          New to PrepPilot?{" "}
          <Link href="/signup" className="font-black text-teal">
            Create an account
          </Link>
        </>
      }
    />
  );
}
