# PrepPilot AI

AI-powered interview preparation platform with resume analysis, mock interviews, performance scoring, and personalized learning roadmaps.

PrepPilot AI is a full-stack interview preparation app built with Next.js, TypeScript, Tailwind CSS, Next API routes, Prisma, PostgreSQL, pgvector, and Gemini/OpenAI provider support.

## Problem Statement

Many students struggle to prepare effectively for technical and HR interviews due to a lack of personalized guidance and realistic practice opportunities.

## Solution

PrepPilot AI provides resume analysis, AI-generated interview questions, mock interview practice, performance scoring, personalized learning roadmaps, and a progress dashboard.

## Features

- Signup, email verification, login, and session cookies
- Resume upload and parsing for PDF, DOCX, and text files
- Resume summary, skill extraction, chunking, and optional pgvector embeddings
- HR or technical mock interviews with role and difficulty selection
- AI-generated voice questions asked one by one
- Browser speech recognition for user answers
- AI answer evaluation for grammar, pronunciation, relevance, structure, confidence, and final score
- Dashboard with interview history, resume scans, scores, reports, and improvement suggestions

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL with pgvector
- Gemini API
- Optional OpenAI transcription
- Nodemailer SMTP

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and set:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/preppilot_ai?schema=public"
AI_PROVIDER="gemini"
GEMINI_API_KEY="your-gemini-api-key"
GEMINI_BASE_URL="https://generativelanguage.googleapis.com/v1beta"
GEMINI_CHAT_MODEL="gemini-2.5-flash"
GEMINI_EMBEDDING_MODEL="gemini-embedding-001"
NEXT_PUBLIC_APP_URL="http://localhost:3010"
```

`OPENAI_API_KEY` is optional. Add it only if you want server-side audio transcription support.

3. Start a PostgreSQL database with pgvector:

```bash
docker compose up -d postgres
```

If you use your own PostgreSQL server instead, create the `preppilot_ai` database and make sure pgvector is available. The Prisma migration includes:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

4. Generate Prisma and migrate:

```bash
npm run prisma:generate
npm run prisma:migrate
```

5. Start the app:

```bash
npm run dev -- -p 3010
```

Open `http://localhost:3010`.

## Email Verification

Real email sending is required for verification and password reset. Add SMTP credentials for your email provider:

```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-address@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="PrepPilot AI <your-address@gmail.com>"
```

For Gmail, use an app password rather than your normal account password. Users are saved in PostgreSQL at signup, but login is blocked until verification sets `emailVerifiedAt`.

## Password Reset

The sign-in page includes a forgot-password link. PrepPilot sends a secure reset link to the registered email address, the link expires after 1 hour, and active sessions are cleared after the password changes.

## Deploying on Render

This repository includes a `render.yaml` Blueprint that creates:

- A Node web service for the Next.js app
- A Render Postgres database connected through `DATABASE_URL`
- A pre-deploy step that runs Prisma migrations with `npm run prisma:deploy`

Before deploying, commit your Prisma migrations and code changes. Render uses production migrations, so do not use `prisma migrate dev` in production.

1. Push the repository to GitHub or GitLab.
2. In Render, create a new Blueprint from the repository.
3. When Render prompts for secret environment variables, provide:

```bash
GEMINI_API_KEY="your-gemini-api-key"
NEXT_PUBLIC_APP_URL="https://your-render-service.onrender.com"
SMTP_HOST="smtp.gmail.com"
SMTP_USER="your-address@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="PrepPilot AI <your-address@gmail.com>"
```

The Render database is configured with external access blocked in `render.yaml`. The app still connects through Render's private database connection string. The Prisma schema enables the `vector` extension for resume embeddings, and Render Postgres supports pgvector.

## AI Provider Behavior

The app uses the configured AI provider for resume analysis, embeddings, question generation, answer scoring, and final reports. Set `AI_PROVIDER="gemini"` to use Gemini or `AI_PROVIDER="openai"` to use OpenAI. Speech transcription still uses OpenAI when `OPENAI_API_KEY` is available because Gemini text generation and embedding endpoints do not replace the app's audio transcription flow. If the configured provider is unavailable, the interview flow falls back to deterministic templates and heuristic scoring so the product remains demoable.
