"use client";

import { useActionState } from "react";
import type { ActionState } from "@/app/actions/admin";

const initialState: ActionState = {};

type AdminFormProps = {
  action: (_prev: ActionState, formData: FormData) => Promise<ActionState>;
  children: React.ReactNode;
  submitLabel: string;
};

export function AdminForm({ action, children, submitLabel }: AdminFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form
      action={formAction}
      className="glass space-y-4 rounded-2xl p-5 sm:p-6"
    >
      {children}

      {state.error ? <p className="text-sm text-red">{state.error}</p> : null}
      {state.success ? (
        <p className="text-sm text-green">{state.success}</p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="money-pad-submit w-full py-2.5 text-sm disabled:opacity-60"
      >
        {isPending ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}

export function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  defaultValue,
  rows,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string | number;
  rows?: number;
}) {
  const className =
    "mt-1 w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted focus:border-purple";

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-muted">
        {label}
      </label>
      {rows ? (
        <textarea
          id={name}
          name={name}
          rows={rows}
          required={required}
          placeholder={placeholder}
          defaultValue={defaultValue}
          className={className}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          required={required}
          placeholder={placeholder}
          defaultValue={defaultValue}
          className={className}
        />
      )}
    </div>
  );
}

export function FileField({
  label,
  name,
  accept = "image/*",
}: {
  label: string;
  name: string;
  accept?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-muted">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="file"
        accept={accept}
        className="mt-1 w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-purple file:px-3 file:py-2 file:text-xs file:font-medium file:text-white"
      />
    </div>
  );
}

export function DeleteButton({
  label,
  onDelete,
}: {
  label: string;
  onDelete: () => Promise<void>;
}) {
  return (
    <button
      type="button"
      onClick={() => onDelete()}
      className="rounded-lg border border-red/30 px-3 py-1.5 text-xs text-red transition hover:bg-red/10"
    >
      {label}
    </button>
  );
}
