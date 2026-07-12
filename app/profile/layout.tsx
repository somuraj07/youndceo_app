import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppShell } from "@/components/layout/app-shell";
import { isAdmin } from "@/lib/permissions";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const admin = isAdmin(session.user.role);

  return (
    <AppShell
      variant={admin ? "admin" : "student"}
      user={{
        id: session.user.id,
        name: session.user.name ?? (admin ? "Admin" : "Student"),
        avatarUrl: session.user.avatarUrl ?? session.user.image ?? null,
      }}
    >
      {children}
    </AppShell>
  );
}
