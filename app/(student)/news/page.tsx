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
    <div className="mx-auto flex w-full max-w-xl flex-col items-center space-y-6 md:max-w-2xl lg:max-w-3xl md:space-y-8">
      <header className="fade-up w-full text-center">
        <p className="text-xs font-medium tracking-[0.2em] text-cyan uppercase md:text-sm">
          Newsfeed
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl md:font-extrabold">
          For you
        </h1>
        <p className="mt-2 text-sm text-muted md:text-base lg:text-lg">
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
