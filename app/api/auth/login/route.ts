import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession, randomVerificationCode, tokenHash, verifyPassword } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  if (!user.emailVerifiedAt) {
    const verificationCode = randomVerificationCode();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

    await prisma.$transaction(async (tx) => {
      await tx.emailVerificationToken.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() }
      });

      await tx.emailVerificationToken.create({
        data: {
          userId: user.id,
          tokenHash: tokenHash(verificationCode),
          expiresAt
        }
      });
    });

    try {
      await sendVerificationEmail(user.email, verificationCode);
    } catch (error) {
      console.error("Failed to send verification email", error);
      return NextResponse.json({ error: "Your email is not verified, and a fresh code could not be sent. Check SMTP settings." }, { status: 502 });
    }

    return NextResponse.json({ error: "A fresh verification code was sent to your registered email." }, { status: 403 });
  }

  await createSession(user.id);
  return NextResponse.json({ ok: true });
}
