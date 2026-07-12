import Link from "next/link";
import {
  IconLearn,
  IconNews,
  IconSpend,
  IconWallet,
} from "@/components/ui/icons";

type HomeCoverProps = {
  firstName: string;
  myMoney: number;
  goalSaved: number;
  goalTarget: number;
  goalCount: number;
  pendingLessons: number;
  streak: number;
};

function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function HomeCover({
  firstName,
  myMoney,
  goalSaved,
  goalTarget,
  goalCount,
  pendingLessons,
  streak,
}: HomeCoverProps) {
  const progress =
    goalTarget <= 0 ? 0 : Math.min(100, Math.round((goalSaved / goalTarget) * 100));
  const netPositive = myMoney >= 0;

  return (
    <section className="home-cover fade-up relative overflow-hidden rounded-[1.85rem] p-5 sm:p-6">
      <div className="home-cover-glow pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative z-[1] space-y-5">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.18em] text-cyan uppercase">
            Young CEO Plan
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {firstName}, grow your money skills
          </h1>
          <p className="mt-2 max-w-sm text-sm text-muted">
            Learn, save, and invest — your personal finance workspace.
          </p>
        </div>

        <Link
          href="/spend"
          prefetch
          className="block rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition hover:bg-white/10"
        >
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs text-muted">My money</p>
              <p
                className={`mt-1 text-2xl font-bold tracking-tight ${
                  netPositive ? "text-foreground" : "text-red"
                }`}
              >
                {netPositive ? "" : "−"}
                {formatInr(Math.abs(myMoney))}
              </p>
              <p className="mt-0.5 text-xs text-muted">
                This month’s net · income − expenses
              </p>
            </div>
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-cyan">
              <IconWallet className="h-5 w-5" />
            </span>
          </div>
        </Link>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs text-muted">Savings toward goals</p>
              <p className="mt-1 text-xl font-bold tracking-tight text-foreground">
                {formatInr(goalSaved)}
              </p>
              <p className="mt-0.5 text-xs text-muted">
                of {formatInr(Math.max(goalTarget, 0))}
                {goalCount > 0
                  ? ` · ${goalCount} goal${goalCount === 1 ? "" : "s"}`
                  : " · set a goal below"}
              </p>
            </div>
            <p className="text-xl font-bold text-cyan">{progress}%</p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="home-cover-bar h-full rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[
            { href: "/learn", label: "Learn", icon: IconLearn },
            { href: "/portfolio", label: "Invest", icon: IconWallet },
            { href: "/spend", label: "Spend", icon: IconSpend },
            { href: "/news", label: "News", icon: IconNews },
          ].map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              prefetch
              className="home-cover-chip flex flex-col items-center gap-1.5 rounded-2xl px-2 py-3 text-center transition"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-foreground">
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-[10px] font-medium text-foreground">{label}</span>
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
          {pendingLessons > 0 ? (
            <Link href="/learn" prefetch className="font-medium text-cyan">
              {pendingLessons} lesson{pendingLessons === 1 ? "" : "s"} waiting →
            </Link>
          ) : (
            <Link href="/learn" prefetch className="font-medium text-cyan">
              Continue learning →
            </Link>
          )}
          {streak > 0 ? (
            <span>{streak}-day learning streak</span>
          ) : (
            <span>Start a learning streak today</span>
          )}
        </div>
      </div>
    </section>
  );
}
