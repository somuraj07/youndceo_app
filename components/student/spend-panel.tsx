"use client";

import { useActionState, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  deleteExpense,
  updateExpense,
  type FinanceActionState,
} from "@/app/actions/student-finance";
import { MoneyEntryPad } from "@/components/student/money-entry-pad";
import {
  AreaSpark,
  BubbleCluster,
  CategoryPie,
  WaveBars,
} from "@/components/ui/charts";

const initial: FinanceActionState = {};

const CATEGORY_COLORS = [
  "#a855f7",
  "#38bdf8",
  "#22c55e",
  "#f59e0b",
  "#f472b6",
  "#818cf8",
  "#14b8a6",
  "#fb7185",
];

const fieldClass =
  "w-full rounded-full border border-white/10 bg-white/10 px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted focus:border-purple";

type ExpenseItem = {
  id: string;
  title: string;
  amount: number;
  category: string;
  kind: "EXPENSE" | "INCOME";
  spentAt: string;
};

function inr(amount: number) {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

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
  const [tab, setTab] = useState<"tracker" | "bills">("tracker");

  return (
    <div className="space-y-4">
      <div
        className="money-pad-toggle fade-up"
        style={{ gridTemplateColumns: "repeat(2, 1fr)" }}
      >
        <button
          type="button"
          onClick={() => setTab("tracker")}
          className={tab === "tracker" ? "money-pad-toggle-active" : ""}
          aria-pressed={tab === "tracker"}
        >
          💸 Tracker
        </button>
        <button
          type="button"
          onClick={() => setTab("bills")}
          className={tab === "bills" ? "money-pad-toggle-active" : ""}
          aria-pressed={tab === "bills"}
        >
          🧾 Bills
        </button>
      </div>

      {tab === "tracker" ? (
        <TrackerSection
          expenses={expenses}
          monthExpenseTotal={monthExpenseTotal}
          monthIncomeTotal={monthIncomeTotal}
          monthNet={monthNet}
        />
      ) : null}
      {tab === "bills" ? <BillsSection /> : null}
    </div>
  );
}

