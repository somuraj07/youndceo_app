"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { syncUserRank } from "@/lib/stats";
import { bumpContentVersion, invalidateUserCaches } from "@/lib/cache";
import { scheduleNotifyUser } from "@/lib/notifications";

export type SubmitState = {
  error?: string;
  success?: string;
  correct?: boolean | null;
  xpEarned?: number;
  status?: string;
};

export type BatchResultItem = {
  assignmentId: string;
  title: string;
  correct: boolean | null;
  status: string;
  xpEarned: number;
};

export type BatchSubmitState = {
  error?: string;
  results?: BatchResultItem[];
  scorePercent?: number;
  totalXp?: number;
};

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user.id;
}

function revalidateLearn(assignmentId?: string) {
  revalidatePath("/learn");
  revalidatePath("/home");
  revalidatePath("/admin");
  revalidatePath("/admin/assignments");
  if (assignmentId) revalidatePath(`/learn/${assignmentId}`);
}

export async function submitAssignment(
  _prev: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  const userId = await requireUserId();
  if (!userId) return { error: "You must be signed in." };

  const assignmentId = formData.get("assignmentId")?.toString();
  const answer = formData.get("answer")?.toString().trim();

  if (!assignmentId || !answer) {
    return { error: "Please provide an answer." };
  }

  return gradeOneAnswer(userId, assignmentId, answer);
}

export async function submitAssignmentBatch(
  answers: { assignmentId: string; answer: string }[],
): Promise<BatchSubmitState> {
  const userId = await requireUserId();
  if (!userId) return { error: "You must be signed in." };

  if (!answers.length) {
    return { error: "No answers to submit." };
  }

  const results: BatchResultItem[] = [];
  let scored = 0;
  let correctCount = 0;
  let totalXp = 0;

  for (const item of answers) {
    const answer = item.answer.trim();
    if (!answer) continue;

    const graded = await gradeOneAnswer(userId, item.assignmentId, answer);
    const assignment = await prisma.assignment.findUnique({
      where: { id: item.assignmentId },
      select: { title: true },
    });

    if (graded.error && !graded.status) {
      results.push({
        assignmentId: item.assignmentId,
        title: assignment?.title ?? "Lesson",
        correct: null,
        status: "ERROR",
        xpEarned: 0,
      });
      continue;
    }

    results.push({
      assignmentId: item.assignmentId,
      title: assignment?.title ?? "Lesson",
      correct: graded.correct ?? null,
      status: graded.status ?? "PENDING",
      xpEarned: graded.xpEarned ?? 0,
    });

    if (graded.status === "APPROVED" || graded.status === "REJECTED") {
      scored += 1;
      if (graded.correct) correctCount += 1;
    }
    totalXp += graded.xpEarned ?? 0;
  }

  await Promise.all([invalidateUserCaches(userId), bumpContentVersion()]);
  revalidateLearn();

  const scorePercent =
    scored === 0 ? 0 : Math.round((correctCount / scored) * 100);

  return { results, scorePercent, totalXp };
}

async function gradeOneAnswer(
  userId: string,
  assignmentId: string,
  answer: string,
): Promise<SubmitState> {
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId, isActive: true },
  });

  if (!assignment) {
    return { error: "Assignment not found." };
  }

  const existing = await prisma.assignmentSubmission.findUnique({
    where: {
      userId_assignmentId: { userId, assignmentId },
    },
  });

  if (existing) {
    return {
      success: "Already submitted.",
      correct: existing.isCorrect,
      xpEarned: existing.xpEarned,
      status: existing.status,
    };
  }

  if (assignment.type === "MCQ") {
    const isCorrect = answer === assignment.correctAnswer;

    await prisma.$transaction([
      prisma.assignmentSubmission.create({
        data: {
          userId,
          assignmentId,
          answer,
          isCorrect,
          status: isCorrect ? "APPROVED" : "REJECTED",
          xpEarned: isCorrect ? assignment.xpReward : 0,
        },
      }),
      ...(isCorrect
        ? [
            prisma.user.update({
              where: { id: userId },
              data: {
                xp: { increment: assignment.xpReward },
                streak: { increment: 1 },
              },
            }),
          ]
        : []),
    ]);

    if (isCorrect) {
      await syncUserRank(userId);
    }

    scheduleNotifyUser({
      userId,
      type: "RESULT",
      title: isCorrect ? "Correct answer" : "Incorrect answer",
      body: isCorrect
        ? `${assignment.title} · +${assignment.xpReward} XP`
        : `${assignment.title} · review and try again`,
      href: `/learn/${assignmentId}`,
    });

    revalidateLearn(assignmentId);

    return {
      success: isCorrect
        ? `Correct! +${assignment.xpReward} XP`
        : "Incorrect answer.",
      correct: isCorrect,
      xpEarned: isCorrect ? assignment.xpReward : 0,
      status: isCorrect ? "APPROVED" : "REJECTED",
    };
  }

  await prisma.assignmentSubmission.create({
    data: {
      userId,
      assignmentId,
      answer,
      status: "PENDING",
    },
  });

  revalidateLearn(assignmentId);

  return {
    success: "Submitted for review.",
    correct: null,
    xpEarned: 0,
    status: "PENDING",
  };
}
