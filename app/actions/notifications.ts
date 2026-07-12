"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function markNotificationRead(id: string) {
  const session = await auth();
  if (!session?.user?.id) return;

  await prisma.notification.updateMany({
    where: { id, userId: session.user.id, readAt: null },
    data: { readAt: new Date() },
  });

  revalidatePath("/home");
  revalidatePath("/learn");
  revalidatePath("/news");
}

export async function markAllNotificationsRead() {
  const session = await auth();
  if (!session?.user?.id) return;

  await prisma.notification.deleteMany({
    where: { userId: session.user.id },
  });

  revalidatePath("/home");
  revalidatePath("/learn");
  revalidatePath("/news");
  revalidatePath("/portfolio");
  revalidatePath("/spend");
  revalidatePath("/profile");
}
