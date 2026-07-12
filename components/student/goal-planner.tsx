"use client";

import { useActionState, useState } from "react";
import {
  createGoal,
  deleteGoal,
  updateGoal,
  type FinanceActionState,
} from "@/app/actions/student-finance";
import { MoneyEntryPad } from "@/components/student/money-entry-pad";
import Link from "next/link";
import { useRouter } from "next/navigation";

const initial: FinanceActionState = {};

const GOAL_COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#14b8a6", "#a855f7"];
const GOAL_ICONS = ["💻", "✈️", "👟", "🏠", "🎯", "📚"];

type GoalItem = {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null;
};

export function GoalPlanner({
  goals,
  monthExpenseTotal = 0,
  monthIncomeTotal = 0,
}: {
  goals: GoalItem[];
  monthExpenseTotal?: number;
  monthIncomeTotal?: number;
}) {
  const [tab, setTab] = useState<"goals" | "budget">("goals");
  const [createState, createAction, createPending] = useActionState(
    createGoal,
    initial,
  );
  const router = useRouter();

  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const budgetLeft = Math.max(0, totalTarget - totalSaved);
  const monthNet = monthIncomeTotal - monthExpenseTotal;

  return (
    <section className="glass-strong overflow-hidden rounded-3xl">
      <div className="flex border-b border-white/10">
        {(
          [
            { id: "goals", label: "My Goals" },
            { id: "budget", label: "Budget" },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`flex-1 px-4 py-3 text-sm font-semibold transition ${
              tab === item.id
                ? "border-b-2 border-teal text-teal"
                : "text-muted hover:text-foreground"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "goals" ? (
        <div className="space-y-4 p-4 sm:p-5">
          {goals.length === 0 ? (
            <p className="text-sm text-muted">
              No goals yet — add one below to start saving.
            </p>
          ) : (
            goals.map((goal, index) => (
              <GoalRow
                key={goal.id}
                goal={goal}
                color={GOAL_COLORS[index % GOAL_COLORS.length]}
                icon={GOAL_ICONS[index % GOAL_ICONS.length]}
              />
            ))
          )}

          <form action={createAction} className="space-y-3 border-t border-white/10 pt-4">
            <p className="text-sm font-medium text-foreground">Add new goal</p>
            <input
              name="title"
              required
              placeholder="Goal name"
              className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted focus:border-teal"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                name="targetAmount"
                type="number"
                required
                min={1}
                placeholder="Target amount"
                className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted focus:border-teal"
              />
              <input
                name="currentAmount"
                type="number"
                min={0}
                defaultValue={0}
                placeholder="Already saved"
                className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted focus:border-teal"
              />
            </div>
            <input
              name="deadline"
              type="date"
              className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-sm text-foreground outline-none focus:border-teal"
            />
            {createState.error ? (
              <p className="text-xs text-red">{createState.error}</p>
            ) : null}
            {createState.success ? (
              <p className="text-xs text-green">{createState.success}</p>
            ) : null}
            <button
              type="submit"
              disabled={createPending}
              className="btn-teal flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-60"
            >
              <span className="text-lg leading-none">+</span>
              {createPending ? "Saving…" : "Add Goal"}
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-4 p-4 sm:p-5">
          <div className="grid grid-cols-3 gap-2">
            <div className="glass rounded-2xl p-3 text-center">
              <p className="text-[10px] text-muted">Income</p>
              <p className="mt-1 text-sm font-bold text-green">
                ₹{monthIncomeTotal.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="glass rounded-2xl p-3 text-center">
              <p className="text-[10px] text-muted">Expenses</p>
              <p className="mt-1 text-sm font-bold text-orange">
                ₹{monthExpenseTotal.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="glass rounded-2xl p-3 text-center">
              <p className="text-[10px] text-muted">Net</p>
              <p
                className={`mt-1 text-sm font-bold ${
                  monthNet >= 0 ? "text-teal" : "text-red"
                }`}
              >
                ₹{Math.abs(monthNet).toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          <MoneyEntryPad
            compact
            onSuccess={() => router.refresh()}
          />

          <div className="glass rounded-2xl p-4">
            <p className="text-[10px] text-muted">Goal gap</p>
            <p className="mt-1 text-xl font-bold text-orange">
              ₹{budgetLeft.toLocaleString("en-IN")} left to save
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-teal"
                style={{
                  width: `${
                    totalTarget === 0
                      ? 0
                      : Math.min(100, Math.round((totalSaved / totalTarget) * 100))
                  }%`,
                }}
              />
            </div>
          </div>

          <Link
            href="/spend"
            prefetch
            className="block text-center text-xs font-medium text-cyan"
          >
            Open full budget →
          </Link>
        </div>
      )}
    </section>
  );
}

function GoalRow({
  goal,
  color,
  icon,
}: {
  goal: GoalItem;
  color: string;
  icon: string;
}) {
  const [editing, setEditing] = useState(false);
  const [state, action, pending] = useActionState(updateGoal, initial);
  const percent = Math.min(
    100,
    Math.round((goal.currentAmount / goal.targetAmount) * 100),
  );

  if (editing) {
    return (
      <form action={action} className="glass space-y-2 rounded-2xl p-3">
        <input type="hidden" name="goalId" value={goal.id} />
        <input
          name="title"
          defaultValue={goal.title}
          required
          className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-foreground outline-none focus:border-teal"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            name="targetAmount"
            type="number"
            defaultValue={goal.targetAmount}
            required
            className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-foreground outline-none focus:border-teal"
          />
          <input
            name="currentAmount"
            type="number"
            defaultValue={goal.currentAmount}
            min={0}
            className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-foreground outline-none focus:border-teal"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={pending}
            className="btn-teal flex-1 rounded-xl px-3 py-2 text-xs font-semibold"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-xl bg-white/10 px-3 py-2 text-xs text-muted"
          >
            Cancel
          </button>
        </div>
        {state.error ? <p className="text-xs text-red">{state.error}</p> : null}
      </form>
    );
  }

  return (
    <article className="rounded-2xl bg-white/5 p-3">
      <div className="flex items-start gap-3">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg"
          style={{ background: `${color}22` }}
        >
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-foreground">{goal.title}</p>
              <p className="text-xs text-muted">
                ₹{goal.currentAmount.toLocaleString()} saved of ₹
                {goal.targetAmount.toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="text-[11px] text-teal"
              >
                Edit
              </button>
              <form action={deleteGoal.bind(null, goal.id)}>
                <button type="submit" className="text-[11px] text-red">
                  Delete
                </button>
              </form>
            </div>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full"
              style={{ width: `${percent}%`, background: color }}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
