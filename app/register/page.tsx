import Link from "next/link";
import { RegisterForm } from "./register-form";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default function RegisterPage() {
  return (
    <main className="app-gradient-bg flex min-h-dvh flex-col justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 flex justify-end">
          <div className="w-56">
            <ThemeToggle compact />
          </div>
        </div>

        <div className="mb-8 text-center">
          <p className="text-2xl font-bold text-foreground">Young CEO</p>
          <p className="mt-1 text-sm text-muted">Learn. Build. Lead.</p>
        </div>

        <div className="card-glow rounded-2xl bg-surface p-8">
          <h1 className="text-xl font-semibold text-foreground">Create account</h1>
          <p className="mt-2 text-sm text-muted">
            Join YoungCEO to get started.
          </p>

          <RegisterForm />

          <p className="mt-6 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-purple-soft">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
