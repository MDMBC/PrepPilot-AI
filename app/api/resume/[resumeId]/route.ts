import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_request: Request, { params }: { params: { resumeId: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required." }, { status: 401 });

  const resume = await prisma.resume.findFirst({
    where: { id: params.resumeId, userId: user.id },
    select: { id: true }
  });

  if (!resume) {
    return NextResponse.json({ error: "Resume not found." }, { status: 404 });
  }

  await prisma.resume.delete({ where: { id: resume.id } });

  return NextResponse.json({ deleted: true });
}
