import Link from "next/link";
import {
  IconLearn,
  IconNews,
  IconProfile,
  IconSpend,
  IconWallet,
} from "@/components/ui/icons";

const links = [
  { href: "/learn", label: "Learn", icon: IconLearn },
  { href: "/portfolio", label: "Invest", icon: IconWallet },
  { href: "/spend", label: "Spend", icon: IconSpend },
  { href: "/news", label: "News", icon: IconNews },
  { href: "/profile", label: "Profile", icon: IconProfile },
] as const;

export function HomeQuickNav() {
  return (
    <section className="fade-up space-y-3">
      <div>
        <h2 className="font-semibold text-foreground">Quick links</h2>
        <p className="text-[11px] text-muted">Jump to any section</p>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            prefetch
            className="home-cover-chip flex flex-col items-center gap-1.5 rounded-2xl px-1 py-3 text-center transition"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-foreground">
              <Icon className="h-4 w-4" />
            </span>
            <span className="text-[10px] font-medium text-foreground">
              {label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
