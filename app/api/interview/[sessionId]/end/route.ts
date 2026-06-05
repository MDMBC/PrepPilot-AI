import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(_request: Request, { params }: { params: { sessionId: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required." }, { status: 401 });

  const session = await prisma.interviewSession.findFirst({
    where: { id: params.sessionId, userId: user.id },
    include: { answers: true }
  });

  if (!session) {
    return NextResponse.json({ error: "Interview session not found." }, { status: 404 });
  }

  if (session.status === "COMPLETED") {
    return NextResponse.json({ ended: true });
  }

  const answeredScores = session.answers.map((answer) => answer.overallScore).filter((score) => Number.isFinite(score));
  const finalScore = answeredScores.length
    ? Math.round(answeredScores.reduce((sum, score) => sum + score, 0) / answeredScores.length)
    : null;

  await prisma.interviewSession.update({
    where: { id: session.id },
    data: {
      status: "COMPLETED",
      finalScore,
      reportText: session.reportText ?? "This session was ended from the dashboard before every interview question was completed.",
      completedAt: session.completedAt ?? new Date()
    }
  });

  return NextResponse.json({ ended: true });
}
