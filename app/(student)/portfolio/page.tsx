import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getPortfolioData } from "@/lib/data/home";
import { PortfolioPanel } from "@/components/student/portfolio-panel";

export default async function PortfolioPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const data = await getPortfolioData(session.user.id);

  return (
    <PortfolioPanel
      savings={data.savingsAccounts.map((a) => ({
        id: a.id,
        name: a.name,
        balance: a.balance,
      }))}
      funds={data.funds.map((f) => ({
        id: f.id,
        name: f.name,
        symbol: f.symbol,
        price: f.price,
      }))}
      sips={data.sipPlans.map((s) => ({
        id: s.id,
        name: s.name,
        monthlyAmount: s.monthlyAmount,
        expectedRate: s.expectedRate,
        years: s.years,
        fundSymbol: s.fundSymbol,
      }))}
    />
  );
}
