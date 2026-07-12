"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  IconAdmin,
  IconChallenges,
  IconHome,
  IconLearn,
  IconNews,
  IconProfile,
  IconSettings,
  IconSpend,
  IconUsers,
  IconWallet,
} from "@/components/ui/icons";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  match?: (pathname: string) => boolean;
};

const studentNav: NavItem[] = [
  {
    href: "/home",
    label: "Plan",
    icon: IconHome,
    match: (pathname) => pathname === "/home" || pathname.startsWith("/news"),
  },
  { href: "/learn", label: "Learn", icon: IconLearn },
  { href: "/portfolio", label: "Portfolio", icon: IconWallet },
  { href: "/spend", label: "Spend", icon: IconSpend },
  { href: "/profile", label: "Profile", icon: IconProfile },
];

const adminNav: NavItem[] = [
  {
    href: "/admin",
    label: "Home",
    icon: IconAdmin,
    match: (pathname) => pathname === "/admin",
  },
  { href: "/admin/assignments", label: "Tasks", icon: IconChallenges },
  { href: "/admin/users", label: "Users", icon: IconUsers },
  { href: "/admin/news", label: "News", icon: IconNews },
  { href: "/admin/settings", label: "Settings", icon: IconSettings },
];

type BottomNavProps = {
  variant: "student" | "admin";
};

export function BottomNav({ variant }: BottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const items = variant === "admin" ? adminNav : studentNav;

  useEffect(() => {
    const routes = variant === "admin" ? adminNav : studentNav;
    for (const item of routes) {
      router.prefetch(item.href);
    }
  }, [variant, router]);

  return (
    <nav
      className={`nav-dock px-2 py-2 ${
        variant === "admin" ? "nav-dock-wide" : ""
      }`}
    >
      <div className="mx-auto flex h-14 max-w-lg items-center justify-around gap-0.5">
        {items.map(({ href, label, icon: Icon, match }) => {
          const isActive = match
            ? match(pathname)
            : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              prefetch
              className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 px-0.5 ${
                isActive ? "nav-item-active" : "nav-item-idle"
              }`}
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
                  isActive ? "nav-active-glow" : ""
                }`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="nav-item-label truncate text-[9px] font-medium sm:text-[10px]">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
