"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import {
  deleteExpense,
  updateExpense,
  type FinanceActionState,
} from "@/app/actions/student-finance";
import { MoneyEntryPad } from "@/components/student/money-entry-pad";

const initial: FinanceActionState = {};

type ExpenseItem = {
  id: string;
  title: string;
  amount: number;
  category: string;
  kind: "EXPENSE" | "INCOME";
  spentAt: string;
};

export function SpendPanel({
  expenses,
  monthExpenseTotal,
  monthIncomeTotal,
  monthNet,
}: {
  expenses: ExpenseItem[];
  monthExpenseTotal: number;
  monthIncomeTotal: number;
  monthNet: number;
}) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <header className="fade-up text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Budget
        </h1>
        <p className="mt-1 text-sm text-muted">Track spending and income</p>
      </header>

      <div className="fade-up fade-up-delay-1 grid grid-cols-3 gap-2">
        <SummaryCard label="Income" value={monthIncomeTotal} tone="income" />
        <SummaryCard label="Expenses" value={monthExpenseTotal} tone="expense" />
        <SummaryCard label="Net" value={monthNet} tone="net" />
      </div>

      <div className="fade-up fade-up-delay-2">
        <MoneyEntryPad onSuccess={() => router.refresh()} />
      </div>

      <div className="fade-up fade-up-delay-3 space-y-2">
        <h2 className="text-sm font-medium text-foreground">Recent</h2>
        {expenses.length === 0 ? (
          <p className="text-sm text-muted">No entries yet — add one above.</p>
        ) : (
          expenses.map((expense) => (
            <ExpenseRow key={expense.id} expense={expense} />
          ))
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "income" | "expense" | "net";
}) {
  const color =
    tone === "income"
      ? "text-green"
      : tone === "expense"
        ? "text-orange"
        : value >= 0
          ? "text-teal"
          : "text-red";

  return (
    <div className="glass rounded-2xl p-3 text-center">
      <p className="text-[10px] text-muted">{label}</p>
      <p className={`mt-1 text-sm font-bold ${color}`}>
        ₹{Math.abs(value).toLocaleString("en-IN")}
        {tone === "net" && value < 0 ? " −" : ""}
      </p>
    </div>
  );
}

function ExpenseRow({ expense }: { expense: ExpenseItem }) {
  const [editing, setEditing] = useState(false);
  const [state, action, pending] = useActionState(updateExpense, initial);
  const isIncome = expense.kind === "INCOME";

  if (editing) {
    return (
      <form action={action} className="glass space-y-2 rounded-2xl p-4">
        <input type="hidden" name="expenseId" value={expense.id} />
        <input
          name="title"
          defaultValue={expense.title}
          required
          className="profile-field w-full"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            name="amount"
            type="number"
            defaultValue={expense.amount}
            required
            className="profile-field w-full"
          />
          <input
            name="category"
            defaultValue={expense.category}
            required
            className="profile-field w-full"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={pending}
            className="money-pad-submit flex-1 py-2.5 text-sm"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-xl bg-white/10 px-3 text-xs text-muted"
          >
            Cancel
          </button>
        </div>
        {state.error ? <p className="text-xs text-red">{state.error}</p> : null}
      </form>
    );
  }

  return (
    <article className="glass flex items-center justify-between gap-3 rounded-2xl px-4 py-3">
      <div className="min-w-0">
        <p className="truncate font-medium text-foreground">{expense.title}</p>
        <p className="text-xs text-muted">
          {isIncome ? "Income" : "Expense"} · {expense.category} ·{" "}
          {new Date(expense.spentAt).toLocaleDateString()}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <p
          className={`font-semibold ${isIncome ? "text-green" : "text-orange"}`}
        >
          {isIncome ? "+" : "−"}₹{expense.amount.toLocaleString("en-IN")}
        </p>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-[11px] text-teal"
        >
          Edit
        </button>
        <form action={deleteExpense.bind(null, expense.id)}>
          <button type="submit" className="text-[11px] text-red">
            Delete
          </button>
        </form>
      </div>
    </article>
  );
}
