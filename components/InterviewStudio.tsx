"use client";

import { useMemo, useRef, useState } from "react";

type ResumeOption = {
  id: string;
  fileName: string;
  summary: string | null;
  skills: string[];
};

type Question = {
  id: string;
  sequence: number;
  text: string;
  focusArea: string;
};

type SessionState = {
  sessionId: string;
  question: Question;
  totalQuestions: number;
};

const recognitionFactory = () => {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
};

export function InterviewStudio({ resumes }: { resumes: ResumeOption[] }) {
  const [resumeList, setResumeList] = useState(resumes);
  const [selectedResumeId, setSelectedResumeId] = useState(resumes[0]?.id ?? "");
  const [role, setRole] = useState("Software Engineer");
  const [difficulty, setDifficulty] = useState("INTERMEDIATE");
  const [interviewType, setInterviewType] = useState("TECHNICAL");
  const [mode, setMode] = useState("VOICE_MOCK");
  const [session, setSession] = useState<SessionState | null>(null);
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState("Upload a resume or start with your saved resume.");
  const [latestFeedback, setLatestFeedback] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const draftBaseRef = useRef("");

  const currentResume = useMemo(() => resumeList.find((resume) => resume.id === selectedResumeId), [resumeList, selectedResumeId]);

  async function uploadResume(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setStatus("Scanning resume and extracting role signals...");
    const form = new FormData();
    form.append("resume", file);
    const response = await fetch("/api/resume/upload", { method: "POST", body: form });
    const data = await response.json();

    if (!response.ok) {
      setStatus(data.error ?? "Resume upload failed.");
      return;
    }

    setResumeList((items) => [data.resume, ...items]);
    setSelectedResumeId(data.resume.id);
    setStatus("Resume scanned. AI questions will now use its skills and projects.");
  }

  async function deleteResume(resumeId: string) {
    if (!window.confirm("Delete this resume from your saved resumes?")) return;

    setStatus("Deleting saved resume...");
    const response = await fetch(`/api/resume/${resumeId}`, { method: "DELETE" });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setStatus(data.error ?? "Could not delete resume.");
      return;
    }

    setResumeList((items) => {
      const nextItems = items.filter((resume) => resume.id !== resumeId);
      if (selectedResumeId === resumeId) setSelectedResumeId(nextItems[0]?.id ?? "");
      return nextItems;
    });
    setStatus("Resume deleted from your saved resumes.");
  }

  async function startSession() {
    setStatus("Generating resume-aware interview questions...");
    const response = await fetch("/api/interview/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeId: selectedResumeId || null, role, difficulty, interviewType, mode })
    });
    const data = await response.json();

    if (!response.ok) {
      setStatus(data.error ?? "Could not start interview.");
      return;
    }

    setSession(data);
    setTranscript("");
    setLatestFeedback(null);
    setStatus("Question 1 is ready. Use AI voice, answer, then click OK to continue.");
    speak(data.question.text);
  }

  function speak(text: string) {
    if (!("speechSynthesis" in window)) {
      setStatus("Browser speech playback is not available.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }

  function toggleRecording() {
    const Recognition = recognitionFactory();
    if (!Recognition) {
      setStatus("Browser speech recognition is not available. You can still type your answer.");
      return;
    }

    if (!recognitionRef.current) {
      const recognition = new Recognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.onresult = (event: any) => {
        let finalText = "";
        let interimText = "";
        for (let i = 0; i < event.results.length; i += 1) {
          const segment = event.results[i][0].transcript;
          if (event.results[i].isFinal) finalText += segment;
          else interimText += segment;
        }
        setTranscript([draftBaseRef.current, finalText, interimText].filter(Boolean).join(" ").trim());
      };
      recognition.onend = () => {
        setIsRecording(false);
        setStatus("Recording stopped. Click OK to evaluate and unlock the next question.");
      };
      recognitionRef.current = recognition;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      return;
    }

    draftBaseRef.current = transcript.trim();
    setIsRecording(true);
    setStatus("Listening to your answer...");
    recognitionRef.current.start();
  }

  async function submitAnswer() {
    if (!session) return;
    if (!transcript.trim()) {
      setStatus("Answer the current question before moving to the next one.");
      return;
    }

    setStatus("Evaluating pronunciation, grammar, structure, relevance, and confidence...");
    const response = await fetch("/api/interview/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: session.sessionId, questionId: session.question.id, transcript })
    });
    const data = await response.json();

    if (!response.ok) {
      setStatus(data.error ?? "Evaluation failed.");
      return;
    }

    setLatestFeedback(data.feedback);
    setTranscript("");

    if (data.completed) {
      setSession(null);
      setStatus("Interview completed. Opening your AI-generated report...");
      window.location.href = `/reports/${data.sessionId}`;
      return;
    }

    setSession({ sessionId: data.sessionId, question: data.nextQuestion, totalQuestions: data.totalQuestions });
    setStatus(`Question ${data.nextQuestion.sequence + 1} is ready. AI voice will ask it now.`);
    speak(data.nextQuestion.text);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
      <section className="rounded-lg border border-white/10 bg-[#0c1828]/90 p-5 shadow-panel">
        <p className="text-sm font-black uppercase text-teal">Interview setup</p>
        <h1 className="mt-2 text-3xl font-black">Resume-aware mock interview</h1>
        <p className="mt-3 leading-7 text-muted">
          Choose HR or technical, select difficulty, upload a resume, then let AI ask questions one by one like a real interview panel.
        </p>

        <div className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm font-black text-muted">
            Upload resume
            <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={uploadResume} className="focus-ring rounded-lg border border-white/10 bg-[#07111f] px-4 py-3 text-ink" />
          </label>
          <label className="grid gap-2 text-sm font-black text-muted">
            Saved resume
            <select value={selectedResumeId} onChange={(event) => setSelectedResumeId(event.target.value)} className="focus-ring rounded-lg border border-white/10 bg-[#07111f] px-4 py-3 text-ink">
              <option value="">No resume selected</option>
              {resumeList.map((resume) => (
                <option key={resume.id} value={resume.id}>{resume.fileName}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-black text-muted">
            Target role
            <input value={role} onChange={(event) => setRole(event.target.value)} className="focus-ring rounded-lg border border-white/10 bg-[#07111f] px-4 py-3 text-ink" />
          </label>
          <div className="grid gap-3 md:grid-cols-3">
            <label className="grid gap-2 text-sm font-black text-muted">
              Round
              <select value={interviewType} onChange={(event) => setInterviewType(event.target.value)} className="focus-ring rounded-lg border border-white/10 bg-[#07111f] px-4 py-3 text-ink">
                <option value="HR">HR interview</option>
                <option value="TECHNICAL">Technical interview</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-black text-muted">
              Difficulty
              <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)} className="focus-ring rounded-lg border border-white/10 bg-[#07111f] px-4 py-3 text-ink">
                <option value="FOUNDATION">Foundation</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-black text-muted">
              Mode
              <select value={mode} onChange={(event) => setMode(event.target.value)} className="focus-ring rounded-lg border border-white/10 bg-[#07111f] px-4 py-3 text-ink">
                <option value="VOICE_MOCK">Voice mock</option>
                <option value="ASSISTED_PRACTICE">Assisted practice</option>
              </select>
            </label>
          </div>
          <button onClick={startSession} className="rounded-lg bg-teal px-5 py-3 font-black text-[#041016] shadow-panel">Generate interview</button>
        </div>

        {currentResume ? (
          <article className="mt-5 rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <strong className="min-w-0 flex-1">{currentResume.fileName}</strong>
              <button
                type="button"
                onClick={() => deleteResume(currentResume.id)}
                className="rounded-lg border border-coral/40 bg-coral/10 px-3 py-2 text-sm font-black text-coral transition hover:border-coral hover:bg-coral/20"
              >
                Delete
              </button>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted">{currentResume.summary ?? "Resume scan ready."}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {currentResume.skills.slice(0, 8).map((skill) => (
                <span key={skill} className="rounded-full border border-teal/20 bg-teal/10 px-3 py-1 text-xs font-black text-teal">{skill}</span>
              ))}
            </div>
          </article>
        ) : null}
      </section>

      <section className="rounded-lg border border-white/10 bg-[#0c1828]/90 p-5 shadow-panel">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase text-teal">Live mock interview</p>
            <h2 className="mt-2 text-3xl font-black">AI voice interviewer</h2>
          </div>
          <button disabled={!session} onClick={() => session && speak(session.question.text)} className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 font-black transition hover:border-teal/60 hover:bg-white/10 disabled:opacity-50">
            Replay voice
          </button>
        </div>

        <div className="mt-5 rounded-lg border border-teal/20 bg-[#07111f] p-5 text-white shadow-inner">
          <span className="text-sm font-black text-white/60">{session ? `Question ${session.question.sequence + 1} of ${session.totalQuestions} / ${session.question.focusArea}` : "Waiting to start"}</span>
          <p className="mt-3 text-xl font-black leading-8">{session?.question.text ?? "Start a session to generate the first question."}</p>
        </div>

        <label className="mt-5 grid gap-2 text-sm font-black text-muted">
          Your answer transcript
          <textarea value={transcript} onChange={(event) => setTranscript(event.target.value)} rows={8} className="focus-ring rounded-lg border border-white/10 bg-[#07111f] px-4 py-3 text-ink" placeholder="Speak or type your answer here..." />
        </label>

        <div className="mt-4 flex flex-wrap gap-3">
          <button disabled={!session} onClick={toggleRecording} className={`rounded-lg px-5 py-3 font-black text-white disabled:opacity-50 ${isRecording ? "bg-coral" : "bg-ocean"}`}>
            {isRecording ? "Stop recording" : "Record voice"}
          </button>
          <button disabled={!session} onClick={submitAnswer} className="rounded-lg bg-teal px-5 py-3 font-black text-white disabled:opacity-50">
            OK, evaluate and continue
          </button>
        </div>
        <p className="mt-4 rounded-lg border border-white/10 bg-white/5 p-3 text-sm font-bold text-muted">{status}</p>

        {latestFeedback ? (
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {[
              ["Overall", latestFeedback.overallScore],
              ["Grammar", latestFeedback.grammarScore],
              ["Pronunciation", latestFeedback.pronunciationScore],
              ["Relevance", latestFeedback.relevanceScore]
            ].map(([label, score]) => (
              <div key={label} className="rounded-lg border border-white/10 bg-white/5 p-4">
                <span className="text-sm font-black text-muted">{label}</span>
                <strong className="mt-1 block text-3xl font-black text-teal">{score}</strong>
              </div>
            ))}
            <div className="rounded-lg border border-white/10 bg-white/5 p-4 md:col-span-2">
              <strong>AI suggestion</strong>
              <p className="mt-2 leading-7 text-muted">{latestFeedback.suggestion}</p>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
