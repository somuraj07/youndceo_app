import { getAdminUsers } from "@/lib/data/home";
import { UsersList } from "@/components/admin/users-list";

export default async function AdminUsersPage() {
  const users = await getAdminUsers();

  return (
    <UsersList
      users={users.map((u) => ({
        ...u,
        createdAt: u.createdAt.toISOString(),
      }))}
    />
  );
}
