import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { SubmissionStatus } from "@/app/generated/prisma/client";
import {
  CacheKeys,
  TTL,
  cached,
  getContentVersion,
} from "@/lib/cache";

function buildWeeklyXp(submissions: { xpEarned: number; createdAt: Date }[]) {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 6);
  weekAgo.setHours(0, 0, 0, 0);

  const approved = submissions.filter((s) => s.createdAt >= weekAgo);

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    date.setHours(0, 0, 0, 0);

    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const xp = approved
      .filter((s) => s.createdAt >= date && s.createdAt < nextDay)
      .reduce((sum, s) => sum + s.xpEarned, 0);

    return { date, xp };
  });

  const total = days.reduce((sum, day) => sum + day.xp, 0);

  return { dailyXp: days, total };
}

async function loadHomePageData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      xp: true,
      streak: true,
      avatarUrl: true,
      rank: { select: { name: true } },
    },
  });

  if (!user) {
    return null;
  }

  const [submissions, goals] = await Promise.all([
    prisma.assignmentSubmission.findMany({
      where: { userId },
      select: {
        assignmentId: true,
        status: true,
        xpEarned: true,
        createdAt: true,
      },
    }),
    prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const [assignments, news, monthMoney] = await Promise.all([
    prisma.assignment.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    prisma.news.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.expense.findMany({
      where: {
        userId,
        spentAt: {
          gte: (() => {
            const d = new Date();
            d.setDate(1);
            d.setHours(0, 0, 0, 0);
            return d;
          })(),
        },
      },
      select: { amount: true, kind: true },
    }),
  ]);

  const pendingCount = submissions.filter((s) => s.status === "PENDING").length;
  const weeklyXp = buildWeeklyXp(
    submissions.filter((s) => s.status === "APPROVED"),
  );

  const monthExpenseTotal = monthMoney
    .filter((e) => e.kind === "EXPENSE")
    .reduce((sum, e) => sum + e.amount, 0);
  const monthIncomeTotal = monthMoney
    .filter((e) => e.kind === "INCOME")
    .reduce((sum, e) => sum + e.amount, 0);

  return {
    user,
    assignments,
    submissions: submissions.map((s) => ({
      assignmentId: s.assignmentId,
      status: s.status as SubmissionStatus,
    })),
    news,
    goals,
    pendingCount,
    weeklyXp,
    monthExpenseTotal,
    monthIncomeTotal,
  };
}

export const getHomePageData = cache(async (userId: string) => {
  const ver = await getContentVersion();
  return cached(CacheKeys.home(userId, ver), TTL.home, () =>
    loadHomePageData(userId),
  );
});

export const getPortfolioData = cache(async (userId: string) => {
  return cached(CacheKeys.portfolio(userId), TTL.portfolio, () =>
    loadPortfolioData(userId),
  );
});

export const getSpendData = cache(async (userId: string) => {
  return cached(CacheKeys.spend(userId), TTL.spend, () =>
    loadSpendData(userId),
  );
});

async function loadPortfolioData(userId: string) {
  const [existingWallet, savingsAccounts] = await Promise.all([
    prisma.cashWallet.findUnique({ where: { userId } }),
    prisma.savingsAccount.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const [funds, sipPlans] = await Promise.all([
    prisma.fund.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      take: 12,
    }),
    prisma.sipPlan.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const cashWallet =
    existingWallet ??
    (await prisma.cashWallet.create({
      data: { userId, balance: 0 },
    }));

  return { cashWallet, savingsAccounts, funds, sipPlans };
}

async function loadSpendData(userId: string) {
  const expenses = await prisma.expense.findMany({
    where: { userId },
    orderBy: { spentAt: "desc" },
  });

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const thisMonth = expenses.filter((e) => e.spentAt >= monthStart);
  const monthExpenseTotal = thisMonth
    .filter((e) => e.kind === "EXPENSE")
    .reduce((sum, e) => sum + e.amount, 0);
  const monthIncomeTotal = thisMonth
    .filter((e) => e.kind === "INCOME")
    .reduce((sum, e) => sum + e.amount, 0);

  return {
    expenses,
    monthTotal: monthExpenseTotal,
    monthExpenseTotal,
    monthIncomeTotal,
    monthNet: monthIncomeTotal - monthExpenseTotal,
  };
}

export const getNewsFeed = cache(async (userId: string) => {
  const ver = await getContentVersion();
  return cached(CacheKeys.newsFeed(userId, ver), TTL.news, async () => {
    const posts = await prisma.news.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { likes: true } },
        likes: {
          where: { userId },
          select: { id: true },
          take: 1,
        },
      },
    });

    return posts.map((post) => ({
      id: post.id,
      title: post.title,
      body: post.body,
      imageUrl: post.imageUrl,
      videoUrl: post.videoUrl,
      createdAt: post.createdAt,
      likeCount: post._count.likes,
      likedByMe: post.likes.length > 0,
    }));
  });
});

