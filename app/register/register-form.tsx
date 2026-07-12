"use client";

import { useActionState } from "react";
import { register, type AuthFormState } from "@/app/actions/auth";

const initialState: AuthFormState = {};

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(register, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-muted">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          className="mt-1 w-full rounded-xl border border-border bg-surface-elevated px-3 py-2.5 text-foreground outline-none focus:border-purple"
        />
      </div>

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
          autoComplete="new-password"
          minLength={8}
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
        {isPending ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
