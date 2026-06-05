import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export default function SignupPage() {
  return (
    <AuthForm
      mode="signup"
      title="Create your PrepPilot account"
      subtitle="Email verification is required before starting mock interviews."
      footer={
        <>
          Already verified?{" "}
          <Link href="/login" className="font-black text-teal">
            Log in
          </Link>
        </>
      }
    />
  );
}
