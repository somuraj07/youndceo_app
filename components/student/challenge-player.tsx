"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  submitChallenge,
  type ChallengeResult,
} from "@/app/actions/learning";

type Question = {
  id: string;
  question: string;
  options: { id: string; label: string }[];
};

export function ChallengePlayer({
  challenge,
  previousResult,
}: {
  challenge: {
    id: string;
    title: string;
    description: string | null;
    icon: string;
    xpReward: number;
    questions: Question[];
  };
  previousResult: ChallengeResult | null;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ChallengeResult | null>(previousResult);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const current = challenge.questions[step];

  if (result?.score !== undefined) {
    return (
      <div className="space-y-5 text-center">
        <Link
          href="/learn"
          className="block text-left text-sm font-medium text-purple-soft"
        >
          ← Back to learn
        </Link>
        <section className="glass-strong rounded-3xl p-6">
          <div className="text-5xl">{result.score >= 70 ? "🏆" : "💪"}</div>
          <p className="mt-3 text-xs font-semibold tracking-widest text-purple-soft uppercase">
            Challenge complete
          </p>
          <h1 className="mt-2 text-2xl font-bold text-foreground">
            {challenge.title}
          </h1>
          <p className="mt-5 text-5xl font-bold text-foreground">
            {result.score}%
          </p>
          <p className="mt-2 text-sm text-muted">
            {result.correctCount}/{result.totalQuestions} correct
          </p>
          <p className="mt-3 font-semibold text-orange">
            +{result.xpEarned ?? 0} XP earned
          </p>
        </section>

        {result.review?.length ? (
          <section className="space-y-3 text-left">
            <div>
              <h2 className="font-semibold text-foreground">Answer review</h2>
              <p className="text-xs text-muted">
                Check your answers and learn from any mistakes.
              </p>
            </div>
            {result.review.map((item, index) => (
              <article
                key={item.questionId}
                className={`rounded-2xl border p-4 ${
                  item.isCorrect
                    ? "border-green/30 bg-green/10"
                    : "border-red/30 bg-red/10"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      item.isCorrect
                        ? "bg-green/20 text-green"
                        : "bg-red/20 text-red"
                    }`}
                  >
                    {item.isCorrect ? "✓" : "×"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted">Question {index + 1}</p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {item.question}
                    </p>
                    <p
                      className={`mt-2 text-xs ${
                        item.isCorrect ? "text-green" : "text-red"
                      }`}
                    >
                      Your answer: {item.selectedAnswer}
                    </p>
                    {!item.isCorrect ? (
                      <p className="mt-1 text-xs font-medium text-green">
                        Correct answer: {item.correctAnswer}
                      </p>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : null}

        <Link href="/learn" className="learn-cta block w-full">
          Continue
        </Link>
      </div>
    );
  }

  if (!current) {
    return <p className="text-muted">This challenge has no questions.</p>;
  }

  function continueChallenge() {
    if (!answers[current.id]) {
      setError("Choose an answer to continue.");
      return;
    }
    setError(null);
    if (step < challenge.questions.length - 1) {
      setStep((value) => value + 1);
      return;
    }
    startTransition(async () => {
      const response = await submitChallenge(challenge.id, answers);
      if (response.error) {
        setError(response.error);
      } else {
        setResult(response);
      }
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          className="learn-icon-btn"
          onClick={() =>
            step === 0
              ? history.back()
              : setStep((value) => Math.max(0, value - 1))
          }
        >
          ←
        </button>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-purple-soft"
            style={{
              width: `${((step + 1) / challenge.questions.length) * 100}%`,
            }}
          />
        </div>
        <span className="text-xs text-muted">
          {step + 1}/{challenge.questions.length}
        </span>
      </div>

      <section className="glass-strong rounded-3xl p-5">
        <div className="flex items-center gap-2 text-purple-soft">
          <span>{challenge.icon}</span>
          <span className="text-xs font-semibold uppercase">
            {challenge.title}
          </span>
        </div>
        <h1 className="mt-4 text-xl font-bold leading-8 text-foreground">
          {current.question}
        </h1>
      </section>

      <div className="space-y-2">
        {current.options.map((option) => {
          const selected = answers[current.id] === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() =>
                setAnswers((previous) => ({
                  ...previous,
                  [current.id]: option.id,
                }))
              }
              className={`learn-option w-full ${
                selected ? "learn-option-on" : ""
              }`}
            >
              <span className="learn-option-key">{option.id}</span>
              <span className="text-left text-sm">{option.label}</span>
            </button>
          );
        })}
      </div>

      {error ? <p className="text-center text-sm text-red">{error}</p> : null}
      <button
        type="button"
        onClick={continueChallenge}
        disabled={pending}
        className="learn-cta w-full disabled:opacity-60"
      >
        {pending
          ? "Checking…"
          : step === challenge.questions.length - 1
            ? "Finish challenge"
            : "Continue"}
      </button>
    </div>
  );
}
