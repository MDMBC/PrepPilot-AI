import Link from "next/link";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_18%_12%,rgba(32,214,191,.2),transparent_34rem),radial-gradient(circle_at_88%_6%,rgba(93,140,255,.18),transparent_30rem),linear-gradient(135deg,#050a13,#07111f_48%,#0b1424)] px-5">
      <section className="w-full max-w-lg rounded-lg border border-white/10 bg-[#0c1828]/90 p-8 shadow-panel backdrop-blur">
        <div className="mb-7 flex items-center gap-3 font-black">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-teal text-[#041016] shadow-[0_0_28px_rgba(32,214,191,.28)]">P</span>
          PrepPilot AI
        </div>
        <h1 className="text-3xl font-black">Reset your password</h1>
        <p className="mt-3 leading-7 text-muted">Enter your registered email and we will send a secure password reset link.</p>
        <ForgotPasswordForm />
        <p className="mt-6 text-center text-sm text-muted">
          Remembered it?{" "}
          <Link href="/login" className="font-black text-teal">
            Log in
          </Link>
        </p>
      </section>
    </main>
  );
}
