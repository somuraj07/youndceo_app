"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/permissions";
import { bumpContentVersion } from "@/lib/cache";

export type LearningAdminState = {
  error?: string;
  success?: string;
};

type CourseContentInput = {
  id?: string;
  title: string;
  body: string;
};

type CourseModuleInput = {
  id?: string;
  title: string;
  contents: CourseContentInput[];
};

type ChallengeQuestionInput = {
  id?: string;
  question: string;
  options: string[];
  correctIndex: number;
};

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    throw new Error("Unauthorized");
  }
}

function positiveInteger(value: FormDataEntryValue | null, fallback: number) {
  const parsed = Number(value ?? fallback);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function nonNegativeInteger(value: FormDataEntryValue | null, fallback: number) {
  const parsed = Number(value ?? fallback);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
}

function parseBoolean(value: FormDataEntryValue | null, fallback = true) {
  if (value === null) return fallback;
  return value.toString() === "true";
}

function parseCourseModules(raw: string) {
  const modules = JSON.parse(raw) as CourseModuleInput[];
  return modules
    .map((module) => ({
      id: module.id?.trim() || undefined,
      title: module.title?.trim() ?? "",
      contents: (module.contents ?? [])
        .map((content) => ({
          id: content.id?.trim() || undefined,
          title: content.title?.trim() ?? "",
          body: content.body?.trim() ?? "",
        }))
        .filter((content) => content.title && content.body),
    }))
    .filter((module) => module.title && module.contents.length > 0);
}

function parseChallengeQuestions(raw: string) {
  const questions = JSON.parse(raw) as ChallengeQuestionInput[];
  return questions
    .map((question) => ({
      id: question.id?.trim() || undefined,
      question: question.question?.trim() ?? "",
      options: (question.options ?? []).map((option) => option.trim()).filter(Boolean),
      correctIndex: Number(question.correctIndex),
    }))
    .filter(
      (question) =>
        question.question &&
        question.options.length >= 2 &&
        Number.isInteger(question.correctIndex) &&
        question.correctIndex >= 0 &&
        question.correctIndex < question.options.length,
    );
}

async function refreshLearning() {
  await bumpContentVersion();
  revalidatePath("/admin/assignments");
  revalidatePath("/learn");
}

export async function createCourse(
  _previous: LearningAdminState,
  formData: FormData,
): Promise<LearningAdminState> {
  try {
    await requireAdmin();
    const title = formData.get("title")?.toString().trim();
    const description = formData.get("description")?.toString().trim() || null;
    const icon = formData.get("icon")?.toString().trim() || "📘";
    const xpReward = positiveInteger(formData.get("xpReward"), 200);
    const sortOrder = nonNegativeInteger(formData.get("sortOrder"), 0);
    const isActive = parseBoolean(formData.get("isActive"), true);
    const modulesRaw = formData.get("modules")?.toString();

    if (!title || !modulesRaw) {
      return { error: "Course title and modules are required." };
    }

    const validModules = parseCourseModules(modulesRaw);
    if (validModules.length === 0) {
      return { error: "Add at least one module with one content lesson." };
    }

    await prisma.course.create({
      data: {
        title,
        description,
        icon,
        xpReward,
        isActive,
        sortOrder,
        modules: {
          create: validModules.map((module, moduleIndex) => ({
            title: module.title,
            sortOrder: moduleIndex,
            contents: {
              create: module.contents.map((content, contentIndex) => ({
                title: content.title,
                body: content.body,
                sortOrder: contentIndex,
              })),
            },
          })),
        },
      },
    });

    await refreshLearning();
    return { success: "Course published." };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to create course.",
    };
  }
}

export async function updateCourse(
  _previous: LearningAdminState,
  formData: FormData,
): Promise<LearningAdminState> {
  try {
    await requireAdmin();
    const courseId = formData.get("courseId")?.toString();
    const title = formData.get("title")?.toString().trim();
    const description = formData.get("description")?.toString().trim() || null;
    const icon = formData.get("icon")?.toString().trim() || "📘";
    const xpReward = positiveInteger(formData.get("xpReward"), 200);
    const sortOrder = nonNegativeInteger(formData.get("sortOrder"), 0);
    const isActive = parseBoolean(formData.get("isActive"), true);
    const modulesRaw = formData.get("modules")?.toString();

    if (!courseId || !title || !modulesRaw) {
      return { error: "Course id, title, and modules are required." };
    }

    const validModules = parseCourseModules(modulesRaw);
    if (validModules.length === 0) {
      return { error: "Add at least one module with one content lesson." };
    }

    const existing = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: { include: { contents: true } },
      },
    });

    if (!existing) {
      return { error: "Course not found." };
    }

    const existingModuleIds = new Set(existing.modules.map((module) => module.id));
    const existingContentIds = new Set(
      existing.modules.flatMap((module) => module.contents.map((content) => content.id)),
    );

    for (const module of validModules) {
      if (module.id && !existingModuleIds.has(module.id)) {
        return { error: "One or more modules do not belong to this course." };
      }
      for (const content of module.contents) {
        if (content.id && !existingContentIds.has(content.id)) {
          return { error: "One or more lessons do not belong to this course." };
        }
      }
    }

    const keptModuleIds = validModules
      .map((module) => module.id)
      .filter((id): id is string => Boolean(id));
    const keptContentIds = validModules
      .flatMap((module) => module.contents.map((content) => content.id))
      .filter((id): id is string => Boolean(id));

    await prisma.$transaction(async (tx) => {
      await tx.course.update({
        where: { id: courseId },
        data: { title, description, icon, xpReward, isActive, sortOrder },
      });

      await tx.courseContent.deleteMany({
        where: {
          module: { courseId },
          id: { notIn: keptContentIds.length > 0 ? keptContentIds : ["__none__"] },
        },
      });

      await tx.courseModule.deleteMany({
        where: {
          courseId,
          id: { notIn: keptModuleIds.length > 0 ? keptModuleIds : ["__none__"] },
        },
      });

      for (const [moduleIndex, module] of validModules.entries()) {
        const moduleId = module.id
          ? (
              await tx.courseModule.update({
                where: { id: module.id },
                data: { title: module.title, sortOrder: moduleIndex },
              })
            ).id
          : (
              await tx.courseModule.create({
                data: {
                  courseId,
                  title: module.title,
                  sortOrder: moduleIndex,
                },
              })
            ).id;

        for (const [contentIndex, content] of module.contents.entries()) {
          if (content.id) {
            await tx.courseContent.update({
              where: { id: content.id },
              data: {
                moduleId,
                title: content.title,
                body: content.body,
                sortOrder: contentIndex,
              },
            });
          } else {
            await tx.courseContent.create({
              data: {
                moduleId,
                title: content.title,
                body: content.body,
                sortOrder: contentIndex,
              },
            });
          }
        }
      }
    });

    await refreshLearning();
    return { success: "Course updated." };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to update course.",
    };
  }
}

