import Link from "next/link";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-6 py-12">
      {params.registered ? (
        <div className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Account created. Please sign in.
        </div>
      ) : null}

      <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">Sign in</h1>
        <p className="mt-2 text-sm text-zinc-600">Welcome back to YoungCEO.</p>

        <LoginForm />

        <p className="mt-6 text-center text-sm text-zinc-600">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-zinc-900">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
