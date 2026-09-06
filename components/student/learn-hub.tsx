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
    <div className="space-y-4 md:space-y-6">
      <section className="glass grid grid-cols-3 gap-2 rounded-2xl p-4 md:p-6 md:gap-4 lg:p-7">
        <Stat icon="🔥" value={stats.streak} label="Day Streak" />
        <Stat icon="⚡" value={stats.xp.toLocaleString("en-IN")} label="Total XP" />
        <Stat icon="✅" value={stats.completed} label="Completed" />
      </section>

      <div className="rounded-2xl bg-white/10 p-1.5">
        <div className="grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => setTab("courses")}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition md:py-3 md:text-base lg:text-lg md:font-bold ${
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
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition md:py-3 md:text-base lg:text-lg md:font-bold ${
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          {courses.length === 0 ? (
            <EmptyState text="No courses have been published yet." />
          ) : (
            courses.map((course) => (
              <Link
                key={course.id}
                href={`/learn/course/${course.id}`}
                className="glass block rounded-2xl p-4 transition hover:bg-white/10 md:p-6 lg:p-7"
              >
                <div className="flex items-center gap-3 md:gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-2xl md:h-14 md:w-14 md:text-3xl">
                    {course.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h2 className="truncate font-semibold text-foreground md:text-xl lg:text-2xl md:font-bold">
                          {course.title}
                        </h2>
                        <p className="truncate text-xs text-muted md:text-sm lg:text-base">
                          {course.description ||
                            `${course.moduleCount} learning modules`}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-orange/20 px-2 py-1 text-[10px] font-bold text-orange md:px-3 md:py-1.5 md:text-xs lg:text-sm">
                        +{course.xpReward} XP
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10 md:h-2.5">
                  <div
                    className="h-full rounded-full bg-purple-soft"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
                <div className="mt-3 flex justify-between text-xs md:text-sm lg:text-base">
                  <span className="text-muted">{course.progress}% complete</span>
                  <span className="font-semibold text-purple-soft md:font-bold">
                    {course.completed ? "Completed ✓" : "Continue →"}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          {challenges.length === 0 ? (
            <EmptyState text="No challenges have been published yet." />
          ) : (
            challenges.map((challenge) => (
              <Link
                key={challenge.id}
                href={`/learn/challenge/${challenge.id}`}
                className="glass block rounded-2xl p-4 transition hover:bg-white/10 md:p-6 lg:p-7"
              >
                <div className="flex items-center gap-3 md:gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-2xl md:h-14 md:w-14 md:text-3xl">
                    {challenge.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h2 className="truncate font-semibold text-foreground md:text-xl lg:text-2xl md:font-bold">
                          {challenge.title}
                        </h2>
                        <p className="truncate text-xs text-muted md:text-sm lg:text-base">
                          {challenge.description ||
                            `${challenge.questionCount} questions`}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-orange/20 px-2 py-1 text-[10px] font-bold text-orange md:px-3 md:py-1.5 md:text-xs lg:text-sm">
                        +{challenge.xpReward} XP
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-between text-xs md:text-sm lg:text-base">
                  <span className="text-muted">
                    {challenge.questionCount} questions
                  </span>
                  <span className="font-semibold text-purple-soft md:font-bold">
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
      <p className="text-base md:text-2xl lg:text-3xl md:font-bold">
        {icon}{" "}
        <span className="font-bold text-foreground">{value}</span>
      </p>
      <p className="mt-1 truncate text-[10px] text-muted md:text-sm lg:text-base font-medium">{label}</p>
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
