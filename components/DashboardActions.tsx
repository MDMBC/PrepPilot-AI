"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ActionButtonProps = {
  endpoint: string;
  method: "DELETE" | "PATCH";
  label: string;
  busyLabel: string;
  confirmMessage: string;
  className?: string;
};

export function DashboardActionButton({ endpoint, method, label, busyLabel, confirmMessage, className }: ActionButtonProps) {
  const router = useRouter();
  const [isBusy, setIsBusy] = useState(false);

  async function runAction() {
    if (isBusy || !window.confirm(confirmMessage)) return;

    setIsBusy(true);
    const response = await fetch(endpoint, { method });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      window.alert(data.error ?? "Could not complete that action.");
      setIsBusy(false);
      return;
    }

    router.refresh();
    setIsBusy(false);
  }

  return (
    <button
      type="button"
      disabled={isBusy}
      onClick={runAction}
      className={
        className ??
        "rounded-lg border border-coral/40 bg-coral/10 px-3 py-2 text-sm font-black text-coral transition hover:border-coral hover:bg-coral/20 disabled:opacity-60"
      }
    >
      {isBusy ? busyLabel : label}
    </button>
  );
}
