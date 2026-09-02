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
    <section className="fade-up space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Portfolio</h2>
          <p className="text-sm text-muted">Your savings at a glance</p>
        </div>
        <Link
          href="/portfolio"
          prefetch
          className="flex items-center gap-1.5 rounded-full bg-teal/15 px-3 py-1.5 text-sm font-medium text-teal"
        >
          <IconWallet className="h-4 w-4" />
          View all
        </Link>
      </div>

      <Link
        href="/portfolio"
        prefetch
        className="glass block rounded-2xl p-4 transition hover:bg-white/5"
      >
        <div className="mb-3 flex items-baseline justify-between">
          <span className="text-sm font-medium text-muted">Total value</span>
          <span className="text-xl font-bold text-foreground">
            {formatInr(total)}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {items.map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-base font-bold text-foreground">
                {formatInr(value)}
              </p>
              <p className="mt-0.5 text-sm text-muted">{label}</p>
            </div>
          ))}
        </div>
      </Link>
    </section>
  );
}
