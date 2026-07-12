"use server";

import { compare, hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildStoragePath, uploadToSupabase } from "@/lib/supabase";
import { invalidateUserCaches } from "@/lib/cache";

export type ProfileActionState = {
  error?: string;
  success?: string;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  name?: string;
  bio?: string;
};

export async function updateProfile(
  _prev: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "You must be signed in." };
  }

  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const bio = formData.get("bio")?.toString().trim() ?? "";
  const avatar = formData.get("avatar") as File | null;
  const cover = formData.get("cover") as File | null;

  if (!name || !email) {
    return { error: "Name and email are required." };
  }

  const existing = await prisma.user.findFirst({
    where: {
      email,
      NOT: { id: session.user.id },
    },
  });

  if (existing) {
    return { error: "That email is already in use." };
  }

  let avatarUrl: string | undefined;
  let coverUrl: string | undefined;

  if (avatar && avatar.size > 0) {
    try {
      const path = buildStoragePath(session.user.id, avatar.name);
      avatarUrl = await uploadToSupabase("avatars", path, avatar);
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : "Failed to upload avatar. Check Supabase storage config.",
      };
    }
  }

  if (cover && cover.size > 0) {
    try {
      const path = `covers/${buildStoragePath(session.user.id, cover.name)}`;
      coverUrl = await uploadToSupabase("avatars", path, cover);
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : "Failed to upload cover photo.",
      };
    }
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      email,
      bio,
      ...(avatarUrl ? { avatarUrl } : {}),
      ...(coverUrl ? { coverUrl } : {}),
    },
    select: { name: true, email: true, avatarUrl: true, coverUrl: true, bio: true },
  });

  const { unstable_update } = await import("@/auth");
  await unstable_update({
    user: {
      name: updated.name,
      email: updated.email,
      avatarUrl: updated.avatarUrl,
    },
  });

  await invalidateUserCaches(session.user.id);
  revalidatePath("/profile");
  revalidatePath("/home");
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");

  return {
    success: "Profile updated successfully.",
    avatarUrl: updated.avatarUrl,
    coverUrl: updated.coverUrl,
    name: updated.name,
    bio: updated.bio ?? "",
  };
}

export async function updatePassword(
  _prev: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "You must be signed in." };
  }

  const currentPassword = formData.get("currentPassword")?.toString();
  const newPassword = formData.get("newPassword")?.toString();
  const confirmPassword = formData.get("confirmPassword")?.toString();

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "All password fields are required." };
  }

  if (newPassword.length < 8) {
    return { error: "New password must be at least 8 characters." };
  }

  if (newPassword !== confirmPassword) {
    return { error: "New passwords do not match." };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return { error: "User not found." };
  }

  const isValid = await compare(currentPassword, user.password);

  if (!isValid) {
    return { error: "Current password is incorrect." };
  }

  const hashedPassword = await hash(newPassword, 12);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashedPassword },
  });

  return { success: "Password updated successfully." };
}
