import { getAdminDashboardData } from "@/lib/data/home";
import { AdminOverview } from "@/components/admin/admin-overview";

export default async function AdminPage() {
  const data = await getAdminDashboardData();

  const approved = data.submissions.filter((s) => s.status === "APPROVED").length;
  const rejected = data.submissions.filter((s) => s.status === "REJECTED").length;
  const mcqCount = data.assignments.filter((a) => a.type === "MCQ").length;
  const fillCount = data.assignments.filter(
    (a) => a.type === "FILL_IN_BLANK",
  ).length;

  const topStudents = data.users
    .filter((u) => u.role === "USER")
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 5)
    .map((u) => ({
      name: u.name,
      xp: u.xp,
      streak: u.streak,
    }));

  return (
    <AdminOverview
      data={{
        stats: {
          ...data.stats,
          approved,
          rejected,
          mcqCount,
          fillCount,
        },
        analytics: data.analytics,
        topStudents,
      }}
    />
  );
}
