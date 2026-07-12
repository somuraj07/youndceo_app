import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppShell } from "@/components/layout/app-shell";
import { isAdmin } from "@/lib/permissions";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/api/auth/signout?callbackUrl=/login");
  }

  if (isAdmin(session.user.role)) {
    redirect("/admin");
  }

  return (
    <AppShell
      variant="student"
      user={{
        id: session.user.id,
        name: session.user.name ?? "Student",
        avatarUrl: session.user.avatarUrl ?? session.user.image ?? null,
      }}
    >
      {children}
    </AppShell>
  );
}
