import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getNewsFeed } from "@/lib/data/home";
import { InstagramNewsFeed } from "@/components/student/instagram-news-feed";

export default async function NewsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const news = await getNewsFeed(session.user.id);

  return (
    <div className="space-y-5">
      <header className="fade-up">
        <p className="text-xs font-medium tracking-[0.2em] text-cyan uppercase">
          Newsfeed
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground">
          For you
        </h1>
        <p className="mt-2 text-sm text-muted">
          Double-tap photos to like · Instagram-style updates from Young CEO.
        </p>
      </header>

      <div className="fade-up fade-up-delay-1">
        <InstagramNewsFeed
          posts={news.map((item) => ({
            ...item,
            createdAt: item.createdAt.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}
