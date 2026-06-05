import Link from "next/link";

export default function VerifyEmailPage({ searchParams }: { searchParams: { email?: string; token?: string } }) {
  const hasToken = Boolean(searchParams.token);

  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_18%_12%,rgba(32,214,191,.2),transparent_34rem),radial-gradient(circle_at_88%_6%,rgba(93,140,255,.18),transparent_30rem),linear-gradient(135deg,#050a13,#07111f_48%,#0b1424)] px-5">
      <section className="w-full max-w-xl rounded-lg border border-white/10 bg-[#0c1828]/90 p-8 shadow-panel backdrop-blur">
        <div className="mb-6 flex items-center gap-3 font-black">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-teal text-[#041016] shadow-[0_0_28px_rgba(32,214,191,.28)]">P</span>
          PrepPilot AI
        </div>
        <h1 className="text-3xl font-black">Verify your email</h1>
        <p className="mt-3 leading-7 text-muted">
          {hasToken
            ? "Click the button below to complete verification and unlock your account."
            : `Enter the verification code sent to your registered email${searchParams.email ? ` (${searchParams.email})` : ""}.`}
        </p>
        <form action="/api/auth/verify" method="POST" className="mt-6 grid gap-4">
          {hasToken ? (
            <input type="hidden" name="token" value={searchParams.token} />
          ) : (
            <label className="grid gap-2 text-sm font-black text-muted">
              Verification code
              <input
                name="code"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                className="focus-ring rounded-lg border border-white/10 bg-[#07111f] px-4 py-3 text-ink"
              />
            </label>
          )}
          <button className="w-full rounded-lg bg-teal px-5 py-3 font-black text-[#041016] shadow-panel">Verify email</button>
        </form>
        <Link href="/login" className="mt-6 inline-block font-black text-teal">
          Go to login
        </Link>
      </section>
    </main>
  );
}
