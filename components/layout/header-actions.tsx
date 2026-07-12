"use client";

import { useTheme } from "@/components/theme/theme-provider";
import { NotificationBell } from "@/components/layout/notification-bell";
import type { HeaderNotification } from "@/components/layout/notification-bell";

type HeaderActionsProps = {
  variant?: "student" | "admin";
  notifications?: HeaderNotification[];
  unreadCount?: number;
};

export function HeaderActions({
  variant = "student",
  notifications = [],
  unreadCount = 0,
}: HeaderActionsProps) {
  const { resolved, setPreference } = useTheme();
  const isAdmin = variant === "admin";
  const isDark = resolved === "dark";

  function toggleTheme() {
    setPreference(isDark ? "light" : "dark");
  }

  return (
    <div className="flex items-center gap-2.5">
      {!isAdmin ? (
        <NotificationBell
          notifications={notifications}
          unreadCount={unreadCount}
        />
      ) : null}
      <button
        type="button"
        onClick={toggleTheme}
        className="header-icon-btn header-icon-btn-theme"
        aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
        title={isDark ? "Light" : "Dark"}
      >
        <span className="text-lg leading-none" aria-hidden>
          {isDark ? "☾" : "☀"}
        </span>
      </button>
    </div>
  );
}
