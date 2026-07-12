"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  submitAssignment,
  type SubmitState,
} from "@/app/actions/assignment";

type QuizOption = { id: string; label: string };

type AssignmentFormProps = {
  assignment: {
    id: string;
    title: string;
    type: "MCQ" | "FILL_IN_BLANK";
    question: string;
    options: unknown;
    xpReward: number;
    imageUrl?: string | null;
  };
  existingSubmission: {
    answer: string;
    status: string;
    xpEarned: number;
  } | null;
};

const initialState: SubmitState = {};

export function AssignmentForm({
  assignment,
  existingSubmission,
}: AssignmentFormProps) {
  const [state, formAction, isPending] = useActionState(
    submitAssignment,
    initialState,
  );

  const options = (assignment.options as QuizOption[] | null) ?? [];

  if (existingSubmission || state.status) {
    const status = existingSubmission?.status ?? state.status ?? "";
    const xp = existingSubmission?.xpEarned ?? state.xpEarned ?? 0;
    const answer = existingSubmission?.answer;
    const correct = state.correct;

    return (
      <div className="learn-exam space-y-5 text-center">
        <div className="learn-complete-banner">
          {status === "PENDING" ? "SUBMITTED" : "COMPLETE"}
        </div>
        <p className="text-sm text-muted">{assignment.title}</p>
        {answer ? (
          <p className="text-sm text-foreground">Your answer: {answer}</p>
        ) : null}
        <p
          className={`text-lg font-semibold ${
            status === "APPROVED" || correct
              ? "text-green"
              : status === "PENDING"
                ? "text-orange"
                : "text-red"
          }`}
        >
          {status === "APPROVED"
            ? "Correct"
            : status === "PENDING"
              ? "Waiting for review"
              : "Incorrect"}
          {xp > 0 ? ` · +${xp} XP` : ""}
        </p>
        <Link href="/learn" className="learn-cta inline-flex px-8">
          CONTINUE
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="learn-exam space-y-4">
      <input type="hidden" name="assignmentId" value={assignment.id} />

      <div className="flex items-center justify-between">
        <Link href="/learn" className="learn-icon-btn" aria-label="Back">
          ←
        </Link>
        <p className="text-xs font-semibold tracking-wide text-orange uppercase">
          {assignment.title}
        </p>
        <span className="w-10" />
      </div>

      <p className="text-center text-base font-medium text-foreground">
        {assignment.type === "MCQ"
          ? "Choose the correct answer."
          : "Type your answer."}
      </p>

      <div className="learn-card space-y-3 p-4">
        {assignment.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={assignment.imageUrl}
            alt={assignment.title}
            className="max-h-48 w-full rounded-xl object-cover"
          />
        ) : null}
        <h2 className="text-base font-semibold leading-snug text-foreground">
          {assignment.question}
        </h2>
      </div>

      {assignment.type === "MCQ" ? (
        <div className="grid gap-2">
          {options.map((option) => (
            <label
              key={option.id}
              className="learn-option cursor-pointer has-[:checked]:border-[var(--learn-orange)] has-[:checked]:bg-[var(--learn-orange-soft)]"
            >
              <input
                type="radio"
                name="answer"
                value={option.id}
                required
                className="sr-only"
              />
              <span className="learn-option-key">{option.id}</span>
              <span className="text-sm text-foreground">{option.label}</span>
            </label>
          ))}
        </div>
      ) : (
        <input
          name="answer"
          required
          placeholder="Type your answer..."
          className="profile-field w-full"
        />
      )}

      {state.error ? <p className="text-sm text-red">{state.error}</p> : null}

      <button
        type="submit"
        disabled={isPending}
        className="learn-cta w-full disabled:opacity-60"
      >
        {isPending ? "Submitting..." : "CONTINUE"}
      </button>
    </form>
  );
}
