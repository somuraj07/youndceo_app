"use client";

import { useRef, useState, useTransition } from "react";
import { toggleNewsLike } from "@/app/actions/news";

export type NewsFeedItem = {
  id: string;
  title: string;
  body: string;
  imageUrl: string | null;
  videoUrl: string | null;
  createdAt: string | Date;
  likeCount: number;
  likedByMe: boolean;
};

function isDirectVideo(url: string) {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url) || url.includes("/news/video/");
}

function timeAgo(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString();
}

function HeartIcon({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
    </svg>
  );
}

function NewsPostCard({ post }: { post: NewsFeedItem }) {
  const [liked, setLiked] = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [burst, setBurst] = useState(false);
  const [pending, startTransition] = useTransition();
  const lastTap = useRef(0);

  function runLike(nextLiked?: boolean) {
    const willLike = nextLiked ?? !liked;
    const prevLiked = liked;
    const prevCount = likeCount;

    setLiked(willLike);
    setLikeCount((count) => Math.max(0, count + (willLike && !prevLiked ? 1 : !willLike && prevLiked ? -1 : 0)));
    if (willLike) {
      setBurst(true);
      window.setTimeout(() => setBurst(false), 450);
    }

    startTransition(async () => {
      const result = await toggleNewsLike(post.id);
      if (result.error) {
        setLiked(prevLiked);
        setLikeCount(prevCount);
        return;
      }
      setLiked(result.liked);
      if (typeof result.likeCount === "number") {
        setLikeCount(result.likeCount);
      }
    });
  }

  function onMediaTap() {
    const now = Date.now();
    if (now - lastTap.current < 280) {
      if (!liked) runLike(true);
      lastTap.current = 0;
      return;
    }
    lastTap.current = now;
  }

  return (
    <article className="glass overflow-hidden rounded-3xl">
      <header className="flex items-center gap-3 px-4 py-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal/20 text-sm font-bold text-teal">
          YC
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">youngceo</p>
          <p className="text-[11px] text-muted">{timeAgo(post.createdAt)}</p>
        </div>
      </header>

      {post.imageUrl || post.videoUrl ? (
        <button
          type="button"
          onClick={onMediaTap}
          className="relative block w-full overflow-hidden bg-black/10"
          aria-label="Double tap to like"
        >
          {post.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.imageUrl}
              alt={post.title}
              className="aspect-square w-full object-cover"
            />
          ) : null}

          {!post.imageUrl && post.videoUrl && isDirectVideo(post.videoUrl) ? (
            <video
              src={post.videoUrl}
              controls
              playsInline
              className="aspect-square w-full object-cover"
              onClick={(e) => e.stopPropagation()}
            />
          ) : null}

          {!post.imageUrl && post.videoUrl && !isDirectVideo(post.videoUrl) ? (
            <a
              href={post.videoUrl}
              target="_blank"
              rel="noreferrer"
              className="flex aspect-square items-center justify-center text-sm text-cyan underline"
              onClick={(e) => e.stopPropagation()}
            >
              Watch video
            </a>
          ) : null}

          {burst ? (
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <HeartIcon
                filled
                className="h-20 w-20 scale-110 text-white drop-shadow-lg transition"
              />
            </span>
          ) : null}
        </button>
      ) : null}

      <div className="space-y-2 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => runLike()}
            disabled={pending}
            className={`transition active:scale-90 ${
              liked ? "text-red" : "text-foreground"
            }`}
            aria-label={liked ? "Unlike" : "Like"}
          >
            <HeartIcon filled={liked} className="h-7 w-7" />
          </button>
          <p className="text-sm font-semibold text-foreground">
            {likeCount.toLocaleString()} like{likeCount === 1 ? "" : "s"}
          </p>
        </div>

        <p className="text-sm text-foreground">
          <span className="font-semibold">youngceo</span>{" "}
          <span className="font-medium">{post.title}</span>
        </p>
        <p className="whitespace-pre-wrap text-sm text-muted">{post.body}</p>
      </div>
    </article>
  );
}

export function InstagramNewsFeed({ posts }: { posts: NewsFeedItem[] }) {
  if (posts.length === 0) {
    return (
      <div className="glass rounded-3xl px-5 py-10 text-center">
        <p className="text-sm text-muted">No posts yet. Check back soon.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {posts.map((post) => (
        <NewsPostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
