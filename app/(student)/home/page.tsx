import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getHomePageData, getPortfolioData } from "@/lib/data/home";
import { HomeGoals } from "@/components/student/home-goals";
import { HomePortfolioSnapshot } from "@/components/student/home-quick-nav";
import { MarketPulse } from "@/components/student/market-pulse";

export default async function PlanHomePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/api/auth/signout?callbackUrl=/login");
  }

  const [data, portfolio] = await Promise.all([
    getHomePageData(session.user.id),
    getPortfolioData(session.user.id),
  ]);

  if (!data) {
    redirect("/api/auth/signout?callbackUrl=/login");
  }

  const { goals } = data;

  const savingsTotal = portfolio.savingsAccounts
    .filter((a) => a.kind === "SAVINGS")
    .reduce((sum, a) => sum + a.balance, 0);
  const fundsTotal = portfolio.savingsAccounts
    .filter((a) => a.kind === "MUTUAL_FUND")
    .reduce((sum, a) => sum + a.balance, 0);

  return (
    <div className="space-y-6">
      <div className="fade-up">
        <MarketPulse />
      </div>

      <div className="relative z-10">
        <HomeGoals
          goals={goals.map((g) => ({
            id: g.id,
            title: g.title,
            icon: g.icon,
            targetAmount: g.targetAmount,
            currentAmount: g.currentAmount,
            deadline: g.deadline?.toISOString() ?? null,
          }))}
        />
      </div>

      <HomePortfolioSnapshot
        piggyBalance={portfolio.cashWallet.balance}
        savingsTotal={savingsTotal}
        fundsTotal={fundsTotal}
      />
    </div>
  );
}
