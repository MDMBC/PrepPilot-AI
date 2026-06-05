import { NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword, tokenHash } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  token: z.string().min(16),
  password: z.string().min(8),
  confirmPassword: z.string().optional()
}).refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords must match."
});

export async function POST(request: Request) {
  const form = await request.formData();
  const parsed = schema.safeParse({
    token: String(form.get("token") ?? ""),
    password: String(form.get("password") ?? ""),
    confirmPassword: form.has("confirmPassword") ? String(form.get("confirmPassword") ?? "") : undefined
  });

  if (!parsed.success) {
    const token = String(form.get("token") ?? "");
    const url = new URL("/reset-password", request.url);
    if (token) url.searchParams.set("token", token);
    url.searchParams.set("reset", "form");
    return NextResponse.redirect(url, { status: 303 });
  }

  const records = await prisma.$queryRaw<Array<{ userId: string; usedAt: Date | null; expiresAt: Date }>>`
    SELECT "userId", "usedAt", "expiresAt"
    FROM "PasswordResetToken"
    WHERE "tokenHash" = ${tokenHash(parsed.data.token)}
    LIMIT 1
  `;
  const record = records[0];

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return NextResponse.redirect(new URL("/reset-password?reset=invalid", request.url), { status: 303 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: record.userId },
      data: {
        passwordHash: hashPassword(parsed.data.password),
        emailVerifiedAt: new Date()
      }
    });
    await tx.$executeRaw`
      UPDATE "PasswordResetToken"
      SET "usedAt" = NOW()
      WHERE "userId" = ${record.userId} AND "usedAt" IS NULL
    `;
    await tx.session.deleteMany({
      where: { userId: record.userId }
    });
  });

  return NextResponse.redirect(new URL("/login?reset=1", request.url), { status: 303 });
}
