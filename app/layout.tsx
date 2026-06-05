import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PrepPilot AI",
  description: "AI-powered interview preparation with resume-aware voice mock interviews and performance reports."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
