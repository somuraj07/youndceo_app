"use client";

import Link from "next/link";
import { useState } from "react";

type CourseCard = {
  id: string;
  title: string;
  description: string | null;
  icon: string;
  xpReward: number;
  moduleCount: number;
  progress: number;
  completed: boolean;
};

type ChallengeCard = {
  id: string;
  title: string;
  description: string | null;
  icon: string;
  xpReward: number;
  questionCount: number;
  attempt: { score: number; xpEarned: number } | null;
};

export function LearnHub({
  stats,
  courses,
  challenges,
}: {
  stats: { streak: number; xp: number; completed: number };
  courses: CourseCard[];
  challenges: ChallengeCard[];
}) {
  const [tab, setTab] = useState<"courses" | "challenges">("courses");

  return (
    <div className="space-y-4">
      <section className="glass grid grid-cols-3 gap-2 rounded-2xl p-4">
        <Stat icon="🔥" value={stats.streak} label="Day Streak" />
        <Stat icon="⚡" value={stats.xp.toLocaleString("en-IN")} label="Total XP" />
        <Stat icon="✅" value={stats.completed} label="Completed" />
      </section>

      <div className="rounded-2xl bg-white/10 p-1">
        <div className="grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => setTab("courses")}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
              tab === "courses"
                ? "bg-purple text-white"
                : "text-purple-soft"
            }`}
          >
            📖 Courses
          </button>
          <button
            type="button"
            onClick={() => setTab("challenges")}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
              tab === "challenges"
                ? "bg-purple text-white"
                : "text-purple-soft"
            }`}
          >
            🏆 Challenges
          </button>
        </div>
      </div>

      {tab === "courses" ? (
        <div className="space-y-3">
          {courses.length === 0 ? (
            <EmptyState text="No courses have been published yet." />
          ) : (
            courses.map((course) => (
              <Link
                key={course.id}
                href={`/learn/course/${course.id}`}
                className="glass block rounded-2xl p-4 transition hover:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-2xl">
                    {course.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h2 className="truncate font-semibold text-foreground">
                          {course.title}
                        </h2>
                        <p className="truncate text-xs text-muted">
                          {course.description ||
                            `${course.moduleCount} learning modules`}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-orange/20 px-2 py-1 text-[10px] font-bold text-orange">
                        +{course.xpReward} XP
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-purple-soft"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
                <div className="mt-2 flex justify-between text-xs">
                  <span className="text-muted">{course.progress}% complete</span>
                  <span className="font-semibold text-purple-soft">
                    {course.completed ? "Completed ✓" : "Continue →"}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {challenges.length === 0 ? (
            <EmptyState text="No challenges have been published yet." />
          ) : (
            challenges.map((challenge) => (
              <Link
                key={challenge.id}
                href={`/learn/challenge/${challenge.id}`}
                className="glass block rounded-2xl p-4 transition hover:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-2xl">
                    {challenge.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h2 className="truncate font-semibold text-foreground">
                          {challenge.title}
                        </h2>
                        <p className="truncate text-xs text-muted">
                          {challenge.description ||
                            `${challenge.questionCount} questions`}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-orange/20 px-2 py-1 text-[10px] font-bold text-orange">
                        +{challenge.xpReward} XP
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex justify-between text-xs">
                  <span className="text-muted">
                    {challenge.questionCount} questions
                  </span>
                  <span className="font-semibold text-purple-soft">
                    {challenge.attempt
                      ? `${challenge.attempt.score}% · Completed ✓`
                      : "Start challenge →"}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: string;
  value: string | number;
  label: string;
}) {
  return (
    <div className="min-w-0 text-center">
      <p className="text-base">
        {icon}{" "}
        <span className="font-bold text-foreground">{value}</span>
      </p>
      <p className="mt-1 truncate text-[10px] text-muted">{label}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="glass rounded-2xl p-8 text-center text-sm text-muted">
      {text}
    </div>
  );
}
