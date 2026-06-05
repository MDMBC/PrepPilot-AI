import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createEmbedding } from "@/lib/openai";
import { prisma } from "@/lib/prisma";
import { chunkText, extractResumeText, summarizeResume } from "@/lib/resume";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("resume");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Upload a PDF, DOCX, or text resume." }, { status: 400 });
  }

  const text = (await extractResumeText(file)).replace(/\s+\n/g, "\n").trim();
  if (text.length < 80) {
    return NextResponse.json({ error: "Resume text is too short to scan. Try another file." }, { status: 400 });
  }

  const analysis = await summarizeResume(text);
  const resume = await prisma.resume.create({
    data: {
      userId: user.id,
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      text,
      summary: analysis.summary,
      skills: analysis.skills ?? []
    }
  });

  const chunks = chunkText(text);
  for (const chunk of chunks.slice(0, 10)) {
    const created = await prisma.resumeChunk.create({
      data: {
        resumeId: resume.id,
        content: chunk
      }
    });
    const embedding = await createEmbedding(chunk);
    if (embedding) {
      await prisma.$executeRawUnsafe(
        `UPDATE "ResumeChunk" SET embedding = $1::vector WHERE id = $2`,
        `[${embedding.join(",")}]`,
        created.id
      );
    }
  }

  return NextResponse.json({
    resume: {
      id: resume.id,
      fileName: resume.fileName,
      summary: resume.summary,
      skills: resume.skills
    }
  });
}
