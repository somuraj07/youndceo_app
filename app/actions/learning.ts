"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { bumpContentVersion, invalidateUserCaches } from "@/lib/cache";
import { syncUserRank } from "@/lib/stats";

export type CourseProgressResult = {
  error?: string;
  completed?: boolean;
  courseCompleted?: boolean;
  xpEarned?: number;
};

export type ChallengeResult = {
  error?: string;
  score?: number;
  correctCount?: number;
  totalQuestions?: number;
  xpEarned?: number;
  review?: ChallengeReviewItem[];
};

export type ChallengeReviewItem = {
  questionId: string;
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
};

type ChallengeQuestionForReview = {
  id: string;
  question: string;
  options: unknown;
  correctAnswer: string;
};

function buildChallengeReview(
  questions: ChallengeQuestionForReview[],
  answers: Record<string, string>,
): ChallengeReviewItem[] {
  return questions.map((question) => {
    const options = Array.isArray(question.options)
      ? (question.options as { id?: string; label?: string }[])
      : [];
    const selectedId = answers[question.id] ?? "";
    const optionLabel = (id: string) =>
      options.find((option) => option.id === id)?.label ?? id;

    return {
      questionId: question.id,
      question: question.question,
      selectedAnswer: optionLabel(selectedId) || "No answer",
      correctAnswer: optionLabel(question.correctAnswer),
      isCorrect: selectedId === question.correctAnswer,
    };
  });
}

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id || session.user.role === "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

async function refreshUserLearning(userId: string) {
  await Promise.all([invalidateUserCaches(userId), bumpContentVersion()]);
  revalidatePath("/learn");
  revalidatePath("/profile");
}

export async function completeCourseContent(
  contentId: string,
): Promise<CourseProgressResult> {
  try {
    const userId = await requireUserId();
    const content = await prisma.courseContent.findUnique({
      where: { id: contentId },
      include: {
        module: {
          include: {
            course: {
              include: {
                modules: { include: { contents: { select: { id: true } } } },
              },
            },
          },
        },
      },
    });

    if (!content?.module.course.isActive) {
      return { error: "Course content was not found." };
    }

    const course = content.module.course;
    const contentIds = course.modules.flatMap((module) =>
      module.contents.map((item) => item.id),
    );

    const result = await prisma.$transaction(async (tx) => {
      await tx.courseContentProgress.upsert({
        where: { userId_contentId: { userId, contentId } },
        create: { userId, contentId },
        update: {},
      });

      const completedCount = await tx.courseContentProgress.count({
        where: { userId, contentId: { in: contentIds } },
      });
      const courseCompleted = completedCount === contentIds.length;
      let xpEarned = 0;

      if (courseCompleted) {
        const existing = await tx.courseCompletion.findUnique({
          where: { userId_courseId: { userId, courseId: course.id } },
        });

        if (!existing) {
          await tx.courseCompletion.create({
            data: {
              userId,
              courseId: course.id,
              xpEarned: course.xpReward,
            },
          });
          await tx.user.update({
            where: { id: userId },
            data: { xp: { increment: course.xpReward } },
          });
          xpEarned = course.xpReward;
        }
      }

      return { courseCompleted, xpEarned };
    });

    if (result.xpEarned > 0) {
      await syncUserRank(userId);
    }
    await refreshUserLearning(userId);
    revalidatePath(`/learn/course/${course.id}`);

    return {
      completed: true,
      courseCompleted: result.courseCompleted,
      xpEarned: result.xpEarned,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Could not save course progress.",
    };
  }
}

export async function submitChallenge(
  challengeId: string,
  answers: Record<string, string>,
): Promise<ChallengeResult> {
  try {
    const userId = await requireUserId();
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId, isActive: true },
      include: { questions: { orderBy: { sortOrder: "asc" } } },
    });

    if (!challenge || challenge.questions.length === 0) {
      return { error: "Challenge was not found." };
    }

    const existing = await prisma.challengeAttempt.findUnique({
      where: { userId_challengeId: { userId, challengeId } },
    });
    if (existing) {
      const existingAnswers =
        existing.answers &&
        typeof existing.answers === "object" &&
        !Array.isArray(existing.answers)
          ? (existing.answers as Record<string, string>)
          : {};
      return {
        score: existing.score,
        xpEarned: existing.xpEarned,
        totalQuestions: challenge.questions.length,
        correctCount: Math.round(
          (existing.score / 100) * challenge.questions.length,
        ),
        review: buildChallengeReview(challenge.questions, existingAnswers),
      };
    }

    if (challenge.questions.some((question) => !answers[question.id])) {
      return { error: "Answer every question before submitting." };
    }

    const correctCount = challenge.questions.filter(
      (question) => answers[question.id] === question.correctAnswer,
    ).length;
    const score = Math.round(
      (correctCount / challenge.questions.length) * 100,
    );
    const xpEarned = Math.round((challenge.xpReward * score) / 100);
    const review = buildChallengeReview(challenge.questions, answers);

    await prisma.$transaction([
      prisma.challengeAttempt.create({
        data: {
          userId,
          challengeId,
          answers,
          score,
          xpEarned,
        },
      }),
      ...(xpEarned > 0
        ? [
            prisma.user.update({
              where: { id: userId },
              data: { xp: { increment: xpEarned } },
            }),
          ]
        : []),
    ]);

    if (xpEarned > 0) {
      await syncUserRank(userId);
    }
    await refreshUserLearning(userId);
    revalidatePath(`/learn/challenge/${challengeId}`);

    return {
      score,
      correctCount,
      totalQuestions: challenge.questions.length,
      xpEarned,
      review,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Challenge submission failed.",
    };
  }
}
