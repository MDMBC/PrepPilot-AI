import OpenAI from "openai";

export const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

const aiProvider = (process.env.AI_PROVIDER ?? "openai").toLowerCase();
const geminiApiKey = process.env.GEMINI_API_KEY;
const geminiBaseUrl = process.env.GEMINI_BASE_URL ?? "https://generativelanguage.googleapis.com/v1beta";
const geminiChatModel = process.env.GEMINI_CHAT_MODEL ?? "gemini-2.5-flash";
const geminiEmbeddingModel = process.env.GEMINI_EMBEDDING_MODEL ?? "gemini-embedding-001";

function geminiModelName(model: string) {
  return model.startsWith("models/") ? model.slice("models/".length) : model;
}

async function callGemini<T>(model: string, action: "generateContent" | "embedContent", body: unknown): Promise<T | null> {
  if (!geminiApiKey) return null;

  try {
    const url = `${geminiBaseUrl}/models/${geminiModelName(model)}:${action}?key=${encodeURIComponent(geminiApiKey)}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function generateGeminiJson<T>(prompt: string, fallback: T): Promise<T> {
  const response = await callGemini<{ candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }>(
    geminiChatModel,
    "generateContent",
    {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json"
      }
    }
  );

  const text = response?.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("");
  if (!text) return fallback;

  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

async function createGeminiEmbedding(text: string) {
  const response = await callGemini<{ embedding?: { values?: number[] } }>(
    geminiEmbeddingModel,
    "embedContent",
    {
      content: {
        parts: [
          {
            text: text.slice(0, 8000)
          }
        ]
      }
    }
  );

  return response?.embedding?.values ?? null;
}

export async function generateJson<T>(prompt: string, fallback: T): Promise<T> {
  if (aiProvider === "gemini") {
    return generateGeminiJson(prompt, fallback);
  }

  if (!openai) return fallback;

  const response = await openai.responses.create({
    model: "gpt-4o-mini",
    input: prompt,
    text: {
      format: {
        type: "json_object"
      }
    }
  });

  const text = response.output_text;
  if (!text) return fallback;

  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

export async function createEmbedding(text: string) {
  if (aiProvider === "gemini") {
    return createGeminiEmbedding(text);
  }

  if (!openai) return null;
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text.slice(0, 8000)
  });
  return response.data[0]?.embedding ?? null;
}

export async function transcribeAudio(file: File) {
  if (!openai) return "";
  return openai.audio.transcriptions.create({
    file,
    model: "gpt-4o-transcribe",
    response_format: "text"
  });
}
