import { AppHeader } from "@/components/layout/app-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { WhatsAppHelp } from "@/components/layout/whatsapp-help";

type AppShellProps = {
  children: React.ReactNode;
  variant: "student" | "admin";
  user?: {
    id?: string;
    name: string;
    avatarUrl?: string | null;
  };
};

export function AppShell({ children, variant, user }: AppShellProps) {
  const isAdmin = variant === "admin";

  return (
    <div
      className={`min-h-dvh flex flex-col md:flex-row ${
        isAdmin ? "admin-shell pt-1" : "app-gradient-bg pt-1"
      }`}
    >
      <SidebarNav variant={variant} user={user} />

      <div className="flex flex-1 flex-col min-w-0 pb-28 md:pb-8">
        {user ? (
          <AppHeader
            name={user.name}
            avatarUrl={user.avatarUrl}
            userId={user.id}
            variant={variant}
          />
        ) : null}

        <main className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 md:px-8 lg:px-10">
          {children}
        </main>
      </div>

      <BottomNav variant={variant} />
      {!isAdmin ? <WhatsAppHelp /> : null}
    </div>
  );
}
