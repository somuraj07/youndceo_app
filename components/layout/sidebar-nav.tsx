"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { BrandLogo } from "@/components/brand/brand-logo";
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
    match: (pathname) => pathname === "/home",
  },
  { href: "/learn", label: "Learn", icon: IconLearn },
  { href: "/portfolio", label: "Portfolio", icon: IconWallet },
  { href: "/spend", label: "Spend", icon: IconSpend },
  { href: "/news", label: "News", icon: IconNews },
  { href: "/profile", label: "Profile", icon: IconProfile },
];

const adminNav: NavItem[] = [
  {
    href: "/admin",
    label: "Home",
    icon: IconAdmin,
    match: (pathname) => pathname === "/admin",
  },
  { href: "/admin/assignments", label: "Learning", icon: IconChallenges },
  { href: "/admin/users", label: "Users", icon: IconUsers },
  { href: "/admin/news", label: "News", icon: IconNews },
  { href: "/admin/settings", label: "Settings", icon: IconSettings },
];

type SidebarNavProps = {
  variant: "student" | "admin";
  user?: {
    id?: string;
    name: string;
    avatarUrl?: string | null;
  };
};

export function SidebarNav({ variant, user }: SidebarNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const items = variant === "admin" ? adminNav : studentNav;

  useEffect(() => {
    const routes = variant === "admin" ? adminNav : studentNav;
    for (const item of routes) {
      router.prefetch(item.href);
    }
  }, [variant, router]);

  const firstName = user?.name ? user.name.trim().split(/\s+/)[0] : variant === "admin" ? "Admin" : "Student";

  return (
    <aside className="sticky top-0 z-30 hidden h-screen w-64 shrink-0 flex-col border-r border-white/10 bg-background/60 p-5 backdrop-blur-2xl md:flex lg:w-72 xl:w-80 lg:p-6">
      {/* Brand Logo & Name */}
      <Link
        href={variant === "admin" ? "/admin" : "/home"}
        prefetch
        className="mb-6 flex items-center gap-3.5 px-2 lg:mb-8 md:gap-4"
      >
        <BrandLogo
          size={52}
          className="h-10 w-10 rounded-xl shadow-[0_6px_18px_rgba(88,28,135,0.28)] md:h-12 md:w-12 lg:h-14 lg:w-14"
        />
        <div className="flex flex-col">
          <span className="text-lg font-bold tracking-tight text-foreground md:text-xl lg:text-2xl">
            Young CEO
          </span>
          <span className="text-xs font-medium text-muted md:text-sm lg:text-base">
            {variant === "admin" ? "Admin Console" : "Wealth & Education"}
          </span>
        </div>
      </Link>

      {/* User Profile Card */}
      {user ? (
        <div className="mb-6 flex items-center gap-3.5 rounded-2xl border border-white/10 bg-white/5 p-3 md:p-3.5 lg:mb-8 lg:p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple/20 text-base font-semibold text-purple-soft md:h-12 md:w-12 md:text-lg lg:h-14 lg:w-14 lg:text-xl">
            {user.avatarUrl ? (
              // eslint-disable-next-next/no-img-element
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              firstName.charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground md:text-base lg:text-lg">
              {user.name}
            </p>
            <p className="text-xs text-muted md:text-sm lg:text-base">
              {variant === "admin" ? "Administrator" : "Student CEO"}
            </p>
          </div>
        </div>
      ) : null}

      {/* Nav Menu */}
      <nav className="flex-1 space-y-2 overflow-y-auto">
        <p className="px-3 pb-1 text-[11px] font-semibold tracking-wider text-muted uppercase md:text-xs lg:text-sm">
          Navigation
        </p>
        {items.map(({ href, label, icon: Icon, match }) => {
          const isActive = match
            ? match(pathname)
            : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              prefetch
              className={`flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-sm font-medium transition-all md:px-4 md:py-3.5 md:text-base lg:py-4 lg:text-lg ${
                isActive
                  ? "bg-purple/25 text-purple-soft font-bold border-l-4 border-purple shadow-sm"
                  : "text-muted hover:bg-white/5 hover:text-foreground"
              }`}
            >
              <Icon className={`h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 ${isActive ? "text-purple-soft" : "text-muted"}`} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer info */}
      <div className="mt-auto border-t border-white/10 pt-4 px-2">
        <p className="text-[11px] text-muted text-center md:text-xs lg:text-sm">
          Young CEO Platform © {new Date().getFullYear()}
        </p>
      </div>
    </aside>
  );
}
