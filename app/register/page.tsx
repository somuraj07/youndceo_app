import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
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
