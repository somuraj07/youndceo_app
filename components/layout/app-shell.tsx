import { AppHeader } from "@/components/layout/app-header";
import { BottomNav } from "@/components/layout/bottom-nav";

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
      className={`min-h-dvh pb-28 ${
        isAdmin ? "admin-shell pt-1" : "app-gradient-bg pt-1"
      }`}
    >
      {user ? (
        <AppHeader
          name={user.name}
          avatarUrl={user.avatarUrl}
          userId={user.id}
          variant={variant}
        />
      ) : null}

      <main
        className={`mx-auto px-4 py-4 sm:px-6 ${
          isAdmin ? "max-w-5xl lg:px-8" : "max-w-lg"
        }`}
      >
        {children}
      </main>

      <BottomNav variant={variant} />
    </div>
  );
}
