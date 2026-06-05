import { NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword, randomVerificationCode, tokenHash } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8)
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid name, email, and password." }, { status: 400 });
  }

  const { name, password } = parsed.data;
  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing?.emailVerifiedAt) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const verificationCode = randomVerificationCode();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
  const passwordHash = hashPassword(password);

  const user = await prisma.$transaction(async (tx) => {
    if (existing) {
      await tx.emailVerificationToken.updateMany({
        where: { userId: existing.id, usedAt: null },
        data: { usedAt: new Date() }
      });

      return tx.user.update({
        where: { id: existing.id },
        data: {
          name,
          passwordHash,
          verifications: {
            create: {
              tokenHash: tokenHash(verificationCode),
              expiresAt
            }
          }
        }
      });
    }

    return tx.user.create({
      data: {
        name,
        email,
        passwordHash,
        verifications: {
          create: {
            tokenHash: tokenHash(verificationCode),
            expiresAt
          }
        }
      }
    });
  });

  try {
    await sendVerificationEmail(user.email, verificationCode);
  } catch (error) {
    console.error("Failed to send verification email", error);
    return NextResponse.json(
      { error: "Account saved, but the verification email could not be sent. Check SMTP settings and try signing up again." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, email: user.email });
}
