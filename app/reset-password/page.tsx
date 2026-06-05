import Link from "next/link";

export default function ResetPasswordPage({ searchParams }: { searchParams: { reset?: string; token?: string } }) {
  const isInvalid = searchParams.reset === "invalid";

  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_18%_12%,rgba(32,214,191,.2),transparent_34rem),radial-gradient(circle_at_88%_6%,rgba(93,140,255,.18),transparent_30rem),linear-gradient(135deg,#050a13,#07111f_48%,#0b1424)] px-5">
      <section className="w-full max-w-lg rounded-lg border border-white/10 bg-[#0c1828]/90 p-8 shadow-panel backdrop-blur">
        <div className="mb-7 flex items-center gap-3 font-black">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-teal text-[#041016] shadow-[0_0_28px_rgba(32,214,191,.28)]">P</span>
          PrepPilot AI
        </div>
        <h1 className="text-3xl font-black">Choose a new password</h1>
        <p className="mt-3 leading-7 text-muted">
          {isInvalid
            ? "This reset link is invalid or expired. Request a fresh link to continue."
            : searchParams.reset === "form"
              ? "Enter matching passwords with at least 8 characters."
              : "Set a new password for your PrepPilot AI account."}
        </p>

        {searchParams.token && !isInvalid ? (
          <form action="/api/auth/reset-password" method="POST" className="mt-7 grid gap-4">
            <input type="hidden" name="token" value={searchParams.token} />
            <label className="grid gap-2 text-sm font-black text-muted">
              New password
              <input name="password" type="password" minLength={8} required className="focus-ring rounded-lg border border-white/10 bg-[#07111f] px-4 py-3 text-ink" />
            </label>
            <label className="grid gap-2 text-sm font-black text-muted">
              Confirm password
              <input name="confirmPassword" type="password" minLength={8} required className="focus-ring rounded-lg border border-white/10 bg-[#07111f] px-4 py-3 text-ink" />
            </label>
            <button className="rounded-lg bg-teal px-5 py-3 font-black text-[#041016] shadow-panel">Update password</button>
          </form>
        ) : (
          <Link href="/forgot-password" className="mt-6 inline-block rounded-lg bg-teal px-5 py-3 font-black text-[#041016] shadow-panel">
            Request new link
          </Link>
        )}
      </section>
    </main>
  );
}
