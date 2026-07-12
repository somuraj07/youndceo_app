"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useTransition, useState } from "react";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/app/actions/notifications";
import { IconBell } from "@/components/ui/icons";

export type HeaderNotification = {
  id: string;
  type: "NEWS" | "ASSIGNMENT" | "RESULT";
  title: string;
  body: string;
  href: string | null;
  readAt: string | null;
  createdAt: string;
};

type NotificationBellProps = {
  notifications: HeaderNotification[];
  unreadCount: number;
};

function typeLabel(type: HeaderNotification["type"]) {
  if (type === "NEWS") return "News";
  if (type === "ASSIGNMENT") return "Task";
  return "Result";
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export function NotificationBell({
  notifications,
  unreadCount,
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function openItem(item: HeaderNotification) {
    startTransition(async () => {
      if (!item.readAt) {
        await markNotificationRead(item.id);
      }
      setOpen(false);
      if (item.href) {
        router.push(item.href);
      } else {
        router.refresh();
      }
    });
  }

  function markAll() {
    startTransition(async () => {
      await markAllNotificationsRead();
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        className="header-icon-btn relative"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <IconBell className="h-[1.15rem] w-[1.15rem]" />
        {unreadCount > 0 ? (
          <span className="notif-badge">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="notif-drawer-root" role="dialog" aria-modal="true">
          <button
            type="button"
            className="notif-drawer-backdrop"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
          />

          <aside className="notif-drawer-panel">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Notifications
                </p>
                {unreadCount > 0 ? (
                  <p className="text-[11px] text-muted">
                    {unreadCount} unread
                  </p>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                {notifications.length > 0 ? (
                  <button
                    type="button"
                    className="text-xs text-blue disabled:opacity-50"
                    disabled={pending}
                    onClick={markAll}
                  >
                    Mark all read
                  </button>
                ) : null}
                <button
                  type="button"
                  className="header-icon-btn h-9 w-9"
                  aria-label="Close"
                  onClick={() => setOpen(false)}
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="notif-drawer-list">
              {notifications.length === 0 ? (
                <p className="px-4 py-12 text-center text-sm text-muted">
                  No notifications yet
                </p>
              ) : (
                notifications.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openItem(item)}
                    className={`flex w-full flex-col gap-0.5 border-b border-white/5 px-4 py-3.5 text-left transition hover:bg-white/5 ${
                      item.readAt ? "opacity-70" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-semibold tracking-wide text-teal uppercase">
                        {typeLabel(item.type)}
                      </span>
                      <span className="text-[10px] text-muted">
                        {timeAgo(item.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {item.title}
                      {!item.readAt ? (
                        <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-blue align-middle" />
                      ) : null}
                    </p>
                    <p className="line-clamp-2 text-xs text-muted">{item.body}</p>
                  </button>
                ))
              )}
            </div>

            <Link
              href="/news"
              prefetch
              className="block border-t border-white/10 px-4 py-3 text-center text-xs font-medium text-blue"
              onClick={() => setOpen(false)}
            >
              Open newsfeed
            </Link>
          </aside>
        </div>
      ) : null}
    </>
  );
}
