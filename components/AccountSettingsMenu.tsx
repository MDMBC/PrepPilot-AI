"use client";

import { useState } from "react";

export function AccountSettingsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function deleteAccount() {
    if (isDeleting) return;
    const confirmed = window.confirm("Delete your PrepPilot AI account permanently? This removes your resumes, sessions, and reports.");
    if (!confirmed) return;

    setIsDeleting(true);
    const response = await fetch("/api/auth/account", { method: "DELETE" });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      window.alert(data.error ?? "Could not delete account.");
      setIsDeleting(false);
      return;
    }

    window.location.href = "/signup";
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Account settings"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((value) => !value)}
        className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/5 transition hover:border-teal/60 hover:bg-white/10"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.04.04a2 2 0 0 1-2.83 2.83l-.04-.04a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 0 1-4 0v-.06a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.04.04a2 2 0 0 1-2.83-2.83l.04-.04A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 0 1 0-4h.06A1.7 1.7 0 0 0 4.6 8a1.7 1.7 0 0 0-.34-1.88l-.04-.04a2 2 0 0 1 2.83-2.83l.04.04A1.7 1.7 0 0 0 9 3.6a1.7 1.7 0 0 0 1-1.56V2a2 2 0 0 1 4 0v.06a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.04-.04a2 2 0 0 1 2.83 2.83l-.04.04A1.7 1.7 0 0 0 19.4 8a1.7 1.7 0 0 0 1.56 1.03H21a2 2 0 0 1 0 4h-.06A1.7 1.7 0 0 0 19.4 15Z" />
        </svg>
      </button>

      {isOpen ? (
        <div className="absolute right-0 mt-3 w-48 rounded-lg border border-white/10 bg-[#0c1828] p-2 shadow-panel">
          <form action="/api/auth/logout" method="POST">
            <button className="w-full rounded-lg px-3 py-2 text-left font-black transition hover:bg-white/10">Logout</button>
          </form>
          <button
            type="button"
            disabled={isDeleting}
            onClick={deleteAccount}
            className="mt-1 w-full rounded-lg px-3 py-2 text-left font-black text-coral transition hover:bg-coral/10 disabled:opacity-60"
          >
            {isDeleting ? "Deleting..." : "Delete account"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
