import { BrandLogo } from "@/components/brand/brand-logo";
import { HeaderActions } from "@/components/layout/header-actions";
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
  const homeHref = variant === "admin" ? "/admin" : "/home";
  const profileHref = variant === "admin" ? "/admin/settings" : "/profile";
  const maxWidth = "max-w-7xl";

  const [notifications, unreadCount] =
    variant === "student" && userId
      ? await Promise.all([
          getUserNotifications(userId),
          getUnreadNotificationCount(userId),
        ])
      : [[], 0];

  return (
    <header className="sticky top-0 z-40 px-4 pt-3 sm:px-6 md:px-8 lg:px-10">
      <div
        className={`mx-auto flex w-full items-center justify-between gap-3 ${maxWidth}`}
      >
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href={homeHref}
            prefetch
            aria-label="Young CEO home"
            className="shrink-0 md:hidden"
          >
            <BrandLogo
              size={40}
              className="h-10 w-10 rounded-[0.85rem] shadow-[0_6px_18px_rgba(88,28,135,0.28)]"
            />
          </Link>
          <Link
            href={profileHref}
            prefetch
            className="min-w-0"
          >
            <div className="min-w-0">
              <p className="truncate text-base leading-tight text-muted md:text-xl lg:text-2xl font-medium">
                Hello,{" "}
                <span className="font-bold text-foreground">
                  {firstName}
                </span>
              </p>
              {variant === "admin" ? (
                <p className="text-[11px] text-muted md:text-xs lg:text-sm">Admin</p>
              ) : null}
            </div>
          </Link>
        </div>
        <HeaderActions
          variant={variant}
          avatarUrl={avatarUrl}
          name={name}
          profileHref={profileHref}
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
