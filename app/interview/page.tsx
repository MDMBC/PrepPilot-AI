import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/DashboardShell";
import { InterviewStudio } from "@/components/InterviewStudio";

export default async function InterviewPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const resumes = await prisma.resume.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, fileName: true, summary: true, skills: true }
  });

  return (
    <DashboardShell user={user}>
      <InterviewStudio resumes={resumes} />
    </DashboardShell>
  );
}
