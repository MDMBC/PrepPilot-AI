import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_request: Request, { params }: { params: { sessionId: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required." }, { status: 401 });

  const session = await prisma.interviewSession.findFirst({
    where: { id: params.sessionId, userId: user.id },
    select: { id: true }
  });

  if (!session) {
    return NextResponse.json({ error: "Interview session not found." }, { status: 404 });
  }

  await prisma.interviewSession.delete({ where: { id: session.id } });

  return NextResponse.json({ deleted: true });
}
