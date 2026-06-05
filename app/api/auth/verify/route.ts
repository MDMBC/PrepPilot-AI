import { redirect } from "next/navigation";
import { tokenHash } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const form = await request.formData();
  const token = String(form.get("token") ?? form.get("code") ?? "").trim();
  if (!token) {
    redirect("/login?verified=invalid");
  }

  const record = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash: tokenHash(token) }
  });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    redirect("/login?verified=invalid");
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerifiedAt: new Date() }
    }),
    prisma.emailVerificationToken.updateMany({
      where: { userId: record.userId, usedAt: null },
      data: { usedAt: new Date() }
    })
  ]);

  redirect("/login?verified=1");
}
