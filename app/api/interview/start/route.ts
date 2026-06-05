import { Difficulty, InterviewMode, InterviewType } from "@prisma/client";
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { generateQuestions } from "@/lib/interview-ai";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  resumeId: z.string().nullable().optional(),
  role: z.string().min(2),
  difficulty: z.nativeEnum(Difficulty),
  interviewType: z.nativeEnum(InterviewType),
  mode: z.nativeEnum(InterviewMode)
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required." }, { status: 401 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Choose a valid role, difficulty, and interview type." }, { status: 400 });
  }

  const resume = parsed.data.resumeId
    ? await prisma.resume.findFirst({ where: { id: parsed.data.resumeId, userId: user.id } })
    : null;

  const recentSessions = await prisma.interviewSession.findMany({
    where: {
      userId: user.id,
      role: parsed.data.role,
      interviewType: parsed.data.interviewType,
      difficulty: parsed.data.difficulty
    },
    include: { questions: { orderBy: { sequence: "asc" } } },
    orderBy: { createdAt: "desc" },
    take: 4
  });

  const generated = await generateQuestions({
    resumeText: resume?.text,
    resumeSummary: resume?.summary,
    skills: resume?.skills,
    role: parsed.data.role,
    difficulty: parsed.data.difficulty,
    interviewType: parsed.data.interviewType,
    sessionSeed: randomUUID(),
    avoidedQuestions: recentSessions.flatMap((session) => session.questions.map((question) => question.text))
  });

  const questions = generated.questions.slice(0, 7);
  const session = await prisma.interviewSession.create({
    data: {
      userId: user.id,
      resumeId: resume?.id,
      role: parsed.data.role,
      difficulty: parsed.data.difficulty,
      interviewType: parsed.data.interviewType,
      mode: parsed.data.mode,
      questions: {
        create: questions.map((question, sequence) => ({
          sequence,
          text: question.text,
          focusArea: question.focusArea
        }))
      }
    },
    include: { questions: { orderBy: { sequence: "asc" } } }
  });

  return NextResponse.json({
    sessionId: session.id,
    question: session.questions[0],
    totalQuestions: session.questions.length
  });
}
