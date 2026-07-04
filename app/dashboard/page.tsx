import Link from "next/link";
import { auth } from "@/auth";
import { logout } from "@/app/actions/auth";
import { isAdmin } from "@/lib/permissions";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const { user } = session;

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">Dashboard</h1>
            <p className="mt-2 text-sm text-zinc-600">
              Signed in as {user.email}
            </p>
          </div>

          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
            >
              Sign out
            </button>
          </form>
        </div>

        <dl className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-zinc-50 p-4">
            <dt className="text-sm text-zinc-500">Name</dt>
            <dd className="mt-1 font-medium text-zinc-900">{user.name}</dd>
          </div>
          <div className="rounded-xl bg-zinc-50 p-4">
            <dt className="text-sm text-zinc-500">Role</dt>
            <dd className="mt-1 font-medium text-zinc-900">{user.role}</dd>
          </div>
        </dl>

        {isAdmin(user.role) ? (
          <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-900">
              You have admin access.{" "}
              <Link href="/admin" className="font-medium underline">
                Go to admin panel
              </Link>
            </p>
          </div>
        ) : null}
      </div>
    </main>
  );
}
