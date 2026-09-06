import { AppHeader } from "@/components/layout/app-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { SidebarNav } from "@/components/layout/sidebar-nav";

type AdminShellProps = {
  children: React.ReactNode;
  user: {
    id?: string;
    name: string;
    avatarUrl?: string | null;
  };
};

export function AdminShell({ children, user }: AdminShellProps) {
  return (
    <div className="admin-shell relative min-h-dvh flex flex-col md:flex-row">
      <SidebarNav variant="admin" user={user} />

      <div className="relative flex flex-1 flex-col min-w-0 pb-28 md:pb-8">
        <div className="admin-shell-glow pointer-events-none absolute inset-x-0 top-0 h-64" />

        <AppHeader
          name={user.name}
          avatarUrl={user.avatarUrl}
          userId={user.id}
          variant="admin"
        />

        <main className="relative mx-auto w-full max-w-5xl lg:max-w-6xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          {children}
        </main>
      </div>

      <BottomNav variant="admin" />
    </div>
  );
}
