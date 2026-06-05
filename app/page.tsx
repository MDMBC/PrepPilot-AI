import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_14%_10%,rgba(32,214,191,.2),transparent_34rem),radial-gradient(circle_at_88%_0%,rgba(93,140,255,.18),transparent_32rem),linear-gradient(135deg,#050a13,#07111f_48%,#0b1424)] px-5 py-6 text-ink md:px-12">
      <nav className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" className="flex items-center gap-3 font-black">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-teal text-[#041016] shadow-[0_0_24px_rgba(32,214,191,.25)]">P</span>
          PrepPilot AI
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="rounded-lg px-4 py-2 font-bold text-ink">
            Login
          </Link>
          <Link href={user ? "/dashboard" : "/signup"} className="rounded-lg bg-teal px-4 py-2 font-bold text-[#041016] shadow-panel">
            {user ? "Dashboard" : "Get started"}
          </Link>
        </div>
      </nav>

      <section className="mx-auto grid min-h-[calc(100vh-84px)] max-w-7xl items-center gap-10 py-10 lg:grid-cols-[1.04fr_.96fr]">
        <div>
          <p className="mb-3 text-sm font-black uppercase text-teal">AI-powered interview preparation</p>
          <h1 className="max-w-4xl text-5xl font-black leading-[.98] tracking-normal md:text-7xl">
            Real-world mock interviews shaped around your resume.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
            Upload your resume, choose a role, pick HR or technical rounds, and practice with AI voice questions that unlock one by one after your answer is evaluated.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup" className="rounded-lg bg-teal px-6 py-3 font-black text-[#041016] shadow-panel">
              Create account
            </Link>
            <Link href="/login" className="rounded-lg border border-white/10 bg-white/5 px-6 py-3 font-black shadow-sm backdrop-blur transition hover:border-teal/60 hover:bg-white/10">
              Sign in
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-white/10 bg-[#0c1828] shadow-panel">
          <img src="/assets/interview-dashboard.svg" alt="AI interview dashboard preview" className="block aspect-[1/.78] w-full object-cover" />
          <div className="grid grid-cols-3 border-t border-white/10 text-white">
            {[
              ["84", "Clarity"],
              ["78", "Pace"],
              ["91", "Resume fit"]
            ].map(([score, label]) => (
              <div key={label} className="border-r border-white/10 p-5 last:border-r-0">
                <strong className="block text-3xl">{score}</strong>
                <span className="text-sm font-bold text-white/65">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
