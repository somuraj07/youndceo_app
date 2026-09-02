"use client";

import Link from "next/link";
import { NotificationBell } from "@/components/layout/notification-bell";
import type { HeaderNotification } from "@/components/layout/notification-bell";
import { UserAvatar } from "@/components/ui/user-avatar";

type HeaderActionsProps = {
  variant?: "student" | "admin";
  notifications?: HeaderNotification[];
  unreadCount?: number;
  avatarUrl?: string | null;
  name?: string;
  profileHref?: string;
};

export function HeaderActions({
  variant = "student",
  notifications = [],
  unreadCount = 0,
  avatarUrl,
  name = "",
  profileHref = "/profile",
}: HeaderActionsProps) {
  const isAdmin = variant === "admin";

  return (
    <div className="flex items-center gap-2.5">
      {!isAdmin ? (
        <NotificationBell
          notifications={notifications}
          unreadCount={unreadCount}
        />
      ) : null}
      {!isAdmin && name ? (
        <Link
          href={profileHref}
          prefetch
          aria-label="Go to profile"
          className="header-icon-btn overflow-hidden p-0"
        >
          <UserAvatar src={avatarUrl} name={name} size={36} />
        </Link>
      ) : null}
    </div>
  );
}
