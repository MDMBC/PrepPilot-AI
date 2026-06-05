"use client";

import { useState } from "react";

export function ForgotPasswordForm() {
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setIsLoading(true);

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email") })
    });
    const data = await response.json().catch(() => ({}));
    setIsLoading(false);

    if (!response.ok) {
      setStatus(data.error ?? "Could not send the reset email.");
      return;
    }

    setStatus("Password reset link sent to your registered email.");
  }

  return (
    <form className="mt-7 grid gap-4" onSubmit={submit}>
      <label className="grid gap-2 text-sm font-black text-muted">
        Registered email
        <input name="email" type="email" required className="focus-ring rounded-lg border border-white/10 bg-[#07111f] px-4 py-3 text-ink" />
      </label>
      <button disabled={isLoading} className="rounded-lg bg-teal px-5 py-3 font-black text-[#041016] shadow-panel disabled:opacity-60">
        {isLoading ? "Sending..." : "Send reset link"}
      </button>
      {status ? <p className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm font-bold text-muted">{status}</p> : null}
    </form>
  );
}
