import Link from "next/link";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-6 py-12">
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">Create account</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Join YoungCEO to get started.
        </p>

        <RegisterForm />

        <p className="mt-6 text-center text-sm text-zinc-600">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-zinc-900">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
