import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required." }, { status: 401 });

  const sessions = await prisma.interviewSession.findMany({
    where: { userId: user.id },
    include: { answers: true, resume: true },
    orderBy: { createdAt: "desc" },
    take: 25
  });

  return NextResponse.json({ sessions });
}
