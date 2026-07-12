import { getAdminAssignmentsData } from "@/lib/data/home";
import { AssignmentsManager } from "@/components/admin/assignments-manager";

export default async function AdminAssignmentsPage() {
  const data = await getAdminAssignmentsData();

  return (
    <AssignmentsManager
      assignments={data.assignments}
      submissions={data.submissions.map((s) => ({
        ...s,
        createdAt: s.createdAt.toISOString(),
      }))}
    />
  );
}
