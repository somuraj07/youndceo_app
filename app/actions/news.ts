"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type LikeResult = {
  error?: string;
  liked: boolean;
  likeCount?: number;
};

export async function toggleNewsLike(newsId: string): Promise<LikeResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Sign in required.", liked: false };
  }

  if (!newsId) {
    return { error: "Invalid post.", liked: false };
  }

  const removed = await prisma.newsLike.deleteMany({
    where: {
      newsId,
      userId: session.user.id,
    },
  });

  if (removed.count > 0) {
    const likeCount = await prisma.newsLike.count({ where: { newsId } });
    const { getContentVersion, CacheKeys, invalidateKeys } = await import(
      "@/lib/cache"
    );
    const ver = await getContentVersion();
    void invalidateKeys(CacheKeys.newsFeed(session.user.id, ver));
    return { liked: false, likeCount };
  }

  await prisma.newsLike.create({
    data: {
      newsId,
      userId: session.user.id,
    },
  });

  const likeCount = await prisma.newsLike.count({ where: { newsId } });
  const { getContentVersion, CacheKeys, invalidateKeys } = await import(
    "@/lib/cache"
  );
  const ver = await getContentVersion();
  void invalidateKeys(CacheKeys.newsFeed(session.user.id, ver));
  return { liked: true, likeCount };
}