function TrackerSection({
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
  const insights = useMemo(() => buildSpendInsights(expenses), [expenses]);

  return (
    <div className="space-y-6">
      <div className="fade-up grid grid-cols-3 gap-2">
        <SummaryCard label="Income" value={monthIncomeTotal} tone="income" />
        <SummaryCard label="Expenses" value={monthExpenseTotal} tone="expense" />
        <SummaryCard label="Net" value={monthNet} tone="net" />
      </div>

      {insights.categorySegments.length > 0 ? (
        <section className="glass fade-up fade-up-delay-1 space-y-4 rounded-3xl p-4">
          <div>
            <h2 className="font-semibold text-foreground">Spending insights</h2>
            <p className="text-xs text-muted">
              Where your money went this month
            </p>
          </div>

          <CategoryPie segments={insights.categorySegments} />

          {insights.topCategory ? (
            <div className="rounded-2xl bg-purple/10 p-3 text-center">
              <p className="text-[10px] font-semibold tracking-wider text-purple-soft uppercase">
                You spend most on
              </p>
              <p className="mt-1 text-lg font-bold text-foreground">
                {insights.topCategory.label}
              </p>
              <p className="text-sm text-muted">
                {inr(insights.topCategory.value)} · {insights.topCategory.percent}%
                of expenses
              </p>
            </div>
          ) : null}

          <div>
            <p className="mb-2 text-xs font-medium text-muted">
              Last 7 days spending
            </p>
            <WaveBars
              values={insights.last7Days}
              labels={insights.last7Labels}
              colors={[
                "#a855f7",
                "#8b5cf6",
                "#7c3aed",
                "#c084fc",
                "#a78bfa",
                "#9333ea",
                "#6d28d9",
              ]}
            />
          </div>

          {insights.trend.length > 1 ? (
            <div>
              <p className="mb-2 text-xs font-medium text-muted">
                Spending trend
              </p>
              <AreaSpark values={insights.trend} color="#f59e0b" height={56} />
            </div>
          ) : null}

          {insights.bubbles.length > 0 ? (
            <div>
              <p className="mb-2 text-center text-xs font-medium text-muted">
                Category bubbles
              </p>
              <BubbleCluster items={insights.bubbles} />
            </div>
          ) : null}
        </section>
      ) : null}

      <div className="fade-up fade-up-delay-1">
        <MoneyEntryPad onSuccess={() => router.refresh()} />
      </div>

      <div className="fade-up fade-up-delay-2 space-y-2">
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

function buildSpendInsights(expenses: ExpenseItem[]) {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const monthExpenses = expenses.filter(
    (expense) =>
      expense.kind === "EXPENSE" && new Date(expense.spentAt) >= monthStart,
  );

  const byCategory = new Map<string, number>();
  for (const expense of monthExpenses) {
    const key = expense.category.trim() || "General";
    byCategory.set(key, (byCategory.get(key) ?? 0) + expense.amount);
  }

  const sortedCategories = [...byCategory.entries()].sort(
    (a, b) => b[1] - a[1],
  );
  const expenseTotal = sortedCategories.reduce((sum, [, amount]) => sum + amount, 0);

  const categorySegments = sortedCategories.map(([label, value], index) => ({
    label,
    value,
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  }));

  const top = sortedCategories[0];
  const topCategory = top
    ? {
        label: top[0],
        value: top[1],
        percent:
          expenseTotal > 0 ? Math.round((top[1] / expenseTotal) * 100) : 0,
      }
    : null;

  const last7Days: number[] = [];
  const last7Labels: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date();
    day.setDate(day.getDate() - i);
    day.setHours(0, 0, 0, 0);
    const next = new Date(day);
    next.setDate(next.getDate() + 1);
    const total = monthExpenses
      .filter((expense) => {
        const spent = new Date(expense.spentAt);
        return spent >= day && spent < next;
      })
      .reduce((sum, expense) => sum + expense.amount, 0);
    last7Days.push(total);
    last7Labels.push(
      day.toLocaleDateString("en-IN", { weekday: "narrow" }),
    );
  }

  const trend = last7Days.some((value) => value > 0) ? last7Days : [];

  const bubbles = sortedCategories.slice(0, 5).map(([label, value], index) => ({
    label,
    value: Math.round(value),
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  }));

  return {
    categorySegments,
    topCategory,
    last7Days,
    last7Labels,
    trend,
    bubbles,
  };
}

type BillItem = {
  id: number;
  name: string;
  total: number;
  gstRate: number;
};

function BillsSection() {
  const [items, setItems] = useState<BillItem[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [gstRate, setGstRate] = useState("18");

  const summary = useMemo(() => {
    let base = 0;
    let gst = 0;
    for (const item of items) {
      const itemBase = item.total / (1 + item.gstRate / 100);
      base += itemBase;
      gst += item.total - itemBase;
    }
    const grand = base + gst;
    return {
      base,
      gst,
      grand,
      gstShare: grand > 0 ? Math.round((gst / grand) * 100) : 0,
    };
  }, [items]);

  function addItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const total = Number(price);
    const rate = Number(gstRate);
    if (!name.trim() || Number.isNaN(total) || total <= 0) return;
    if (Number.isNaN(rate) || rate < 0 || rate > 100) return;
    setItems((prev) => [
      ...prev,
      { id: Date.now(), name: name.trim(), total, gstRate: rate },
    ]);
    setName("");
    setPrice("");
  }

  return (
    <div className="space-y-4">
      <form onSubmit={addItem} className="glass fade-up space-y-3 rounded-3xl p-4">
        <h2 className="font-semibold text-foreground">🧾 Add Bill Items</h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Item name (e.g. Textbook)"
          className={fieldClass}
        />
        <div className="flex gap-2">
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            type="number"
            inputMode="decimal"
            min={1}
            step="0.01"
            required
            placeholder="Total price ₹"
            className={fieldClass}
          />
          <input
            value={gstRate}
            onChange={(e) => setGstRate(e.target.value)}
            type="number"
            inputMode="decimal"
            min={0}
            max={100}
            step="0.01"
            required
            aria-label="GST rate %"
            placeholder="GST %"
            className="w-28 shrink-0 rounded-full border border-white/10 bg-white/10 px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted focus:border-purple"
          />
        </div>
        <button type="submit" className="money-pad-submit w-full py-3 text-sm">
          Add Item
        </button>
      </form>

      {items.map((item) => (
        <BillItemCard
          key={item.id}
          item={item}
          onRateChange={(rate) =>
            setItems((prev) =>
              prev.map((i) => (i.id === item.id ? { ...i, gstRate: rate } : i)),
            )
          }
          onRemove={() =>
            setItems((prev) => prev.filter((i) => i.id !== item.id))
          }
        />
      ))}

      {items.length > 0 ? (
        <section className="glass fade-up rounded-3xl p-4">
          <h2 className="font-semibold text-foreground">Bill Summary</h2>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-purple-soft">Base Amount</span>
              <span className="font-semibold text-foreground">
                {inr(summary.base)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-purple-soft">Total GST</span>
              <span className="font-semibold text-orange">
                {inr(summary.gst)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-white/10 pt-2">
              <span className="font-semibold text-foreground">Grand Total</span>
              <span className="text-lg font-bold text-purple-soft">
                {inr(summary.grand)}
              </span>
            </div>
          </div>
          <p className="mt-4 rounded-2xl bg-white/5 p-3 text-xs text-muted">
            💡 You paid <span className="text-orange">{inr(summary.gst)}</span>{" "}
            in GST — that&apos;s {summary.gstShare}% of your bill going to the
            government for public services.
          </p>
        </section>
      ) : (
        <p className="text-center text-sm text-muted">
          Add items to see the GST breakdown of your bill.
        </p>
      )}
    </div>
  );
}

function BillItemCard({
  item,
  onRateChange,
  onRemove,
}: {
  item: BillItem;
  onRateChange: (rate: number) => void;
  onRemove: () => void;
}) {
  const base = item.total / (1 + item.gstRate / 100);
  const gst = item.total - base;

  return (
    <article className="glass fade-up rounded-3xl p-4">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-foreground">{item.name}</p>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${item.name}`}
          className="text-muted hover:text-red"
        >
          ×
        </button>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-2xl bg-white/5 p-3">
          <p className="text-[10px] uppercase text-muted">Total</p>
          <p className="mt-1 text-sm font-bold text-foreground">
            {inr(item.total)}
          </p>
        </div>
        <div className="rounded-2xl bg-white/5 p-3">
          <p className="text-[10px] uppercase text-muted">Base</p>
          <p className="mt-1 text-sm font-bold text-foreground">{inr(base)}</p>
        </div>
        <div className="rounded-2xl bg-orange/10 p-3">
          <div className="flex items-center justify-center gap-1 text-[10px] uppercase text-orange">
            <span>GST</span>
            <input
              value={item.gstRate}
              onChange={(e) => {
                const rate = Number(e.target.value);
                if (!Number.isNaN(rate) && rate >= 0 && rate <= 100) {
                  onRateChange(rate);
                }
              }}
              type="number"
              inputMode="decimal"
              min={0}
              max={100}
              step="0.01"
              aria-label={`GST rate for ${item.name}`}
              className="w-12 rounded-md border border-orange/30 bg-transparent px-1 py-0.5 text-center text-[10px] text-orange outline-none focus:border-orange"
            />
            <span>%</span>
          </div>
          <p className="mt-1 text-sm font-bold text-orange">{inr(gst)}</p>
        </div>
      </div>
    </article>
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
