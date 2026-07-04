import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/permissions";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (!isAdmin(session.user.role)) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-amber-700">
              Admin only
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-zinc-900">
              Admin panel
            </h1>
          </div>

          <Link
            href="/dashboard"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            Back to dashboard
          </Link>
        </div>

        <p className="mt-4 text-sm text-zinc-600">
          This route is protected by role-based access control. Only users with
          the ADMIN role can view this page.
        </p>
      </div>
    </main>
  );
}
