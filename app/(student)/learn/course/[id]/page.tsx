import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CoursePlayer } from "@/components/student/course-player";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { id } = await params;

  const [course, progress] = await Promise.all([
    prisma.course.findUnique({
      where: { id, isActive: true },
      include: {
        modules: {
          orderBy: { sortOrder: "asc" },
          include: { contents: { orderBy: { sortOrder: "asc" } } },
        },
      },
    }),
    prisma.courseContentProgress.findMany({
      where: {
        userId: session.user.id,
        content: { module: { courseId: id } },
      },
      select: { contentId: true },
    }),
  ]);

  if (!course) notFound();

  return (
    <CoursePlayer
      completedIds={progress.map((item) => item.contentId)}
      course={{
        id: course.id,
        title: course.title,
        description: course.description,
        icon: course.icon,
        xpReward: course.xpReward,
        modules: course.modules.map((module) => ({
          id: module.id,
          title: module.title,
          contents: module.contents.map((content) => ({
            id: content.id,
            title: content.title,
            body: content.body,
          })),
        })),
      }}
    />
  );
}
