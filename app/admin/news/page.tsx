import { getAdminNews } from "@/lib/data/home";
import { NewsManager } from "@/components/admin/news-manager";

export default async function AdminNewsPage() {
  const news = await getAdminNews();

  return (
    <NewsManager
      news={news.map((item) => ({
        id: item.id,
        title: item.title,
        body: item.body,
        imageUrl: item.imageUrl,
        videoUrl: item.videoUrl,
        createdAt: item.createdAt.toISOString(),
      }))}
    />
  );
}
