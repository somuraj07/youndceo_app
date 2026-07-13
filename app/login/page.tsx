import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="app-gradient-bg flex min-h-dvh flex-col justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <BrandLogo
            size={180}
            priority
            className="h-36 w-36 rounded-4xl shadow-[0_12px_40px_rgba(88,28,135,0.35)] sm:h-44 sm:w-44"
          />
          <p className="mt-4 text-sm text-muted">Learn. Build. Lead.</p>
        </div>

        {params.registered ? (
          <div className="mb-4 rounded-lg border border-green/30 bg-green/10 px-4 py-3 text-sm text-green">
            Account created. Please sign in.
          </div>
        ) : null}

        <div className="card-glow rounded-2xl bg-surface p-8">
          <h1 className="text-xl font-semibold text-foreground">Sign in</h1>
          <p className="mt-2 text-sm text-muted">Welcome back to YoungCEO.</p>

          <LoginForm />

          <p className="mt-6 text-center text-sm text-muted">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-purple-soft">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
