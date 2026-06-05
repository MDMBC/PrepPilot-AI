import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/DashboardShell";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ReportPage({ params }: { params: { sessionId: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const session = await prisma.interviewSession.findFirst({
    where: { id: params.sessionId, userId: user.id },
    include: { questions: { orderBy: { sequence: "asc" }, include: { answer: true } }, resume: true }
  });
  if (!session) redirect("/dashboard");

  const report = session.reportJson as null | { strengths?: string[]; improvements?: string[]; nextPlan?: string[] };

  return (
    <DashboardShell user={user}>
      <Link href="/dashboard" className="font-black text-teal">Back to dashboard</Link>
      <div className="mt-5 rounded-lg border border-white/10 bg-[#0c1828]/90 p-6 shadow-panel">
        <p className="text-sm font-black uppercase text-teal">Final interview report</p>
        <h1 className="mt-2 text-4xl font-black">{session.role}</h1>
        <p className="mt-3 text-muted">
          {session.interviewType} / {session.difficulty} / Score {session.finalScore ?? "pending"}
        </p>
        {session.reportText ? <p className="mt-6 whitespace-pre-line leading-8 text-muted">{session.reportText}</p> : null}
      </div>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          ["Strengths", report?.strengths ?? []],
          ["Improvements", report?.improvements ?? []],
          ["Next practice plan", report?.nextPlan ?? []]
        ].map(([title, items]) => (
          <article key={title as string} className="rounded-lg border border-white/10 bg-[#0c1828]/90 p-5 shadow-sm">
            <h2 className="text-xl font-black">{title as string}</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-muted">
              {(items as string[]).length ? (items as string[]).map((item) => <li key={item}>{item}</li>) : <li>Complete the interview to generate this section.</li>}
            </ul>
          </article>
        ))}
      </section>

      <section className="mt-6 rounded-lg border border-white/10 bg-[#0c1828]/90 p-5 shadow-panel">
        <h2 className="text-xl font-black">Question-by-question evaluation</h2>
        <div className="mt-5 grid gap-4">
          {session.questions.map((question) => (
            <article key={question.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
              <strong>{question.sequence + 1}. {question.text}</strong>
              <p className="mt-3 text-sm leading-6 text-muted">{question.answer?.transcript ?? "No answer recorded."}</p>
              {question.answer ? <p className="mt-2 font-black text-teal">Score {question.answer.overallScore}</p> : null}
            </article>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}
