import mammoth from "mammoth";
import pdf from "pdf-parse";
import { generateJson } from "@/lib/openai";

export async function extractResumeText(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const name = file.name.toLowerCase();

  if (file.type === "application/pdf" || name.endsWith(".pdf")) {
    const parsed = await pdf(buffer);
    return parsed.text;
  }

  if (name.endsWith(".docx")) {
    const parsed = await mammoth.extractRawText({ buffer });
    return parsed.value;
  }

  return buffer.toString("utf8");
}

export function chunkText(text: string, maxLength = 1400) {
  const paragraphs = text.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean);
  const chunks: string[] = [];
  let current = "";

  for (const paragraph of paragraphs) {
    if (`${current}\n\n${paragraph}`.length > maxLength && current) {
      chunks.push(current);
      current = paragraph;
    } else {
      current = [current, paragraph].filter(Boolean).join("\n\n");
    }
  }

  if (current) chunks.push(current);
  return chunks.length ? chunks : [text.slice(0, maxLength)];
}

export async function summarizeResume(text: string) {
  const fallback = {
    summary: "Resume scanned. Use the extracted skills and project history to personalize interview questions.",
    skills: inferSkills(text)
  };

  return generateJson(
    `You are an interview coach. Read this resume and return strict JSON with keys summary and skills.
The summary must be one concise paragraph. skills must be an array of 6 to 12 role-relevant skills.

Resume:
${text.slice(0, 9000)}`,
    fallback
  );
}

function inferSkills(text: string) {
  const common = ["JavaScript", "TypeScript", "React", "Node.js", "Python", "SQL", "Machine Learning", "Communication", "Leadership", "Data Analysis"];
  const lower = text.toLowerCase();
  return common.filter((skill) => lower.includes(skill.toLowerCase())).slice(0, 10);
}
