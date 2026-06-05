import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { randomToken, tokenHash } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().email()
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return NextResponse.json({ ok: true });
  }

  const token = randomToken();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`
      UPDATE "PasswordResetToken"
      SET "usedAt" = NOW()
      WHERE "userId" = ${user.id} AND "usedAt" IS NULL
    `;

    await tx.$executeRaw`
      INSERT INTO "PasswordResetToken" ("id", "tokenHash", "userId", "expiresAt")
      VALUES (${randomUUID()}, ${tokenHash(token)}, ${user.id}, ${expiresAt})
    `;
  });

  try {
    await sendPasswordResetEmail(user.email, token);
  } catch (error) {
    console.error("Failed to send password reset email", error);
    return NextResponse.json({ error: "Password reset email could not be sent. Check SMTP settings and try again." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
