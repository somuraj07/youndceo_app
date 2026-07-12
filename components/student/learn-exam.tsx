"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  submitAssignmentBatch,
  type BatchResultItem,
} from "@/app/actions/assignment";

type QuizOption = { id: string; label: string };

export type LearnAssignment = {
  id: string;
  title: string;
  category: string;
  type: "MCQ" | "FILL_IN_BLANK";
  question: string;
  options: unknown;
  xpReward: number;
  imageUrl?: string | null;
};

export type LearnSubmission = {
  assignmentId: string;
  status: string;
  xpEarned: number;
  isCorrect?: boolean | null;
};

type Phase = "overview" | "exam" | "result";

type LearnExamProps = {
  assignments: LearnAssignment[];
  submissions: LearnSubmission[];
  userName: string;
};

function tileLabel(title: string) {
  const clean = title.trim();
  if (!clean) return "?";
  const parts = clean.split(/\s+/);
  if (parts.length === 1) return clean.slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function LearnExam({
  assignments,
  submissions,
  userName,
}: LearnExamProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("overview");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<BatchResultItem[]>([]);
  const [scorePercent, setScorePercent] = useState(0);
  const [totalXp, setTotalXp] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submissionMap = useMemo(
    () => new Map(submissions.map((s) => [s.assignmentId, s])),
    [submissions],
  );

  const pendingLessons = useMemo(
    () => assignments.filter((a) => !submissionMap.has(a.id)),
    [assignments, submissionMap],
  );

  const doneCount = assignments.length - pendingLessons.length;
  const progress =
    assignments.length === 0
      ? 0
      : Math.round((doneCount / assignments.length) * 100);

  const current = pendingLessons[step];
  const currentAnswer = current ? answers[current.id] ?? "" : "";
  const options =
    current?.type === "MCQ"
      ? ((current.options as QuizOption[] | null) ?? [])
      : [];

  function startExam() {
    if (pendingLessons.length === 0) return;
    setAnswers({});
    setStep(0);
    setError(null);
    setPhase("exam");
  }

  function goPrev() {
    if (step > 0) setStep((s) => s - 1);
  }

  function goNext() {
    if (!current || !currentAnswer.trim()) {
      setError("Pick or type an answer to continue.");
      return;
    }
    setError(null);

    if (step >= pendingLessons.length - 1) {
      finishExam();
      return;
    }
    setStep((s) => s + 1);
  }

  function finishExam() {
    const payload = pendingLessons
      .map((lesson) => ({
        assignmentId: lesson.id,
        answer: (answers[lesson.id] ?? "").trim(),
      }))
      .filter((item) => item.answer);

    if (payload.length === 0) {
      setError("Answer at least one question.");
      return;
    }

    startTransition(async () => {
      const res = await submitAssignmentBatch(payload);
      if (res.error) {
        setError(res.error);
        return;
      }
      setResults(res.results ?? []);
      setScorePercent(res.scorePercent ?? 0);
      setTotalXp(res.totalXp ?? 0);
      setPhase("result");
      router.refresh();
    });
  }

  if (phase === "result") {
    const stars =
      scorePercent >= 90 ? 3 : scorePercent >= 70 ? 2 : scorePercent >= 40 ? 1 : 0;

    return (
      <div className="learn-exam fade-up mx-auto max-w-lg space-y-6 py-4 text-center">
        <div className="learn-complete-banner">COMPLETE</div>
        <p className="text-sm text-muted">Young CEO money skills</p>
        <div className="flex items-end justify-center gap-3 py-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`learn-star ${i === 1 ? "learn-star-lg" : ""} ${
                i < stars ? "learn-star-on" : ""
              }`}
            >
              ★
            </span>
          ))}
        </div>
        <div>
          <p className="text-sm text-muted">Your score</p>
          <p className="mt-1 text-5xl font-bold text-foreground">{scorePercent}%</p>
          {totalXp > 0 ? (
            <p className="mt-2 text-sm text-teal">+{totalXp} XP earned</p>
          ) : null}
        </div>
        <p className="mx-auto max-w-sm text-sm text-muted">
          {scorePercent >= 70
            ? "Great achievement this time — keep building your money skills."
            : "Nice effort. Review the lessons and try again to improve."}
        </p>
        <div className="space-y-2 text-left">
          {results.map((item) => (
            <div
              key={item.assignmentId}
              className="learn-card flex items-center justify-between gap-3 px-4 py-3"
            >
              <p className="truncate text-sm text-foreground">{item.title}</p>
              <span
                className={`text-xs font-semibold ${
                  item.status === "APPROVED"
                    ? "text-green"
                    : item.status === "PENDING"
                      ? "text-orange"
                      : "text-red"
                }`}
              >
                {item.status === "APPROVED"
                  ? "Correct"
                  : item.status === "PENDING"
                    ? "In review"
                    : "Wrong"}
              </span>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="learn-cta w-full"
          onClick={() => {
            setPhase("overview");
            setStep(0);
            setAnswers({});
            router.refresh();
          }}
        >
          CONTINUE
        </button>
      </div>
    );
  }

  if (phase === "exam" && current) {
    return (
      <div className="learn-exam fade-up mx-auto max-w-lg space-y-5">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            className="learn-icon-btn"
            onClick={() => (step === 0 ? setPhase("overview") : goPrev())}
            aria-label="Back"
          >
            ←
          </button>
          <div className="flex items-center gap-1">
            {pendingLessons.map((_, i) => (
              <span
                key={i}
                className={`learn-heart ${i <= step ? "learn-heart-on" : ""}`}
              >
                ♥
              </span>
            ))}
          </div>
          <span className="text-xs text-muted">
            {step + 1}/{pendingLessons.length}
          </span>
        </div>

        <p className="text-center text-base font-medium text-foreground">
          {current.type === "MCQ"
            ? "Choose the correct answer for this lesson."
            : "Type your answer for this lesson."}
        </p>

        <div className="learn-card space-y-3 p-4">
          <p className="text-xs font-semibold tracking-wide text-orange uppercase">
            {current.category}
          </p>
          <h2 className="text-lg font-semibold text-foreground">
            {current.question}
          </h2>
          {current.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={current.imageUrl}
              alt=""
              className="max-h-40 w-full rounded-xl object-cover"
            />
          ) : null}
        </div>

        {current.type === "MCQ" ? (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {options.map((option) => {
              const selected = currentAnswer === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() =>
                    setAnswers((prev) => ({
                      ...prev,
                      [current.id]: option.id,
                    }))
                  }
                  className={`learn-option ${selected ? "learn-option-on" : ""}`}
                >
                  <span className="learn-option-key">{option.id}</span>
                  <span className="text-left text-sm">{option.label}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <input
            value={currentAnswer}
            onChange={(e) =>
              setAnswers((prev) => ({
                ...prev,
                [current.id]: e.target.value,
              }))
            }
            placeholder="Type your answer..."
            className="profile-field w-full"
          />
        )}

        {error ? <p className="text-center text-sm text-red">{error}</p> : null}

        <div className="flex gap-2">
          <button
            type="button"
            className="learn-secondary flex-1"
            disabled={step === 0}
            onClick={goPrev}
          >
            Previous
          </button>
          <button
            type="button"
            className="learn-cta flex-[1.4]"
            disabled={pending}
            onClick={goNext}
          >
            {pending
              ? "Submitting…"
              : step >= pendingLessons.length - 1
                ? "Finish"
                : "Continue"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="learn-exam fade-up mx-auto max-w-lg space-y-5">
      <div className="flex items-center gap-3">
        <div className="learn-avatar">{userName.slice(0, 1).toUpperCase()}</div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-foreground">{userName}</p>
          <p className="text-xs text-muted">Young CEO learner</p>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Let&apos;s learn money skills
        </h1>
        <p className="mt-1 text-sm text-muted">
          Lessons and quizzes from your admin — one exam at a time.
        </p>
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold text-orange">Basic lessons</p>
        {assignments.length === 0 ? (
          <p className="text-sm text-muted">No lessons available yet.</p>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {assignments.map((item) => {
              const done = submissionMap.get(item.id);
              return (
                <Link
                  key={item.id}
                  href={`/learn/${item.id}`}
                  className={`learn-tile ${done ? "learn-tile-done" : ""}`}
                >
                  <span className="learn-tile-glyph">{tileLabel(item.title)}</span>
                  <span className="learn-tile-caption line-clamp-2">
                    {item.title}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="learn-card space-y-2 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Progress</span>
          <span className="font-semibold text-foreground">
            {doneCount}/{assignments.length || 0}
          </span>
        </div>
        <div className="learn-progress">
          <div className="learn-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <button
        type="button"
        className="learn-cta w-full"
        disabled={pendingLessons.length === 0}
        onClick={startExam}
      >
        {pendingLessons.length === 0 ? "ALL COMPLETE" : "LEARNING NOW"}
      </button>
    </div>
  );
}
