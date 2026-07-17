import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getHomePageData } from "@/lib/data/home";
import { HomeGoals } from "@/components/student/home-goals";
import { MarketPulse } from "@/components/student/market-pulse";

export default async function PlanHomePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/api/auth/signout?callbackUrl=/login");
  }

  const data = await getHomePageData(session.user.id);

  if (!data) {
    redirect("/api/auth/signout?callbackUrl=/login");
  }

  const { goals } = data;

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
    </div>
  );
}
