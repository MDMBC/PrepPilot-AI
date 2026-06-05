import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/DashboardShell";
import { DashboardActionButton } from "@/components/DashboardActions";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [sessions, resumes] = await Promise.all([
    prisma.interviewSession.findMany({
      where: { userId: user.id },
      include: { answers: true, resume: true },
      orderBy: { createdAt: "desc" },
      take: 12
    }),
    prisma.resume.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 5 })
  ]);

  return (
    <DashboardShell user={user}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase text-teal">Progress dashboard</p>
          <h1 className="mt-2 text-4xl font-black">Interview readiness</h1>
          <p className="mt-3 max-w-2xl leading-7 text-muted">
            Review your completed mock interviews, resume scans, AI feedback, pronunciation trends, grammar quality, and next practice recommendations.
          </p>
        </div>
        <Link href="/interview" className="rounded-lg bg-teal px-5 py-3 font-black text-white shadow-panel">
          Start mock interview
        </Link>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        {[
          ["Sessions", sessions.length.toString()],
          ["Average score", average(sessions.map((session) => session.finalScore ?? average(session.answers.map((answer) => answer.overallScore)))).toString()],
          ["Resume scans", resumes.length.toString()],
          ["Latest role", sessions[0]?.role ?? "Not set"]
        ].map(([label, value]) => (
          <article key={label} className="rounded-lg border border-white/10 bg-[#0c1828]/90 p-5 shadow-sm">
            <span className="text-sm font-black text-muted">{label}</span>
            <strong className="mt-2 block text-3xl font-black">{value}</strong>
          </article>
        ))}
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
        <div className="rounded-lg border border-white/10 bg-[#0c1828]/90 p-5 shadow-panel">
          <h2 className="text-xl font-black">Recent interview history</h2>
          <div className="mt-5 grid gap-3">
            {sessions.length ? (
              sessions.map((session) => (
                <article key={session.id} className="rounded-lg border border-white/10 bg-white/5 p-4 transition hover:border-teal/70 hover:bg-white/10">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <Link href={`/reports/${session.id}`} className="min-w-0 flex-1">
                      <strong>{session.role}</strong>
                      <p className="mt-1 text-sm text-muted">
                        {session.interviewType} / {session.difficulty} / {session.answers.length} answers
                      </p>
                    </Link>
                    <div className="flex flex-wrap items-center justify-end gap-3">
                      <span className="font-black text-teal">{session.finalScore ?? "In progress"}</span>
                      {session.status === "ACTIVE" ? (
                        <DashboardActionButton
                          endpoint={`/api/interview/${session.id}/end`}
                          method="PATCH"
                          label="End session"
                          busyLabel="Ending..."
                          confirmMessage="End this interview session now?"
                        />
                      ) : (
                        <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-black text-muted">Ended</span>
                      )}
                      <DashboardActionButton
                        endpoint={`/api/interview/${session.id}`}
                        method="DELETE"
                        label="Delete"
                        busyLabel="Deleting..."
                        confirmMessage="Delete this interview session and its report?"
                      />
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <p className="rounded-lg border border-white/10 bg-white/5 p-4 text-muted">No sessions yet. Start your first mock interview to generate a progress trail.</p>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-[#0c1828]/90 p-5 shadow-panel">
          <h2 className="text-xl font-black">Resume library</h2>
          <div className="mt-5 grid gap-3">
            {resumes.length ? (
              resumes.map((resume) => (
                <article key={resume.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <strong className="min-w-0 flex-1">{resume.fileName}</strong>
                    <DashboardActionButton
                      endpoint={`/api/resume/${resume.id}`}
                      method="DELETE"
                      label="Delete"
                      busyLabel="Deleting..."
                      confirmMessage="Delete this resume from your library?"
                    />
                  </div>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">{resume.summary ?? "Resume scanned and ready for interviews."}</p>
                </article>
              ))
            ) : (
              <p className="rounded-lg border border-white/10 bg-white/5 p-4 text-muted">Upload a resume from the interview studio to unlock resume-aware questions.</p>
            )}
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}

function average(values: number[]) {
  const filtered = values.filter((value) => Number.isFinite(value));
  if (!filtered.length) return 0;
  return Math.round(filtered.reduce((sum, value) => sum + value, 0) / filtered.length);
}
