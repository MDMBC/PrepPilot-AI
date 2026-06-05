import Link from "next/link";
import type { User } from "@prisma/client";
import { AccountSettingsMenu } from "@/components/AccountSettingsMenu";

export function DashboardShell({ children, user }: { children: React.ReactNode; user: Pick<User, "name" | "email"> }) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-[#07111f]/88 px-5 py-4 backdrop-blur md:px-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <Link href="/dashboard" className="flex items-center gap-3 font-black">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-teal text-[#041016] shadow-[0_0_24px_rgba(32,214,191,.25)]">P</span>
            PrepPilot AI
          </Link>
          <nav className="flex items-center gap-5 text-sm font-bold">
            <Link href="/interview">Mock interview</Link>
            <Link href="/dashboard">Dashboard</Link>
            <AccountSettingsMenu />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-8 md:px-10">
        <div className="mb-6 rounded-lg border border-white/10 bg-[#0c1828]/80 p-4 text-sm text-muted shadow-sm">
          Signed in as <strong className="text-ink">{user.name}</strong> / {user.email}
        </div>
        {children}
      </main>
    </div>
  );
}
