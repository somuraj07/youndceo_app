"use client";

import { useActionState, useEffect, useState } from "react";
import {
  createGoal,
  deleteGoal,
  depositToGoal,
  type FinanceActionState,
} from "@/app/actions/student-finance";

const initial: FinanceActionState = {};

const GOAL_COLORS = ["#a78bfa", "#8b5cf6", "#c084fc", "#7c3aed", "#a855f7"];
const GOAL_ICONS = ["💻", "📚", "💰", "✈️", "👟", "🎯"];
const EMOJI_CHOICES = [
  "🎯",
  "💻",
  "📱",
  "📚",
  "💰",
  "✈️",
  "👟",
  "🎮",
  "🚲",
  "🎸",
  "⌚",
  "🎧",
];

type GoalItem = {
  id: string;
  title: string;
  icon?: string | null;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null;
};

function inr(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function lastGrapheme(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const segments = [...new Intl.Segmenter().segment(trimmed)];
  return segments[segments.length - 1]?.segment ?? "";
}

export function HomeGoals({ goals }: { goals: GoalItem[] }) {
  const [adding, setAdding] = useState(false);
  const [emoji, setEmoji] = useState(EMOJI_CHOICES[0]);
  const [createState, createAction, createPending] = useActionState(
    createGoal,
    initial,
  );

  useEffect(() => {
    if (createState.success) {
      setAdding(false);
      setEmoji(EMOJI_CHOICES[0]);
    }
  }, [createState]);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-xl md:text-2xl lg:text-3xl">🎯</span>
          <h2 className="text-lg font-semibold text-foreground md:text-2xl lg:text-3xl lg:font-bold">
            My Goals
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          aria-label={adding ? "Close add goal" : "Add goal"}
          className="btn-teal flex h-9 w-9 items-center justify-center rounded-full text-xl leading-none md:h-11 md:w-11 lg:h-12 lg:w-12 lg:text-2xl font-bold"
        >
          {adding ? "×" : "+"}
        </button>
      </div>

      {adding ? (
        <form action={createAction} className="glass space-y-4 rounded-2xl p-4 md:p-6">
          <p className="text-sm font-semibold text-foreground md:text-base lg:text-lg">Add new goal</p>
          <div className="flex items-center gap-2.5">
            <input
              name="icon"
              value={emoji}
              onChange={(event) => setEmoji(lastGrapheme(event.target.value))}
              inputMode="text"
              aria-label="Goal emoji — type any emoji from your keyboard"
              className="h-11 w-14 shrink-0 rounded-xl border border-white/15 bg-white/10 text-center text-2xl outline-none focus:border-teal md:h-13 md:w-16 md:text-3xl"
            />
            <div className="flex flex-wrap gap-2">
              {EMOJI_CHOICES.map((choice) => (
                <button
                  key={choice}
                  type="button"
                  onClick={() => setEmoji(choice)}
                  aria-label={`Pick ${choice}`}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-base transition md:h-10 md:w-10 md:text-xl ${
                    emoji === choice
                      ? "bg-teal/25 ring-2 ring-teal"
                      : "bg-white/10 hover:bg-white/20"
                  }`}
                >
                  {choice}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted md:text-sm">
            Tap the box and use your keyboard&apos;s emoji picker for any emoji.
          </p>
          <input
            name="title"
            required
            placeholder="Goal name (e.g. New Laptop)"
            className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted focus:border-teal md:px-4 md:py-3.5 md:text-base"
          />
          <input
            name="targetAmount"
            type="number"
            required
            min={1}
            placeholder="Goal amount ₹"
            className="no-number-spinner w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted focus:border-teal md:px-4 md:py-3.5 md:text-base"
          />
          {createState.error ? (
            <p className="text-xs text-red md:text-sm">{createState.error}</p>
          ) : null}
          <button
            type="submit"
            disabled={createPending}
            className="btn-teal w-full rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-60 md:py-3.5 md:text-base font-bold"
          >
            {createPending ? "Saving…" : "Add Goal"}
          </button>
        </form>
      ) : null}

      {goals.length === 0 && !adding ? (
        <div className="glass rounded-2xl p-6 text-center space-y-2 md:p-8">
          <span className="text-3xl md:text-4xl">🎯</span>
          <h3 className="text-base font-bold text-foreground md:text-xl">
            No goals yet
          </h3>
          <p className="text-sm text-muted max-w-md mx-auto md:text-base">
            Set a target for your savings (e.g. Laptop, Trip, Gadgets). Tap + above to set your first goal.
          </p>
        </div>
      ) : (
        goals.map((goal, index) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            color={GOAL_COLORS[index % GOAL_COLORS.length]}
            icon={goal.icon || GOAL_ICONS[index % GOAL_ICONS.length]}
          />
        ))
      )}
    </section>
  );
}

function GoalCard({
  goal,
  color,
  icon,
}: {
  goal: GoalItem;
  color: string;
  icon: string;
}) {
  const [depositing, setDepositing] = useState(false);
  const [state, action, pending] = useActionState(depositToGoal, initial);

  useEffect(() => {
    if (state.success) {
      setDepositing(false);
    }
  }, [state]);

  const percent = Math.min(
    100,
    Math.round((goal.currentAmount / goal.targetAmount) * 100),
  );
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
  const reached = remaining === 0;

  return (
    <article className="glass rounded-2xl p-4 md:p-6 lg:p-7">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3 md:gap-4">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl md:h-14 md:w-14 md:text-2xl"
            style={{ background: `${color}22` }}
          >
            {icon}
          </span>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-foreground md:text-xl md:font-bold lg:text-2xl">
              {goal.title}
            </p>
            <p className="text-sm text-muted md:text-base lg:text-lg">
              {inr(goal.currentAmount)} of {inr(goal.targetAmount)}
            </p>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-2xl font-bold md:text-3xl lg:text-4xl md:font-extrabold" style={{ color }}>
            {percent}%
          </p>
          <form action={deleteGoal.bind(null, goal.id)}>
            <button type="submit" className="text-sm text-red hover:underline md:text-base">
              remove
            </button>
          </form>
        </div>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10 md:h-3">
        <div
          className="h-full rounded-full transition-[width]"
          style={{ width: `${percent}%`, background: color }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="text-sm text-muted md:text-base lg:text-lg font-medium">
          {reached
            ? "🎉 Goal reached!"
            : `${inr(remaining)} more to reach your goal`}
        </p>
        {!depositing ? (
          <button
            type="button"
            onClick={() => setDepositing(true)}
            className="btn-teal rounded-xl px-3 py-1.5 text-sm font-semibold md:px-5 md:py-2 md:text-base font-bold"
          >
            Deposit
          </button>
        ) : null}
      </div>

      {depositing ? (
        <form action={action} className="mt-3 flex items-center gap-2">
          <input type="hidden" name="goalId" value={goal.id} />
          <input
            name="amount"
            type="number"
            required
            min={1}
            autoFocus
            placeholder="Amount ₹"
            className="no-number-spinner w-full flex-1 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted focus:border-teal md:px-4 md:py-3 md:text-base"
          />
          <button
            type="submit"
            disabled={pending}
            className="btn-teal shrink-0 rounded-xl px-3 py-2 text-xs font-semibold disabled:opacity-60 md:px-4 md:py-3 md:text-sm font-bold"
          >
            {pending ? "Adding…" : "Add"}
          </button>
          <button
            type="button"
            onClick={() => setDepositing(false)}
            className="shrink-0 rounded-xl bg-white/10 px-3 py-2 text-xs text-muted md:px-4 md:py-3 md:text-sm"
          >
            Cancel
          </button>
        </form>
      ) : null}
      {state.error ? <p className="mt-2 text-xs text-red md:text-sm">{state.error}</p> : null}
    </article>
  );
}
