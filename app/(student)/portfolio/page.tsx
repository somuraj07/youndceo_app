import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getPortfolioData } from "@/lib/data/home";
import { PortfolioPanel } from "@/components/student/portfolio-panel";
import { isAdmin } from "@/lib/permissions";

export default async function PortfolioPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (isAdmin(session.user.role)) {
    redirect("/admin");
  }

  const data = await getPortfolioData(session.user.id);

  return (
    <PortfolioPanel
      piggyBalance={data.cashWallet.balance}
      savings={data.savingsAccounts.map((a) => ({
        id: a.id,
        name: a.name,
        balance: a.balance,
        rate: a.rate,
        years: a.years,
      }))}
    />
  );
}
