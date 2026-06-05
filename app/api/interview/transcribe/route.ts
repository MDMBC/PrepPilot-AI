import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { transcribeAudio } from "@/lib/openai";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required." }, { status: 401 });

  const form = await request.formData();
  const audio = form.get("audio");
  if (!(audio instanceof File)) {
    return NextResponse.json({ error: "Attach an audio file." }, { status: 400 });
  }

  const transcript = await transcribeAudio(audio);
  return NextResponse.json({ transcript });
}
