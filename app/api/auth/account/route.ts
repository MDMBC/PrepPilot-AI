import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required." }, { status: 401 });

  await prisma.user.delete({ where: { id: user.id } });
  cookies().delete("preppilot_session");

  return NextResponse.json({ deleted: true });
}
