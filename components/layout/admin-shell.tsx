import { AppHeader } from "@/components/layout/app-header";
import { BottomNav } from "@/components/layout/bottom-nav";

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
    <div className="admin-shell relative min-h-dvh pb-28">
      <div className="admin-shell-glow pointer-events-none absolute inset-x-0 top-0 h-64" />

      <div className="relative">
        <AppHeader
          name={user.name}
          avatarUrl={user.avatarUrl}
          userId={user.id}
          variant="admin"
        />
      </div>

      <main className="relative mx-auto w-full max-w-5xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        {children}
      </main>

      <BottomNav variant="admin" />
    </div>
  );
}
