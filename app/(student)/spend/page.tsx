import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getSpendData } from "@/lib/data/home";
import { SpendPanel } from "@/components/student/spend-panel";

export default async function SpendPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const data = await getSpendData(session.user.id);

  return (
    <SpendPanel
      monthExpenseTotal={data.monthExpenseTotal}
      monthIncomeTotal={data.monthIncomeTotal}
      monthNet={data.monthNet}
      expenses={data.expenses.map((e) => ({
        id: e.id,
        title: e.title,
        amount: e.amount,
        category: e.category,
        kind: e.kind,
        spentAt: e.spentAt.toISOString(),
      }))}
    />
  );
}
