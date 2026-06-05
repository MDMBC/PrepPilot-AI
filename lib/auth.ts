import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "preppilot_session";
const SESSION_DAYS = 14;

export function hashPassword(password: string, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.pbkdf2Sync(password, salt, 120000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, expected] = stored.split(":");
  if (!salt || !expected) return false;

  const hash = crypto.pbkdf2Sync(password, salt, 120000, 64, "sha512").toString("hex");
  const actualBuffer = Buffer.from(hash, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");

  if (actualBuffer.length !== expectedBuffer.length) return false;

  return crypto.timingSafeEqual(actualBuffer, expectedBuffer);
}

export function randomToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export function randomVerificationCode() {
  return crypto.randomInt(100000, 1000000).toString();
}

export function tokenHash(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string) {
  const token = randomToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await prisma.session.create({
    data: {
      userId,
      tokenHash: tokenHash(token),
      expiresAt
    }
  });
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/"
  });
}

export async function clearSession() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: tokenHash(token) } });
  }
  cookies().delete(COOKIE_NAME);
}

export async function getCurrentUser() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const session = await prisma.session.findUnique({
      where: { tokenHash: tokenHash(token) },
      include: { user: true }
    });

    if (!session || session.expiresAt < new Date()) {
      if (session) {
        await prisma.session.deleteMany({ where: { tokenHash: tokenHash(token) } });
      }
      return null;
    }

    return session.user;
  } catch (error) {
    console.error("Unable to load current user session", error);
    return null;
  }
}