export const getLearnPageData = cache(async (userId: string) => {
  const ver = await getContentVersion();
  return cached(CacheKeys.learn(userId, ver), TTL.learn, async () => {
    const assignments = await prisma.assignment.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
    const submissions = await prisma.assignmentSubmission.findMany({
      where: { userId },
    });
    return { assignments, submissions };
  });
});

export const getLearnDetailData = cache(
  async (userId: string, assignmentId: string) => {
    const ver = await getContentVersion();
    return cached(
      CacheKeys.learnDetail(userId, assignmentId, ver),
      TTL.learn,
      async () => {
        const assignment = await prisma.assignment.findUnique({
          where: { id: assignmentId, isActive: true },
        });
        const submission = await prisma.assignmentSubmission.findUnique({
          where: {
            userId_assignmentId: { userId, assignmentId },
          },
        });
        return { assignment, submission };
      },
    );
  },
);

export const getProfileData = cache(async (userId: string) => {
  return cached(CacheKeys.profile(userId), TTL.profile, () =>
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        avatarUrl: true,
        coverUrl: true,
        role: true,
        xp: true,
        streak: true,
        rank: { select: { name: true } },
      },
    }),
  );
});

async function loadAdminDashboardData() {
  // Sequential queries — PgBouncer pool is small; Promise.all(4) was exhausting it.
  const userList = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      xp: true,
      streak: true,
      createdAt: true,
    },
  });

  const assignments = await prisma.assignment.findMany({
    orderBy: { createdAt: "desc" },
  });

  const news = await prisma.news.findMany({
    orderBy: { createdAt: "desc" },
  });

  const submissions = await prisma.assignmentSubmission.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      assignment: { select: { title: true, type: true, xpReward: true } },
    },
  });

  const pendingSubmissions = submissions.filter(
    (s) => s.status === "PENDING",
  ).length;

  const approvedSubmissions = submissions.filter(
    (s) => s.status === "APPROVED",
  ).length;

  const totalSubmissions = submissions.length;
  const completionRate =
    totalSubmissions === 0
      ? 0
      : Math.round((approvedSubmissions / totalSubmissions) * 100);

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    date.setHours(0, 0, 0, 0);
    return date;
  });

  const dailyCounts = days.map((day) => {
    const nextDay = new Date(day);
    nextDay.setDate(nextDay.getDate() + 1);

    return submissions.filter(
      (s) => s.createdAt >= day && s.createdAt < nextDay,
    ).length;
  });

  const studentCount = userList.filter((u) => u.role === "USER").length;

  return {
    stats: {
      users: studentCount,
      assignments: assignments.length,
      news: news.length,
      pendingSubmissions,
      completionRate,
      totalSubmissions,
    },
    analytics: dailyCounts,
    users: userList,
    assignments,
    news,
    submissions,
  };
}

export const getAdminDashboardData = cache(async () => {
  const ver = await getContentVersion();
  return cached(CacheKeys.admin(ver), TTL.admin, loadAdminDashboardData);
});

export const getAdminUsers = cache(async () => {
  const ver = await getContentVersion();
  return cached(CacheKeys.adminUsers(ver), TTL.admin, () =>
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        xp: true,
        streak: true,
        createdAt: true,
      },
    }),
  );
});

export const getAdminNews = cache(async () => {
  const ver = await getContentVersion();
  return cached(CacheKeys.news(ver), TTL.news, () =>
    prisma.news.findMany({
      orderBy: { createdAt: "desc" },
    }),
  );
});

export const getAdminAssignmentsData = cache(async () => {
  const ver = await getContentVersion();
  return cached(CacheKeys.adminAssignments(ver), TTL.admin, async () => {
    const assignments = await prisma.assignment.findMany({
      orderBy: { createdAt: "desc" },
    });
    const submissions = await prisma.assignmentSubmission.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        assignment: { select: { title: true, type: true, xpReward: true } },
      },
    });
    return { assignments, submissions };
  });
});
