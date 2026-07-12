import { prisma } from "@/lib/prisma";
import type { SubmissionStatus } from "@/app/generated/prisma/client";

export function getAssignmentProgress(status?: SubmissionStatus) {
  if (status === "APPROVED") return 100;
  if (status === "PENDING") return 50;
  if (status === "REJECTED") return 25;
  return 0;
}

export async function syncUserRank(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { xp: true },
  });

  if (!user) return;

  const ranks = await prisma.rank.findMany({
    orderBy: { minXp: "desc" },
  });

  const matched = ranks.find(
    (rank) =>
      user.xp >= rank.minXp &&
      (rank.maxXp === null || user.xp <= rank.maxXp),
  );

  await prisma.user.update({
    where: { id: userId },
    data: { rankId: matched?.id ?? null },
  });
}

export async function getUserWeeklyXp(userId: string) {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 6);
  weekAgo.setHours(0, 0, 0, 0);

  const submissions = await prisma.assignmentSubmission.findMany({
    where: {
      userId,
      status: "APPROVED",
      createdAt: { gte: weekAgo },
    },
    select: { xpEarned: true, createdAt: true },
  });

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    date.setHours(0, 0, 0, 0);
    return date;
  });

  const dailyXp = days.map((day) => {
    const nextDay = new Date(day);
    nextDay.setDate(nextDay.getDate() + 1);

    const xp = submissions
      .filter((s) => s.createdAt >= day && s.createdAt < nextDay)
      .reduce((sum, s) => sum + s.xpEarned, 0);

    return { date: day, xp };
  });

  const total = dailyXp.reduce((sum, day) => sum + day.xp, 0);

  return { dailyXp, total };
}

export async function getAdminAnalytics() {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 6);
  weekAgo.setHours(0, 0, 0, 0);

  const [totalSubmissions, approvedSubmissions, weeklySubmissions] =
    await Promise.all([
      prisma.assignmentSubmission.count(),
      prisma.assignmentSubmission.count({ where: { status: "APPROVED" } }),
      prisma.assignmentSubmission.findMany({
        where: { createdAt: { gte: weekAgo } },
        select: { createdAt: true },
      }),
    ]);

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    date.setHours(0, 0, 0, 0);
    return date;
  });

  const dailyCounts = days.map((day) => {
    const nextDay = new Date(day);
    nextDay.setDate(nextDay.getDate() + 1);

    return weeklySubmissions.filter(
      (s) => s.createdAt >= day && s.createdAt < nextDay,
    ).length;
  });

  const completionRate =
    totalSubmissions === 0
      ? 0
      : Math.round((approvedSubmissions / totalSubmissions) * 100);

  return { dailyCounts, completionRate, totalSubmissions, approvedSubmissions };
}
