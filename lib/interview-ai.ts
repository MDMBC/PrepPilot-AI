import type { Difficulty, InterviewType } from "@prisma/client";
import { generateJson } from "@/lib/openai";

export type GeneratedQuestion = {
  text: string;
  focusArea: string;
};

export type AnswerFeedback = {
  grammarScore: number;
  pronunciationScore: number;
  relevanceScore: number;
  structureScore: number;
  confidenceScore: number;
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestion: string;
};

export async function generateQuestions(input: {
  resumeText?: string;
  resumeSummary?: string | null;
  skills?: string[];
  role: string;
  difficulty: Difficulty;
  interviewType: InterviewType;
  sessionSeed?: string;
  avoidedQuestions?: string[];
}) {
  const fallback = fallbackQuestions(input.role, input.interviewType, input.sessionSeed);
  return generateJson<{ questions: GeneratedQuestion[] }>(
    `Create a real-world ${input.interviewType} mock interview for ${input.role}.
Difficulty: ${input.difficulty}.
Use the resume details to ask specific, sequential questions. Ask only one question at a time in the UI, but return all questions now.
This is a brand-new session. Generate a fresh set of practical, real-world questions instead of reusing generic or previously asked wording.
Session variation seed: ${input.sessionSeed ?? "none"}
Avoid repeating these recent questions or close paraphrases:
${(input.avoidedQuestions ?? []).slice(0, 28).map((question) => `- ${question}`).join("\n") || "- None"}
The interview must feel like a real panel, include resume-based followups, scenario-based questions from workplace situations, and include grammar/pronunciation relevance in later evaluation.
Return strict JSON: {"questions":[{"text":"...","focusArea":"..."}]} with exactly 7 questions.

Resume summary: ${input.resumeSummary ?? "No resume summary"}
Skills: ${(input.skills ?? []).join(", ") || "Not provided"}
Resume excerpts:
${input.resumeText?.slice(0, 9000) ?? "No resume uploaded"}`,
    { questions: fallback }
  );
}

export async function evaluateAnswer(input: {
  question: string;
  transcript: string;
  role: string;
  interviewType: InterviewType;
  difficulty: Difficulty;
  resumeSummary?: string | null;
}) {
  const heuristic = heuristicFeedback(input.transcript);
  return generateJson<AnswerFeedback>(
    `Evaluate this spoken interview answer for a ${input.interviewType} ${input.role} interview.
Difficulty: ${input.difficulty}
Question: ${input.question}
Resume context: ${input.resumeSummary ?? "No resume summary"}
Transcript: ${input.transcript}

Return strict JSON with integer scores 0-100:
grammarScore, pronunciationScore, relevanceScore, structureScore, confidenceScore, overallScore,
strengths array, weaknesses array, suggestion string.
Focus on real interview performance, grammar, clarity, pronunciation indicators, answer sequence, and role relevance.`,
    heuristic
  );
}

export async function generateFinalReport(input: {
  role: string;
  interviewType: InterviewType;
  difficulty: Difficulty;
  answers: Array<{ question: string; transcript: string; score: number }>;
  resumeSummary?: string | null;
}) {
  const average = Math.round(input.answers.reduce((sum, answer) => sum + answer.score, 0) / Math.max(1, input.answers.length));
  return generateJson<{
    finalScore: number;
    reportText: string;
    strengths: string[];
    improvements: string[];
    nextPlan: string[];
  }>(
    `Write a final AI interview report.
Role: ${input.role}
Round: ${input.interviewType}
Difficulty: ${input.difficulty}
Resume: ${input.resumeSummary ?? "No resume summary"}
Answers: ${JSON.stringify(input.answers)}

Return strict JSON: finalScore number, reportText paragraph-style report, strengths array, improvements array, nextPlan array.
Include grammar, pronunciation, confidence, answer structure, resume-role alignment, and specific next practice suggestions.`,
    {
      finalScore: average,
      reportText: "The interview showed a workable foundation. Improve answer structure, measurable outcomes, grammar precision, and concise delivery before the next round.",
      strengths: ["Relevant examples", "Clear intent"],
      improvements: ["Add measurable outcomes", "Use tighter STAR structure", "Practice pronunciation and pacing"],
      nextPlan: ["Practice two HR answers", "Practice two technical explanations", "Review grammar and filler words"]
    }
  );
}