export async function createChallenge(
  _previous: LearningAdminState,
  formData: FormData,
): Promise<LearningAdminState> {
  try {
    await requireAdmin();
    const title = formData.get("title")?.toString().trim();
    const description = formData.get("description")?.toString().trim() || null;
    const icon = formData.get("icon")?.toString().trim() || "🏆";
    const xpReward = positiveInteger(formData.get("xpReward"), 200);
    const sortOrder = nonNegativeInteger(formData.get("sortOrder"), 0);
    const isActive = parseBoolean(formData.get("isActive"), true);
    const questionsRaw = formData.get("questions")?.toString();

    if (!title || !questionsRaw) {
      return { error: "Challenge title and questions are required." };
    }

    const validQuestions = parseChallengeQuestions(questionsRaw);
    if (validQuestions.length === 0) {
      return {
        error: "Every question needs text, at least two choices, and a correct answer.",
      };
    }

    await prisma.challenge.create({
      data: {
        title,
        description,
        icon,
        xpReward,
        isActive,
        sortOrder,
        questions: {
          create: validQuestions.map((question, index) => ({
            question: question.question,
            options: question.options.map((label, optionIndex) => ({
              id: String.fromCharCode(65 + optionIndex),
              label,
            })),
            correctAnswer: String.fromCharCode(65 + question.correctIndex),
            sortOrder: index,
          })),
        },
      },
    });

    await refreshLearning();
    return { success: "Challenge published." };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to create challenge.",
    };
  }
}

export async function updateChallenge(
  _previous: LearningAdminState,
  formData: FormData,
): Promise<LearningAdminState> {
  try {
    await requireAdmin();
    const challengeId = formData.get("challengeId")?.toString();
    const title = formData.get("title")?.toString().trim();
    const description = formData.get("description")?.toString().trim() || null;
    const icon = formData.get("icon")?.toString().trim() || "🏆";
    const xpReward = positiveInteger(formData.get("xpReward"), 200);
    const sortOrder = nonNegativeInteger(formData.get("sortOrder"), 0);
    const isActive = parseBoolean(formData.get("isActive"), true);
    const questionsRaw = formData.get("questions")?.toString();

    if (!challengeId || !title || !questionsRaw) {
      return { error: "Challenge id, title, and questions are required." };
    }

    const validQuestions = parseChallengeQuestions(questionsRaw);
    if (validQuestions.length === 0) {
      return {
        error: "Every question needs text, at least two choices, and a correct answer.",
      };
    }

    const existing = await prisma.challenge.findUnique({
      where: { id: challengeId },
      include: { questions: true },
    });

    if (!existing) {
      return { error: "Challenge not found." };
    }

    const existingQuestionIds = new Set(existing.questions.map((question) => question.id));
    for (const question of validQuestions) {
      if (question.id && !existingQuestionIds.has(question.id)) {
        return { error: "One or more questions do not belong to this challenge." };
      }
    }

    const keptQuestionIds = validQuestions
      .map((question) => question.id)
      .filter((id): id is string => Boolean(id));

    await prisma.$transaction(async (tx) => {
      await tx.challenge.update({
        where: { id: challengeId },
        data: { title, description, icon, xpReward, isActive, sortOrder },
      });

      await tx.challengeQuestion.deleteMany({
        where: {
          challengeId,
          id: { notIn: keptQuestionIds.length > 0 ? keptQuestionIds : ["__none__"] },
        },
      });

      for (const [index, question] of validQuestions.entries()) {
        const payload = {
          question: question.question,
          options: question.options.map((label, optionIndex) => ({
            id: String.fromCharCode(65 + optionIndex),
            label,
          })),
          correctAnswer: String.fromCharCode(65 + question.correctIndex),
          sortOrder: index,
        };

        if (question.id) {
          await tx.challengeQuestion.update({
            where: { id: question.id },
            data: payload,
          });
        } else {
          await tx.challengeQuestion.create({
            data: { challengeId, ...payload },
          });
        }
      }
    });

    await refreshLearning();
    return { success: "Challenge updated." };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to update challenge.",
    };
  }
}

export async function deleteCourse(courseId: string) {
  await requireAdmin();
  await prisma.course.deleteMany({ where: { id: courseId } });
  await refreshLearning();
}

export async function deleteChallenge(challengeId: string) {
  await requireAdmin();
  await prisma.challenge.deleteMany({ where: { id: challengeId } });
  await refreshLearning();
}
