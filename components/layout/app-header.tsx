import { HeaderActions } from "@/components/layout/header-actions";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  getUnreadNotificationCount,
  getUserNotifications,
} from "@/lib/notifications";
import Link from "next/link";

type AppHeaderProps = {
  name: string;
  avatarUrl?: string | null;
  userId?: string;
  variant?: "student" | "admin";
};

export async function AppHeader({
  name,
  avatarUrl,
  userId,
  variant = "student",
}: AppHeaderProps) {
  const firstName =
    name.trim().split(/\s+/)[0] || (variant === "admin" ? "Admin" : "CEO");
  const profileHref = variant === "admin" ? "/admin/settings" : "/profile";
  const maxWidth = variant === "admin" ? "max-w-5xl" : "max-w-lg";

  const [notifications, unreadCount] =
    variant === "student" && userId
      ? await Promise.all([
          getUserNotifications(userId),
          getUnreadNotificationCount(userId),
        ])
      : [[], 0];

  return (
    <header className="sticky top-0 z-40 px-4 pt-3 sm:px-6 lg:px-8">
      <div
        className={`mx-auto flex w-full items-center justify-between gap-3 ${maxWidth}`}
      >
        <Link
          href={profileHref}
          prefetch
          className="flex min-w-0 items-center gap-3"
        >
          <UserAvatar
            src={avatarUrl}
            name={name}
            size={44}
            className="ring-2 ring-white/15"
          />
          <div className="min-w-0">
            <p className="truncate text-[15px] leading-tight text-muted">
              Hello,{" "}
              <span className="font-semibold text-foreground">{firstName}</span>
            </p>
            {variant === "admin" ? (
              <p className="text-[11px] text-muted">Admin</p>
            ) : null}
          </div>
        </Link>
        <HeaderActions
          variant={variant}
          unreadCount={unreadCount}
          notifications={notifications.map((n) => ({
            id: n.id,
            type: n.type,
            title: n.title,
            body: n.body,
            href: n.href,
            readAt: n.readAt?.toISOString() ?? null,
            createdAt: n.createdAt.toISOString(),
          }))}
        />
      </div>
    </header>
  );
}
