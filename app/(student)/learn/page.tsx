import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { LearnHub } from "@/components/student/learn-hub";

export const dynamic = "force-dynamic";

export default async function LearnPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [user, courses, challenges, contentProgress, courseAwards, attempts] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          xp: true,
          streak: true,
        },
      }),
      prisma.course.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        include: {
          modules: {
            orderBy: { sortOrder: "asc" },
            include: {
              contents: {
                orderBy: { sortOrder: "asc" },
                select: { id: true },
              },
            },
          },
        },
      }),
      prisma.challenge.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        include: { questions: { select: { id: true } } },
      }),
      prisma.courseContentProgress.findMany({
        where: { userId: session.user.id },
        select: { contentId: true },
      }),
      prisma.courseCompletion.findMany({
        where: { userId: session.user.id },
        select: { courseId: true },
      }),
      prisma.challengeAttempt.findMany({
        where: { userId: session.user.id },
        select: { challengeId: true, score: true, xpEarned: true },
      }),
    ]);

  const completedContentIds = new Set(
    contentProgress.map((progress) => progress.contentId),
  );
  const completedCourseIds = new Set(courseAwards.map((award) => award.courseId));
  const attemptMap = new Map(
    attempts.map((attempt) => [attempt.challengeId, attempt]),
  );

  return (
    <LearnHub
      stats={{
        streak: user?.streak ?? 0,
        xp: user?.xp ?? 0,
        completed: completedCourseIds.size + attempts.length,
      }}
      courses={courses.map((course) => {
        const contentIds = course.modules.flatMap((module) =>
          module.contents.map((content) => content.id),
        );
        const completedCount = contentIds.filter((id) =>
          completedContentIds.has(id),
        ).length;
        return {
          id: course.id,
          title: course.title,
          description: course.description,
          icon: course.icon,
          xpReward: course.xpReward,
          moduleCount: course.modules.length,
          progress:
            contentIds.length === 0
              ? 0
              : Math.round((completedCount / contentIds.length) * 100),
          completed: completedCourseIds.has(course.id),
        };
      })}
      challenges={challenges.map((challenge) => ({
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        icon: challenge.icon,
        xpReward: challenge.xpReward,
        questionCount: challenge.questions.length,
        attempt: attemptMap.get(challenge.id) ?? null,
      }))}
    />
  );
}
