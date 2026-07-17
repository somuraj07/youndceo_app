import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ChallengePlayer } from "@/components/student/challenge-player";

type Option = { id: string; label: string };

export default async function ChallengePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { id } = await params;

  const challenge = await prisma.challenge.findUnique({
    where: { id, isActive: true },
    include: {
      questions: { orderBy: { sortOrder: "asc" } },
      attempts: {
        where: { userId: session.user.id },
        take: 1,
      },
    },
  });

  if (!challenge) notFound();
  const attempt = challenge.attempts[0];
  const attemptAnswers =
    attempt?.answers &&
    typeof attempt.answers === "object" &&
    !Array.isArray(attempt.answers)
      ? (attempt.answers as Record<string, string>)
      : {};
  const review = attempt
    ? challenge.questions.map((question) => {
        const options = question.options as Option[];
        const selectedId = attemptAnswers[question.id] ?? "";
        const optionLabel = (answerId: string) =>
          options.find((option) => option.id === answerId)?.label ?? answerId;

        return {
          questionId: question.id,
          question: question.question,
          selectedAnswer: optionLabel(selectedId) || "No answer",
          correctAnswer: optionLabel(question.correctAnswer),
          isCorrect: selectedId === question.correctAnswer,
        };
      })
    : undefined;

  return (
    <ChallengePlayer
      challenge={{
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        icon: challenge.icon,
        xpReward: challenge.xpReward,
        questions: challenge.questions.map((question) => ({
          id: question.id,
          question: question.question,
          options: question.options as Option[],
        })),
      }}
      previousResult={
        attempt
          ? {
              score: attempt.score,
              xpEarned: attempt.xpEarned,
              totalQuestions: challenge.questions.length,
              correctCount: Math.round(
                (attempt.score / 100) * challenge.questions.length,
              ),
              review,
            }
          : null
      }
    />
  );
}
