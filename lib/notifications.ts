import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import type { NotificationType } from "@/app/generated/prisma/client";

export type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  href: string | null;
  readAt: Date | null;
  createdAt: Date;
};

async function studentIds() {
  const users = await prisma.user.findMany({
    where: { role: "USER" },
    select: { id: true },
  });
  return users.map((u) => u.id);
}

export async function notifyAllStudents(input: {
  type: NotificationType;
  title: string;
  body: string;
  href?: string;
}) {
  const ids = await studentIds();
  if (ids.length === 0) return;

  await prisma.notification.createMany({
    data: ids.map((userId) => ({
      id: crypto.randomUUID(),
      userId,
      type: input.type,
      title: input.title,
      body: input.body,
      href: input.href,
    })),
  });
}

export async function notifyUser(input: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  href?: string;
}) {
  await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      href: input.href,
    },
  });
}

export function scheduleNotifyAllStudents(input: {
  type: NotificationType;
  title: string;
  body: string;
  href?: string;
}) {
  after(async () => {
    try {
      await notifyAllStudents(input);
    } catch (error) {
      console.error("notifyAllStudents failed", error);
    }
  });
}

export function scheduleNotifyUser(input: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  href?: string;
}) {
  after(async () => {
    try {
      await notifyUser(input);
    } catch (error) {
      console.error("notifyUser failed", error);
    }
  });
}

export async function getUserNotifications(userId: string, take = 20) {
  try {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        type: true,
        title: true,
        body: true,
        href: true,
        readAt: true,
        createdAt: true,
      },
    });
  } catch (error) {
    console.error("getUserNotifications failed", error);
    return [];
  }
}

export async function getUnreadNotificationCount(userId: string) {
  try {
    return await prisma.notification.count({
      where: { userId, readAt: null },
    });
  } catch (error) {
    console.error("getUnreadNotificationCount failed", error);
    return 0;
  }
}
