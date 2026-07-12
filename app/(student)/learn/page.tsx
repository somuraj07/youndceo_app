import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getLearnPageData } from "@/lib/data/home";
import { LearnExam } from "@/components/student/learn-exam";

export const dynamic = "force-dynamic";

export default async function LearnPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { assignments, submissions } = await getLearnPageData(session.user.id);

  return (
    <LearnExam
      userName={session.user.name ?? "CEO"}
      assignments={assignments.map((a) => ({
        id: a.id,
        title: a.title,
        category: a.category,
        type: a.type,
        question: a.question,
        options: a.options,
        xpReward: a.xpReward,
        imageUrl: a.imageUrl,
      }))}
      submissions={submissions.map((s) => ({
        assignmentId: s.assignmentId,
        status: s.status,
        xpEarned: s.xpEarned,
        isCorrect: s.isCorrect,
      }))}
    />
  );
}
