import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminShell } from "@/components/layout/admin-shell";
import { isAdmin } from "@/lib/permissions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (!isAdmin(session.user.role)) {
    redirect("/home");
  }

  return (
    <AdminShell
      user={{
        id: session.user.id,
        name: session.user.name ?? "Admin",
        avatarUrl: session.user.avatarUrl ?? session.user.image ?? null,
      }}
    >
      {children}
    </AdminShell>
  );
}
