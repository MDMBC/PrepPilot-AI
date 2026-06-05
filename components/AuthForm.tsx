"use client";

import { useState } from "react";

export function AuthForm({
  mode,
  title,
  subtitle,
  footer,
  initialStatus = ""
}: {
  mode: "signup" | "login";
  title: string;
  subtitle: string;
  footer: React.ReactNode;
  initialStatus?: string;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setStatus("");

    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));
    setIsLoading(false);

    if (!response.ok) {
      setStatus(data.error ?? "Something went wrong.");
      return;
    }

    if (mode === "login") {
      window.location.href = "/dashboard";
      return;
    }

    setStatus("Account created. Check your registered email for the verification code.");
    window.location.href = `/verify-email?email=${encodeURIComponent(String(data.email ?? ""))}`;
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_18%_12%,rgba(32,214,191,.2),transparent_34rem),radial-gradient(circle_at_88%_6%,rgba(93,140,255,.18),transparent_30rem),linear-gradient(135deg,#050a13,#07111f_48%,#0b1424)] px-5">
      <section className="w-full max-w-lg rounded-lg border border-white/10 bg-[#0c1828]/90 p-8 shadow-panel backdrop-blur">
        <div className="mb-7 flex items-center gap-3 font-black">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-teal text-[#041016] shadow-[0_0_28px_rgba(32,214,191,.28)]">P</span>
          PrepPilot AI
        </div>
        <h1 className="text-3xl font-black">{title}</h1>
        <p className="mt-3 leading-7 text-muted">{subtitle}</p>
        <form className="mt-7 grid gap-4" onSubmit={submit}>
          {mode === "signup" ? (
            <label className="grid gap-2 text-sm font-black text-muted">
              Full name
              <input name="name" required className="focus-ring rounded-lg border border-white/10 bg-[#07111f] px-4 py-3 text-ink" />
            </label>
          ) : null}
          <label className="grid gap-2 text-sm font-black text-muted">
            Email
            <input name="email" type="email" required className="focus-ring rounded-lg border border-white/10 bg-[#07111f] px-4 py-3 text-ink" />
          </label>
          <label className="grid gap-2 text-sm font-black text-muted">
            Password
            <input name="password" type="password" minLength={8} required className="focus-ring rounded-lg border border-white/10 bg-[#07111f] px-4 py-3 text-ink" />
          </label>
          <button disabled={isLoading} className="rounded-lg bg-teal px-5 py-3 font-black text-[#041016] shadow-panel disabled:opacity-60">
            {isLoading ? "Working..." : mode === "signup" ? "Create account" : "Login"}
          </button>
        </form>
        {status ? <p className="mt-5 rounded-lg border border-white/10 bg-white/5 p-3 text-sm font-bold text-muted">{status}</p> : null}
        <p className="mt-6 text-center text-sm text-muted">{footer}</p>
      </section>
    </main>
  );
}
