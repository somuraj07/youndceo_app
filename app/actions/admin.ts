"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/permissions";
import {
  buildStoragePath,
  uploadToSupabase,
  type StorageBucket,
} from "@/lib/supabase";
import { syncUserRank } from "@/lib/stats";
import {
  invalidateAfterAdminContentChange,
  invalidateAfterGrading,
} from "@/lib/cache";
import {
  scheduleNotifyAllStudents,
  scheduleNotifyUser,
} from "@/lib/notifications";

export type ActionState = {
  error?: string;
  success?: string;
};

async function requireAdmin() {
  const session = await auth();

  if (!session?.user || !isAdmin(session.user.role)) {
    throw new Error("Unauthorized");
  }

  return session;
}

async function uploadOptionalFile(
  bucket: StorageBucket,
  prefix: string,
  file: File | null,
) {
  if (!file || file.size === 0) {
    return undefined;
  }

  const path = buildStoragePath(prefix, file.name);
  return uploadToSupabase(bucket, path, file);
}

function parseOptions(raw: string) {
  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.map((line, index) => {
    const [id, ...rest] = line.split("|");
    const label = rest.join("|").trim();

    return {
      id: id?.trim() || String.fromCharCode(65 + index),
      label: label || line,
    };
  });
}

function revalidateNewsPaths() {
  revalidatePath("/admin/news");
  revalidatePath("/news");
  revalidatePath("/home");
  revalidatePath("/admin");
}

function revalidateAdmin() {
  revalidatePath("/admin");
  revalidatePath("/admin/assignments");
  revalidatePath("/admin/users");
  revalidatePath("/admin/news");
  revalidatePath("/admin/settings");
  revalidatePath("/learn");
  revalidatePath("/portfolio");
  revalidatePath("/home");
  revalidatePath("/news");
}

function scheduleAdminContentRefresh(scope: "news" | "all" = "all") {
  after(async () => {
    await invalidateAfterAdminContentChange();
    if (scope === "news") {
      revalidateNewsPaths();
    } else {
      revalidateAdmin();
    }
  });
}

export async function createAssignment(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdmin();

    const title = formData.get("title")?.toString().trim();
    const category = formData.get("category")?.toString().trim();
    const type = formData.get("type")?.toString() as "MCQ" | "FILL_IN_BLANK";
    const question = formData.get("question")?.toString().trim();
    const optionsRaw = formData.get("options")?.toString() ?? "";
    const correctAnswer = formData.get("correctAnswer")?.toString().trim();
    const xpReward = Number(formData.get("xpReward") ?? 100);
    const description = formData.get("description")?.toString().trim();
    const image = formData.get("image") as File | null;

    if (!title || !category || !question || !correctAnswer || !type) {
      return { error: "Title, category, type, question, and answer are required." };
    }

    let options = null;

    if (type === "MCQ") {
      options = parseOptions(optionsRaw);

      if (options.length < 2) {
        return { error: "MCQ needs at least two options (format: A|Answer text)." };
      }
    }

    const imageUrl = await uploadOptionalFile("challenges", "assignment", image);

    const assignment = await prisma.assignment.create({
      data: {
        title,
        category,
        type,
        question,
        description,
        options: options ?? undefined,
        correctAnswer,
        xpReward,
        imageUrl,
      },
    });

    scheduleAdminContentRefresh("all");
    scheduleNotifyAllStudents({
      type: "ASSIGNMENT",
      title: "New assignment",
      body: title,
      href: `/learn/${assignment.id}`,
    });

    return { success: "Assignment created." };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to create assignment.",
    };
  }
}

export async function deleteAssignment(id: string) {
  await requireAdmin();
  await prisma.assignment.delete({ where: { id } });
  scheduleAdminContentRefresh("all");
}

export async function createNews(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdmin();

    const title = formData.get("title")?.toString().trim();
    const body = formData.get("body")?.toString().trim();
    const image = formData.get("image") as File | null;
    const video = formData.get("video") as File | null;
    const videoLink = formData.get("videoUrl")?.toString().trim();

    if (!title || !body) {
      return { error: "Title and body are required." };
    }

    const [imageUrl, uploadedVideoUrl] = await Promise.all([
      uploadOptionalFile("news", "image", image),
      uploadOptionalFile("news", "video", video),
    ]);
    const videoUrl = uploadedVideoUrl ?? (videoLink || undefined);

    await prisma.news.create({
      data: {
        title,
        body,
        imageUrl,
        videoUrl,
      },
    });

    scheduleAdminContentRefresh("news");
    scheduleNotifyAllStudents({
      type: "NEWS",
      title: "New news",
      body: title,
      href: "/news",
    });

    return { success: "News published." };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to publish news.",
    };
  }
}

export async function deleteNews(id: string) {
  await requireAdmin();
  await prisma.news.delete({ where: { id } });
  scheduleAdminContentRefresh("news");
}

export async function gradeSubmission(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdmin();

    const submissionId = formData.get("submissionId")?.toString();
    const decision = formData.get("decision")?.toString() as
      | "APPROVED"
      | "REJECTED";
    const marksRaw = formData.get("marks")?.toString().trim();

    if (!submissionId || !decision) {
      return { error: "Missing submission or decision." };
    }

    const submission = await prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: { assignment: true },
    });

    if (!submission) {
      return { error: "Submission not found." };
    }

    if (submission.status !== "PENDING") {
      return { error: "This submission was already reviewed." };
    }

    if (decision === "APPROVED") {
      const marks = marksRaw
        ? Number(marksRaw)
        : submission.assignment.xpReward;

      if (Number.isNaN(marks) || marks < 0) {
        return { error: "Enter a valid mark value." };
      }

      await prisma.$transaction([
        prisma.assignmentSubmission.update({
          where: { id: submissionId },
          data: {
            status: "APPROVED",
            isCorrect: true,
            xpEarned: marks,
          },
        }),
        prisma.user.update({
          where: { id: submission.userId },
          data: { xp: { increment: marks } },
        }),
      ]);
      await syncUserRank(submission.userId);
    } else {
      await prisma.assignmentSubmission.update({
        where: { id: submissionId },
        data: {
          status: "REJECTED",
          isCorrect: false,
          xpEarned: 0,
        },
      });
    }

    after(async () => {
      await invalidateAfterGrading(submission.userId);
      revalidateAdmin();
    });

    scheduleNotifyUser({
      userId: submission.userId,
      type: "RESULT",
      title:
        decision === "APPROVED" ? "Assignment approved" : "Assignment rejected",
      body:
        decision === "APPROVED"
          ? `${submission.assignment.title} · marks assigned`
          : `${submission.assignment.title} · please review and retry if needed`,
      href: `/learn/${submission.assignmentId}`,
    });

    return {
      success:
        decision === "APPROVED" ? "Marks assigned." : "Submission rejected.",
    };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to grade submission.",
    };
  }
}
