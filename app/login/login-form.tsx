"use client";

import { useActionState } from "react";
import { login, type AuthFormState } from "@/app/actions/auth";

const initialState: AuthFormState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-muted">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-1 w-full rounded-xl border border-border bg-surface-elevated px-3 py-2.5 text-foreground outline-none focus:border-purple"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-muted"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-1 w-full rounded-xl border border-border bg-surface-elevated px-3 py-2.5 text-foreground outline-none focus:border-purple"
        />
      </div>

      {state.error ? (
        <p className="text-sm text-red">{state.error}</p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-purple px-4 py-2.5 text-sm font-medium text-white transition hover:bg-purple/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