function fallbackQuestions(role: string, type: InterviewType, seed = ""): GeneratedQuestion[] {
  const variant = hashSeed(seed) % 4;

  if (type === "HR") {
    const sets = [
      [
        { text: `Introduce yourself for a ${role} interview using your resume as context.`, focusArea: "Introduction" },
        { text: "Tell me about a challenging project and your specific contribution.", focusArea: "Ownership" },
        { text: "Describe a time you handled feedback or disagreement.", focusArea: "Collaboration" },
        { text: "What strengths make you suitable for this role?", focusArea: "Role fit" },
        { text: "Tell me about a failure and what changed after it.", focusArea: "Reflection" },
        { text: "Why do you want this role and company type?", focusArea: "Motivation" },
        { text: "Do you have any questions for the interviewer?", focusArea: "Closure" }
      ],
      [
        { text: `Walk me through your background as if this were the opening minute of a ${role} interview.`, focusArea: "Introduction" },
        { text: "Describe a workplace situation where you had to learn quickly and still deliver.", focusArea: "Adaptability" },
        { text: "Tell me about a time you worked with someone whose style was different from yours.", focusArea: "Collaboration" },
        { text: "Which achievement on your resume would matter most to this role, and why?", focusArea: "Role fit" },
        { text: "Give an example of a deadline pressure situation and how you handled tradeoffs.", focusArea: "Prioritization" },
        { text: "What kind of manager or team environment helps you do your best work?", focusArea: "Work style" },
        { text: "What would you want to learn in the first 30 days if selected?", focusArea: "Closure" }
      ],
      [
        { text: `Give me a concise professional summary tailored to a ${role} opening.`, focusArea: "Introduction" },
        { text: "Tell me about a time you improved a process, project, or team outcome.", focusArea: "Impact" },
        { text: "Describe a real conflict or misunderstanding and how you resolved it.", focusArea: "Communication" },
        { text: "Which resume experience best proves you can succeed in this role?", focusArea: "Evidence" },
        { text: "Tell me about a mistake you caught late and what you did next.", focusArea: "Accountability" },
        { text: "How do you stay motivated when work becomes repetitive or unclear?", focusArea: "Motivation" },
        { text: "What is one thoughtful question you would ask this interview panel?", focusArea: "Closure" }
      ],
      [
        { text: `Start with your career story and connect it to a ${role} position.`, focusArea: "Introduction" },
        { text: "Describe a time you had to explain something complex to a non-expert.", focusArea: "Communication" },
        { text: "Tell me about a moment when you took initiative without being asked.", focusArea: "Initiative" },
        { text: "What is the strongest proof of reliability in your resume?", focusArea: "Reliability" },
        { text: "How did you respond the last time priorities changed unexpectedly?", focusArea: "Adaptability" },
        { text: "What gap in your profile are you actively working to improve?", focusArea: "Growth" },
        { text: "Close this interview by summarizing why we should move you forward.", focusArea: "Closing pitch" }
      ]
    ];
    return sets[variant];
  }

  const sets = [
    [
      { text: `Explain the most relevant project on your resume for a ${role} role.`, focusArea: "Project depth" },
      { text: "Walk me through the architecture, tools, and tradeoffs in that project.", focusArea: "Technical reasoning" },
      { text: "Describe a technical bug or blocker and how you debugged it.", focusArea: "Debugging" },
      { text: "Which skill from your resume is strongest, and how can you prove it?", focusArea: "Skill evidence" },
      { text: "How would you improve the scalability, quality, or reliability of your project?", focusArea: "Improvement" },
      { text: "Answer a role-specific scenario where requirements change midway.", focusArea: "Adaptability" },
      { text: "Summarize why your technical profile fits this role.", focusArea: "Closing pitch" }
    ],
    [
      { text: `Pick one project and explain the real user or business problem it solved for a ${role} role.`, focusArea: "Project impact" },
      { text: "If this project suddenly had ten times more users, what would break first and how would you prepare?", focusArea: "Scalability" },
      { text: "Tell me about a bug that was hard to reproduce and the exact debugging path you used.", focusArea: "Debugging" },
      { text: "How would you validate that your solution is correct before shipping it?", focusArea: "Quality" },
      { text: "Describe a technical tradeoff where you chose a simpler solution over a more advanced one.", focusArea: "Judgment" },
      { text: "Imagine a stakeholder asks for a feature that adds risk. How would you respond technically?", focusArea: "Requirements" },
      { text: "Which technical habit from your resume would make you effective on our team?", focusArea: "Closing pitch" }
    ],
    [
      { text: `Walk me through a technical achievement that best matches a ${role} position.`, focusArea: "Project depth" },
      { text: "Design a small improvement to that project that would make it easier to maintain.", focusArea: "Maintainability" },
      { text: "Explain how you would investigate a production issue with incomplete logs.", focusArea: "Incident response" },
      { text: "What metrics would you track to know whether your work is successful?", focusArea: "Measurement" },
      { text: "Describe how you handle code or design feedback that you initially disagree with.", focusArea: "Collaboration" },
      { text: "How would you onboard another person to your project quickly and safely?", focusArea: "Documentation" },
      { text: "Give a concise technical pitch for why your experience fits this role.", focusArea: "Closing pitch" }
    ],
    [
      { text: `Choose a resume project and explain it from requirements through final outcome for a ${role} interview.`, focusArea: "Project depth" },
      { text: "What was the riskiest technical assumption in that work, and how did or would you test it?", focusArea: "Risk" },
      { text: "Describe a time you had to learn a tool, framework, or concept under time pressure.", focusArea: "Learning speed" },
      { text: "How would you refactor part of your project if you had one more week?", focusArea: "Refactoring" },
      { text: "Suppose your solution passes tests but users still complain. What would you inspect next?", focusArea: "User impact" },
      { text: "Explain a technical decision from your resume to a non-technical manager.", focusArea: "Communication" },
      { text: "Close by mapping your strongest technical evidence to this role's needs.", focusArea: "Closing pitch" }
    ]
  ];
  return sets[variant];
}

