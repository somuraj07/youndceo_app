import Link from "next/link";
import { IconWallet } from "@/components/ui/icons";

type HomePortfolioSnapshotProps = {
  piggyBalance: number;
  savingsTotal: number;
  fundsTotal: number;
};

function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function HomePortfolioSnapshot({
  piggyBalance,
  savingsTotal,
  fundsTotal,
}: HomePortfolioSnapshotProps) {
  const items = [
    { label: "Piggy Bank", value: piggyBalance },
    { label: "Savings", value: savingsTotal },
    { label: "Mutual Funds", value: fundsTotal },
  ];

  const total = piggyBalance + savingsTotal + fundsTotal;

  return (
    <section className="fade-up space-y-3.5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground md:text-2xl lg:text-3xl lg:font-bold">
            Portfolio
          </h2>
          <p className="text-sm text-muted md:text-base lg:text-lg">
            Your savings at a glance
          </p>
        </div>
        <Link
          href="/portfolio"
          prefetch
          className="flex items-center gap-1.5 rounded-full bg-teal/15 px-3 py-1.5 text-sm font-medium text-teal md:px-4 md:py-2 md:text-base font-bold"
        >
          <IconWallet className="h-4 w-4 md:h-5 md:w-5" />
          View all
        </Link>
      </div>

      <Link
        href="/portfolio"
        prefetch
        className="glass block rounded-2xl p-4 transition hover:bg-white/5 md:p-6 lg:p-7"
      >
        <div className="mb-4 flex items-baseline justify-between">
          <span className="text-sm font-medium text-muted md:text-base lg:text-lg">
            Total value
          </span>
          <span className="text-xl font-bold text-foreground md:text-3xl lg:text-4xl md:font-extrabold text-teal">
            {formatInr(total)}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          {items.map(({ label, value }) => (
            <div
              key={label}
              className="rounded-xl bg-white/5 p-3 text-center md:p-4 border border-white/5"
            >
              <p className="text-base font-bold text-foreground md:text-xl lg:text-2xl">
                {formatInr(value)}
              </p>
              <p className="mt-1 text-sm text-muted md:text-base font-medium">{label}</p>
            </div>
          ))}
        </div>
      </Link>
    </section>
  );
}
