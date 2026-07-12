"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import {
  createExpense,
  type FinanceActionState,
} from "@/app/actions/student-finance";

const initial: FinanceActionState = {};

const EXPENSE_CATEGORIES = [
  { id: "Groceries", label: "Groceries", icon: "🛒", color: "#22c55e" },
  { id: "Travel", label: "Travel", icon: "✈️", color: "#38bdf8" },
  { id: "Car", label: "Car", icon: "🚗", color: "#3b82f6" },
  { id: "Home", label: "Home", icon: "🏠", color: "#a855f7" },
  { id: "Food", label: "Food", icon: "🍔", color: "#f59e0b" },
  { id: "Shopping", label: "Shopping", icon: "🛍️", color: "#ec4899" },
  { id: "Bills", label: "Bills", icon: "📄", color: "#64748b" },
  { id: "Education", label: "Education", icon: "📚", color: "#14b8a6" },
] as const;

const INCOME_CATEGORIES = [
  { id: "Salary", label: "Salary", icon: "💼", color: "#22c55e" },
  { id: "Pocket Money", label: "Pocket", icon: "🪙", color: "#f59e0b" },
  { id: "Gift", label: "Gift", icon: "🎁", color: "#ec4899" },
  { id: "Freelance", label: "Freelance", icon: "💻", color: "#3b82f6" },
  { id: "Other", label: "Other", icon: "✨", color: "#a855f7" },
] as const;

type Mode = "EXPENSE" | "INCOME";

type MoneyEntryPadProps = {
  compact?: boolean;
  onSuccess?: () => void;
};

export function MoneyEntryPad({ compact = false, onSuccess }: MoneyEntryPadProps) {
  const [mode, setMode] = useState<Mode>("EXPENSE");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>("Groceries");
  const [state, action, pending] = useActionState(createExpense, initial);
  const [, startTransition] = useTransition();
  const amountRef = useRef<HTMLInputElement>(null);

  const categories = mode === "EXPENSE" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  useEffect(() => {
    setCategory(categories[0]?.id ?? "Other");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    if (state.success) {
      setAmount("");
      onSuccess?.();
    }
  }, [state.success, onSuccess]);

  function onAmountChange(value: string) {
    const cleaned = value.replace(/[^\d.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    if (cleaned.length > 12) return;
    setAmount(cleaned);
  }

  function submit() {
    const value = Number(amount);
    if (!amount || Number.isNaN(value) || value <= 0) {
      amountRef.current?.focus();
      return;
    }

    const formData = new FormData();
    formData.set("kind", mode);
    formData.set("amount", String(value));
    formData.set("category", category);
    formData.set("title", category);

    startTransition(() => {
      action(formData);
    });
  }

  return (
    <div className={`money-pad ${compact ? "money-pad-compact" : ""}`}>
      <div className="money-pad-toggle">
        <button
          type="button"
          className={mode === "EXPENSE" ? "money-pad-toggle-active" : ""}
          onClick={() => setMode("EXPENSE")}
        >
          Expenses
        </button>
        <button
          type="button"
          className={mode === "INCOME" ? "money-pad-toggle-active" : ""}
          onClick={() => setMode("INCOME")}
        >
          Income
        </button>
      </div>

      <div className="money-pad-amount">
        <label htmlFor="money-amount" className="sr-only">
          Amount
        </label>
        <div className="money-pad-input-wrap">
          <span className="money-pad-currency">₹</span>
          <input
            ref={amountRef}
            id="money-amount"
            type="text"
            inputMode="decimal"
            pattern="[0-9]*[.]?[0-9]*"
            enterKeyHint="done"
            autoComplete="off"
            placeholder="0"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
            className="money-pad-input"
          />
        </div>
        <p className="money-pad-hint">Enter Amount</p>
      </div>

      <div className="money-pad-cats">
        {categories.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setCategory(item.id)}
            className={`money-pad-chip ${
              category === item.id ? "money-pad-chip-active" : ""
            }`}
          >
            <span style={{ color: item.color }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      {state.error ? (
        <p className="px-1 text-center text-xs text-red">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="px-1 text-center text-xs text-green">{state.success}</p>
      ) : null}

      <button
        type="button"
        disabled={pending || !amount || Number(amount) <= 0}
        onClick={submit}
        className="money-pad-submit disabled:opacity-50"
      >
        {pending
          ? "Adding…"
          : mode === "EXPENSE"
            ? "Add Expense"
            : "Add Income"}
      </button>
    </div>
  );
}