function hashSeed(seed: string) {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function heuristicFeedback(transcript: string): AnswerFeedback {
  const words = transcript.trim().split(/\s+/).filter(Boolean);
  const text = transcript.toLowerCase();
  const hasResult = /\d|percent|increased|reduced|improved|saved|users|revenue|accuracy/.test(text);
  const hasStructure = /situation|task|action|result|challenge|solution|outcome/.test(text);
  const hasReflection = /learned|feedback|next time|improve|tradeoff|risk/.test(text);
  const grammarScore = Math.min(94, 62 + Math.round(words.length / 8) + (/[.?!]/.test(transcript) ? 8 : 0));
  const structureScore = Math.min(96, 58 + (hasStructure ? 18 : 0) + (hasResult ? 10 : 0));
  const relevanceScore = Math.min(95, 60 + Math.round(words.length / 10) + (hasResult ? 12 : 0));
  const pronunciationScore = Math.min(92, 68 + (words.length > 60 ? 8 : 0));
  const confidenceScore = Math.min(94, 60 + (hasReflection ? 12 : 0) + (words.length > 80 ? 10 : 0));
  const overallScore = Math.round((grammarScore + structureScore + relevanceScore + pronunciationScore + confidenceScore) / 5);

  return {
    grammarScore,
    pronunciationScore,
    relevanceScore,
    structureScore,
    confidenceScore,
    overallScore,
    strengths: ["Relevant answer direction", "Professional tone"],
    weaknesses: hasResult ? ["Opening can be tighter"] : ["Add measurable outcomes"],
    suggestion: hasResult
      ? "Keep the result, but lead with it earlier and reduce setup time."
      : "Add one quantified result and close with what changed because of your action."
  };
}
