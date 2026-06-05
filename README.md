# PrepPilot AI - AI Interview Preparation Platform

## GitHub Handle

MDMBC

## Project Title

PrepPilot AI: AI-Powered Interview Preparation Platformwith resume analysis, mock interviews, performance scoring, and personalized learning roadmaps.

PrepPilot AI is a full-stack interview preparation app built with Next.js, TypeScript, Tailwind CSS, Next API routes, Prisma, PostgreSQL, pgvector, and Gemini/OpenAI provider support.

## Problem Statement

Many students struggle to prepare effectively for technical and HR interviews due to a lack of personalized guidance and realistic practice opportunities.

## Solution

PrepPilot AI provides resume analysis, AI-generated interview questions, mock interview practice, performance scoring, personalized learning roadmaps, and a progress dashboard.

## Inspiration Behind the Project

Interview preparation remains one of the biggest challenges for students and early-career professionals. While countless learning resources exist online, most candidates lack access to personalized feedback and realistic interview practice.

Many students know the technical concepts required for a role but struggle to communicate effectively under interview pressure. Traditional preparation methods such as reading interview questions or watching videos do not simulate real interview environments and rarely provide actionable feedback.

I built PrepPilot AI to bridge this gap by creating a virtual AI interviewer capable of conducting personalized mock interviews, analyzing responses, identifying weaknesses, and generating improvement plans.

PrepPilot AI helps candidates:

* Practice interviews anytime, anywhere
* Receive instant AI-powered feedback
* Improve communication and confidence
* Track interview readiness over time
* Prepare for both HR and technical interviews
* Learn from personalized recommendations

The project showcases how modern AI technologies can democratize career preparation and provide affordable, accessible interview coaching at scale.

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

### Frontend & Framework

* Next.js 14
* React 18
* TypeScript
* Tailwind CSS
* App Router Architecture

### Backend & Database

* Next.js API Routes
* Prisma ORM
* PostgreSQL
* pgvector Extension

### AI & Machine Learning

* Google Gemini API
* OpenAI API (Optional Transcription Support)
* Resume Embeddings
* AI Question Generation
* AI Performance Evaluation

### Authentication & Communication

* Session-based Authentication
* Email Verification System
* Password Reset Workflow
* Nodemailer SMTP Integration

### Development Tools

* Docker
* Prisma Migrations
* ESLint
* TypeScript

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

## Deploying on Vercel with Neon

This project is deployed on Vercel and uses Neon PostgreSQL for the database.

Before deploying, commit your Prisma migrations and code changes. Use production migrations with `npm run prisma:deploy`; do not use `prisma migrate dev` in production.

1. Create a Neon PostgreSQL database.
2. Copy the Neon connection string and set it as `DATABASE_URL`.
3. Push the repository to GitHub.
4. Import the repository into Vercel.
5. In Vercel, add these environment variables:

```bash
DATABASE_URL="your-neon-postgres-connection-string"
AI_PROVIDER="gemini"
GEMINI_API_KEY="your-gemini-api-key"
GEMINI_BASE_URL="https://generativelanguage.googleapis.com/v1beta"
GEMINI_CHAT_MODEL="gemini-2.5-flash"
GEMINI_EMBEDDING_MODEL="gemini-embedding-001"
NEXT_PUBLIC_APP_URL="https://your-vercel-domain.vercel.app"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-address@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="PrepPilot AI <your-address@gmail.com>"
```

6. Run production migrations against Neon:

```bash
npm run prisma:deploy
```

7. Deploy the app from Vercel.

The Prisma schema enables the `vector` extension for resume embeddings, so make sure your Neon database supports the pgvector extension.

## AI Provider Behavior

The app uses the configured AI provider for resume analysis, embeddings, question generation, answer scoring, and final reports. Set `AI_PROVIDER="gemini"` to use Gemini or `AI_PROVIDER="openai"` to use OpenAI. Speech transcription still uses OpenAI when `OPENAI_API_KEY` is available because Gemini text generation and embedding endpoints do not replace the app's audio transcription flow. If the configured provider is unavailable, the interview flow falls back to deterministic templates and heuristic scoring so the product remains demoable.

---

## Project Repository

GitHub Repository:

https://github.com/MDMBC/PrepPilot-AI

---

## Deployed Site URL

https://prep-pilot-ai-rust.vercel.app/

---

## Demo Video

https://drive.google.com/file/d/1p522PdPyo5iXR4yrkbsMa9WpHNJywG_G/view?usp=drive_link

---

## Key Features Demonstrated

### 📄 Resume Intelligence

* Resume upload support (PDF, DOCX, TXT)
* Resume parsing and processing
* Skill extraction
* Resume summarization
* Semantic embeddings using pgvector

### 🎤 AI Mock Interviews

* HR Interview Mode
* Technical Interview Mode
* Difficulty Selection
* Role-based interview generation
* Dynamic AI-generated questions

### 🗣️ Voice Interaction

* AI voice-based questioning
* Browser speech recognition
* Hands-free interview experience
* Real interview simulation

### 🧠 AI Evaluation Engine

Detailed analysis of:

* Communication Skills
* Grammar
* Confidence
* Relevance
* Structure
* Technical Accuracy

Generates:

* Overall Performance Score
* Improvement Suggestions
* Personalized Feedback Reports

### 📊 Analytics Dashboard

* Interview History
* Performance Trends
* Resume Analysis Reports
* Learning Recommendations
* Progress Tracking

### 🔐 Authentication & Security

* User Registration
* Email Verification
* Secure Login Sessions
* Password Recovery System

---

## Technical Achievements

### Performance

* Fast AI-powered interview generation
* Vector-based resume intelligence
* Optimized PostgreSQL queries
* Efficient session handling

### Scalability

* Modular architecture
* AI provider abstraction
* Support for Gemini and OpenAI
* Production-ready deployment configuration

### Reliability

* Graceful fallback mechanisms
* Error handling
* Secure authentication flows
* Database-backed persistence

---

## Innovation & Uniqueness

* Resume-aware interview generation
* Voice-enabled interview simulations
* AI-powered scoring and coaching
* Personalized learning roadmaps
* Vector-search-powered resume intelligence
* End-to-end interview preparation ecosystem

Unlike traditional interview practice platforms, PrepPilot AI combines resume analysis, interview simulation, performance analytics, and AI coaching into a single unified platform.

---

## Impact & Use Cases

### For Students

* Placement preparation
* Internship interview practice
* Communication improvement
* Confidence building

### For Job Seekers

* Technical interview readiness
* Career transition support
* Personalized interview coaching
* Performance tracking

### For Universities

* Placement training support
* Student skill assessment
* Career readiness programs

### For Training Organizations

* Interview preparation programs
* Candidate evaluation
* Skill development initiatives

---

## Future Enhancements

* AI Interview Avatar
* Live Video Interview Simulation
* ATS Resume Scoring
* Industry-Specific Interview Tracks
* Peer-to-Peer Mock Interviews
* Mobile Applications (Android & iOS)
* Multilingual Interview Support
* Advanced Analytics Dashboard
* Company-Specific Interview Preparation
* Community Learning Features

---

## Why PrepPilot AI Stands Out

* Solves a real-world placement and hiring challenge
* Uses AI to provide personalized coaching
* Combines resume intelligence with interview simulation
* Supports voice-based interactions
* Generates actionable improvement plans
* Built with a scalable modern architecture
* Ready for real-world deployment and adoption
