import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getLearnDetailData } from "@/lib/data/home";
import { AssignmentForm } from "@/components/assignments/assignment-form";

export default async function LearnDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;
  const { assignment, submission } = await getLearnDetailData(
    session.user.id,
    id,
  );

  if (!assignment) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <Link href="/learn" className="text-sm text-cyan">
        ← Back to learn
      </Link>

      <AssignmentForm
        assignment={assignment}
        existingSubmission={
          submission
            ? {
                answer: submission.answer,
                status: submission.status,
                xpEarned: submission.xpEarned,
              }
            : null
        }
      />
    </div>
  );
}
