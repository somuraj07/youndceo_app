"use client";

import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import {
  updatePassword,
  updateProfile,
  type ProfileActionState,
} from "@/app/actions/profile";
import { logout } from "@/app/actions/auth";
import { useTheme } from "@/components/theme/theme-provider";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  IconBell,
  IconLearn,
  IconProfile,
  IconSettings,
  IconWallet,
} from "@/components/ui/icons";

const initialState: ProfileActionState = {};

export type ProfileStudioUser = {
  id: string;
  name: string;
  email: string;
  bio: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  role: string;
  streak: number;
};

export type ProfileStudioStats = {
  goals: number;
  lessonsDone: number;
  savedPercent: number;
};

type Mode = "profile" | "edit" | "settings";

type ProfileStudioProps = {
  user: ProfileStudioUser;
  stats: ProfileStudioStats;
  settingsHref?: string;
};

export function ProfileStudio({ user, stats }: ProfileStudioProps) {
  const [mode, setMode] = useState<Mode>("profile");
  const [profileState, profileAction, profilePending] = useActionState(
    updateProfile,
    initialState,
  );
  const [passwordState, passwordAction, passwordPending] = useActionState(
    updatePassword,
    initialState,
  );
  const { preference, resolved, setPreference } = useTheme();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const displayAvatar = profileState.avatarUrl ?? user.avatarUrl;
  const displayCover = coverPreview ?? profileState.coverUrl ?? user.coverUrl;
  const displayName = profileState.name ?? user.name;
  const displayBio = profileState.bio ?? user.bio;
  const isAdmin = user.role === "ADMIN";

  function onCoverPicked(file: File | null) {
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    if (!file) {
      setCoverPreview(null);
      return;
    }
    setCoverPreview(URL.createObjectURL(file));
  }

  if (mode === "edit") {
    return (
      <div className="profile-studio fade-up mx-auto max-w-lg">
        <header className="mb-4 flex items-center gap-3 px-1">
          <button
            type="button"
            onClick={() => setMode("profile")}
            className="profile-icon-btn"
            aria-label="Back"
          >
            ←
          </button>
          <h1 className="flex-1 text-center text-lg font-semibold text-foreground">
            Edit Profile
          </h1>
          <span className="w-10" />
        </header>

        <form action={profileAction} className="space-y-5">
          <div className="relative">
            <div className="relative overflow-hidden rounded-[1.25rem]">
              <ProfileCover src={displayCover} edit />
              <button
                type="button"
                className="profile-cover-edit-btn"
                aria-label="Change cover"
                onClick={() => coverInputRef.current?.click()}
              >
                ✎ Cover
              </button>
              <input
                ref={coverInputRef}
                name="cover"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onCoverPicked(e.target.files?.[0] ?? null)}
              />
            </div>
            <div className="relative -mt-12 flex flex-col items-center px-4">
              <div className="relative">
                <UserAvatar
                  src={displayAvatar}
                  name={displayName}
                  size={96}
                  className="ring-4 ring-[var(--background)]"
                />
                <button
                  type="button"
                  className="profile-edit-fab"
                  aria-label="Change photo"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  ✎
                </button>
                <input
                  ref={avatarInputRef}
                  name="avatar"
                  type="file"
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <p className="mt-3 text-center text-lg font-bold tracking-wide text-foreground uppercase">
                {displayName}
              </p>
            </div>
          </div>

          <div className="space-y-3 px-1">
            <Field label="Full Name" name="name" defaultValue={user.name} required />
            <Field
              label="Email Address"
              name="email"
              type="email"
              defaultValue={user.email}
              required
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Bio
              </label>
              <textarea
                name="bio"
                rows={3}
                defaultValue={user.bio ?? ""}
                placeholder="Tell others about your money goals..."
                className="profile-field w-full resize-none"
              />
            </div>
          </div>

          {profileState.error ? (
            <p className="px-1 text-sm text-red">{profileState.error}</p>
          ) : null}
          {profileState.success ? (
            <p className="px-1 text-sm text-green">{profileState.success}</p>
          ) : null}

          <button
            type="submit"
            disabled={profilePending}
            className="profile-primary-btn w-full disabled:opacity-60"
          >
            {profilePending ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    );
  }

  if (mode === "settings") {
    return (
      <div className="profile-studio fade-up mx-auto max-w-lg space-y-5">
        <header className="flex items-center gap-3 px-1">
          <button
            type="button"
            onClick={() => setMode("profile")}
            className="profile-icon-btn"
            aria-label="Back"
          >
            ←
          </button>
          <h1 className="flex-1 text-center text-lg font-semibold text-foreground">
            My Settings
          </h1>
          <span className="w-10" />
        </header>

        <button
          type="button"
          onClick={() => setMode("edit")}
          className="profile-settings-card flex w-full items-center gap-3 rounded-2xl p-3 text-left"
        >
          <UserAvatar src={displayAvatar} name={displayName} size={48} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-foreground">{displayName}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>
          <span className="text-muted">›</span>
        </button>

        <div className="profile-promo rounded-2xl p-4">
          <p className="text-sm font-semibold text-white">Young CEO Hub</p>
          <p className="mt-1 text-xs text-white/80">
            Learn · Save · Invest — your money skills workspace.
          </p>
        </div>

        <section className="space-y-2">
          <p className="px-1 text-xs font-semibold tracking-wide text-muted uppercase">
            General
          </p>
          <div className="profile-settings-card overflow-hidden rounded-2xl">
            <Link href="/news" className="settings-row">
              <span className="settings-row-icon">
                <IconBell className="h-4 w-4" />
              </span>
              <span className="flex-1 text-sm text-foreground">Notifications</span>
              <span className="text-muted">›</span>
            </Link>
            <Link href="/learn" className="settings-row">
              <span className="settings-row-icon">
                <IconLearn className="h-4 w-4" />
              </span>
              <span className="flex-1 text-sm text-foreground">Learning</span>
              <span className="text-muted">›</span>
            </Link>
            <Link href="/portfolio" className="settings-row">
              <span className="settings-row-icon">
                <IconWallet className="h-4 w-4" />
              </span>
              <span className="flex-1 text-sm text-foreground">Portfolio</span>
              <span className="text-muted">›</span>
            </Link>
            <div className="settings-row">
              <span className="settings-row-icon">
                <IconSettings className="h-4 w-4" />
              </span>
              <span className="flex-1 text-sm text-foreground">Dark Mode</span>
              <button
                type="button"
                role="switch"
                aria-checked={resolved === "dark"}
                onClick={() =>
                  setPreference(resolved === "dark" ? "light" : "dark")
                }
                className={`theme-switch ${resolved === "dark" ? "theme-switch-on" : ""}`}
              >
                <span className="theme-switch-knob" />
              </button>
            </div>
            <div className="settings-row border-0">
              <span className="settings-row-icon">
                <IconProfile className="h-4 w-4" />
              </span>
              <span className="flex-1 text-sm text-foreground">Theme</span>
              <span className="text-xs capitalize text-muted">{preference}</span>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <p className="px-1 text-xs font-semibold tracking-wide text-muted uppercase">
            Security
          </p>
          <form
            action={passwordAction}
            className="profile-settings-card space-y-3 rounded-2xl p-4"
          >
            <p className="text-sm font-medium text-foreground">Reset password</p>
            <input
              name="currentPassword"
              type="password"
              placeholder="Current password"
              required
              className="profile-field w-full"
            />
            <input
              name="newPassword"
              type="password"
              placeholder="New password"
              minLength={8}
              required
              className="profile-field w-full"
            />
            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              minLength={8}
              required
              className="profile-field w-full"
            />
            {passwordState.error ? (
              <p className="text-sm text-red">{passwordState.error}</p>
            ) : null}
            {passwordState.success ? (
              <p className="text-sm text-green">{passwordState.success}</p>
            ) : null}
            <button
              type="submit"
              disabled={passwordPending}
              className="w-full rounded-xl border border-border bg-white/5 px-4 py-2.5 text-sm font-medium text-foreground disabled:opacity-60"
            >
              {passwordPending ? "Updating..." : "Update password"}
            </button>
          </form>
        </section>

        <form action={logout}>
          <button
            type="submit"
            className="w-full rounded-2xl border border-red/30 bg-red/10 px-4 py-3.5 text-sm font-semibold text-red"
          >
            Sign out
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="profile-studio fade-up mx-auto max-w-lg">
      <div className="relative">
        <ProfileCover src={displayCover} />
        <div className="relative -mt-14 flex flex-col items-center px-4">
          <div className="relative">
            <UserAvatar
              src={displayAvatar}
              name={displayName}
              size={104}
              className="profile-avatar-ring"
            />
          </div>
          <h1 className="mt-3 text-center text-xl font-bold tracking-wide text-foreground uppercase">
            {displayName}
          </h1>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            <span className="profile-tag">
              <IconLearn className="h-3.5 w-3.5" />
              Learning
            </span>
            <span className="profile-tag">
              <IconWallet className="h-3.5 w-3.5" />
              Investing
            </span>
            {isAdmin ? <span className="profile-tag">Admin</span> : null}
          </div>
        </div>
      </div>

      {!isAdmin ? (
        <div className="mt-5 grid grid-cols-3 gap-2 px-1">
          <Stat label="Goals" value={String(stats.goals)} />
          <Stat label="Lessons" value={String(stats.lessonsDone)} />
          <Stat label="Saved" value={`${stats.savedPercent}%`} />
        </div>
      ) : (
        <p className="mt-5 px-1 text-center text-sm text-muted">{user.email}</p>
      )}

      <div className="mt-5 flex items-center gap-2 px-1">
        <button
          type="button"
          onClick={() => setMode("edit")}
          className="profile-primary-btn flex flex-1 items-center justify-center gap-2"
        >
          <span aria-hidden>✎</span>
          Edit Profile
        </button>
        <button
          type="button"
          onClick={() => setMode("settings")}
          className="profile-icon-btn h-12 w-12 shrink-0"
          aria-label="Settings"
        >
          <IconSettings className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-6 space-y-3 px-1">
        <div className="flex gap-4 border-b border-white/10 pb-2 text-sm">
          <span className="profile-tab-active">Overview</span>
          <Link href="/learn" className="text-muted">
            Learn
          </Link>
          <Link href="/news" className="text-muted">
            News
          </Link>
        </div>

        <div className="profile-settings-card rounded-2xl p-4">
          <p className="text-xs font-semibold tracking-wide text-muted uppercase">
            About
          </p>
          <p className="mt-2 text-sm text-foreground">
            {displayBio?.trim() ||
              "Add a short bio about your finance goals and learning focus."}
          </p>
          {user.streak > 0 ? (
            <p className="mt-3 text-xs text-teal">
              {user.streak}-day learning streak
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ProfileCover({
  src,
  edit = false,
}: {
  src?: string | null;
  edit?: boolean;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        className={`profile-cover-img ${edit ? "profile-cover-edit" : ""}`}
      />
    );
  }

  return (
    <div className={`profile-cover ${edit ? "profile-cover-edit" : ""}`} />
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  defaultValue: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        className="profile-field w-full"
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-lg font-bold text-foreground">{value}</p>
      <p className="text-[11px] text-muted">{label}</p>
    </div>
  );
}
