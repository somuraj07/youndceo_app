import { prisma } from "@/lib/prisma";
import { LearningManager } from "@/components/admin/learning-manager";

export default async function AdminAssignmentsPage() {
  const [courses, challenges] = await Promise.all([
    prisma.course.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: {
        modules: {
          orderBy: { sortOrder: "asc" },
          include: {
            contents: { orderBy: { sortOrder: "asc" } },
          },
        },
      },
    }),
    prisma.challenge.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: {
        questions: { orderBy: { sortOrder: "asc" } },
      },
    }),
  ]);

  return (
    <LearningManager
      courses={courses.map((course) => ({
        id: course.id,
        title: course.title,
        description: course.description ?? "",
        icon: course.icon,
        xpReward: course.xpReward,
        isActive: course.isActive,
        sortOrder: course.sortOrder,
        modules: course.modules.map((module) => ({
          id: module.id,
          title: module.title,
          sortOrder: module.sortOrder,
          contents: module.contents.map((content) => ({
            id: content.id,
            title: content.title,
            body: content.body,
            sortOrder: content.sortOrder,
          })),
        })),
      }))}
      challenges={challenges.map((challenge) => ({
        id: challenge.id,
        title: challenge.title,
        description: challenge.description ?? "",
        icon: challenge.icon,
        xpReward: challenge.xpReward,
        isActive: challenge.isActive,
        sortOrder: challenge.sortOrder,
        questions: challenge.questions.map((question) => {
          const options = question.options as { id: string; label: string }[];
          const correctIndex = options.findIndex(
            (option) => option.id === question.correctAnswer,
          );
          return {
            id: question.id,
            question: question.question,
            options: options.map((option) => option.label),
            correctIndex: correctIndex >= 0 ? correctIndex : 0,
            sortOrder: question.sortOrder,
          };
        }),
      }))}
    />
  );
}
