import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { evaluateAnswer, generateFinalReport } from "@/lib/interview-ai";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  sessionId: z.string(),
  questionId: z.string(),
  transcript: z.string().min(8)
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required." }, { status: 401 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Submit a complete answer transcript." }, { status: 400 });
  }

  const session = await prisma.interviewSession.findFirst({
    where: { id: parsed.data.sessionId, userId: user.id },
    include: {
      resume: true,
      questions: { orderBy: { sequence: "asc" }, include: { answer: true } },
      answers: true
    }
  });
  if (!session || session.status === "COMPLETED") {
    return NextResponse.json({ error: "Interview session is not active." }, { status: 404 });
  }

  const question = session.questions.find((item) => item.id === parsed.data.questionId);
  if (!question || question.answer) {
    return NextResponse.json({ error: "Question is invalid or already answered." }, { status: 400 });
  }

  const previousUnanswered = session.questions.find((item) => !item.answer);
  if (previousUnanswered?.id !== question.id) {
    return NextResponse.json({ error: "Answer the current question before moving ahead." }, { status: 400 });
  }

  const feedback = await evaluateAnswer({
    question: question.text,
    transcript: parsed.data.transcript,
    role: session.role,
    interviewType: session.interviewType,
    difficulty: session.difficulty,
    resumeSummary: session.resume?.summary
  });

  await prisma.interviewAnswer.create({
    data: {
      sessionId: session.id,
      questionId: question.id,
      transcript: parsed.data.transcript,
      grammarScore: feedback.grammarScore,
      pronunciationScore: feedback.pronunciationScore,
      relevanceScore: feedback.relevanceScore,
      structureScore: feedback.structureScore,
      confidenceScore: feedback.confidenceScore,
      overallScore: feedback.overallScore,
      feedbackJson: feedback
    }
  });

  const refreshed = await prisma.interviewSession.findUniqueOrThrow({
    where: { id: session.id },
    include: { questions: { orderBy: { sequence: "asc" }, include: { answer: true } }, resume: true }
  });
  const nextQuestion = refreshed.questions.find((item) => !item.answer);

  if (!nextQuestion) {
    const answers = refreshed.questions.map((item) => ({
      question: item.text,
      transcript: item.answer?.transcript ?? "",
      score: item.answer?.overallScore ?? 0
    }));
    const report = await generateFinalReport({
      role: refreshed.role,
      interviewType: refreshed.interviewType,
      difficulty: refreshed.difficulty,
      resumeSummary: refreshed.resume?.summary,
      answers
    });

    await prisma.interviewSession.update({
      where: { id: refreshed.id },
      data: {
        status: "COMPLETED",
        finalScore: report.finalScore,
        reportJson: report,
        reportText: report.reportText,
        completedAt: new Date()
      }
    });

    return NextResponse.json({
      completed: true,
      sessionId: refreshed.id,
      feedback
    });
  }

  return NextResponse.json({
    completed: false,
    sessionId: refreshed.id,
    feedback,
    nextQuestion,
    totalQuestions: refreshed.questions.length
  });
}
