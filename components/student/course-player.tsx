"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { completeCourseContent } from "@/app/actions/learning";

type CourseLesson = {
  id: string;
  title: string;
  body: string;
};

type CourseModule = {
  id: string;
  title: string;
  contents: CourseLesson[];
};

export function CoursePlayer({
  course,
  completedIds,
}: {
  course: {
    id: string;
    title: string;
    description: string | null;
    icon: string;
    xpReward: number;
    modules: CourseModule[];
  };
  completedIds: string[];
}) {
  const lessons = useMemo(
    () =>
      course.modules.flatMap((module) =>
        module.contents.map((content) => ({
          ...content,
          moduleTitle: module.title,
        })),
      ),
    [course.modules],
  );
  const initialIndex = Math.max(
    0,
    lessons.findIndex((lesson) => !completedIds.includes(lesson.id)),
  );
  const [index, setIndex] = useState(initialIndex);
  const [completed, setCompleted] = useState(() => new Set(completedIds));
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const current = lessons[index];
  const progress =
    lessons.length === 0
      ? 0
      : Math.round((completed.size / lessons.length) * 100);

  if (!current) {
    return (
      <div className="glass rounded-2xl p-6 text-center">
        <p className="text-muted">This course has no lessons yet.</p>
        <Link href="/learn" className="mt-3 inline-block text-purple-soft">
          ← Back to courses
        </Link>
      </div>
    );
  }

  function markComplete() {
    startTransition(async () => {
      const result = await completeCourseContent(current.id);
      if (result.error) {
        setMessage(result.error);
        return;
      }
      setCompleted((previous) => new Set([...previous, current.id]));
      if (result.courseCompleted) {
        setMessage(
          result.xpEarned
            ? `Course complete! +${result.xpEarned} XP`
            : "Course complete!",
        );
      } else if (index < lessons.length - 1) {
        setIndex((value) => value + 1);
      }
    });
  }

  return (
    <div className="space-y-4">
      <Link href="/learn" className="text-sm font-medium text-purple-soft">
        ← Back to learn
      </Link>

      <section className="glass rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-2xl">
            {course.icon}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="font-bold text-foreground">{course.title}</h1>
            <p className="text-xs text-muted">
              {completed.size}/{lessons.length} lessons · +{course.xpReward} XP
            </p>
          </div>
          <span className="font-bold text-purple-soft">{progress}%</span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-purple-soft"
            style={{ width: `${progress}%` }}
          />
        </div>
      </section>

      <section className="glass-strong rounded-3xl p-5">
        <p className="text-xs font-semibold tracking-wider text-purple-soft uppercase">
          {current.moduleTitle} · Lesson {index + 1} of {lessons.length}
        </p>
        <h2 className="mt-2 text-xl font-bold text-foreground">
          {current.title}
        </h2>
        <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-muted">
          {current.body}
        </div>
      </section>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setIndex((value) => Math.max(0, value - 1))}
          disabled={index === 0}
          className="learn-secondary flex-1 disabled:opacity-40"
        >
          Previous
        </button>
        {completed.has(current.id) ? (
          <button
            type="button"
            onClick={() =>
              setIndex((value) => Math.min(lessons.length - 1, value + 1))
            }
            disabled={index === lessons.length - 1}
            className="learn-cta flex-[1.4] disabled:opacity-40"
          >
            Next lesson
          </button>
        ) : (
          <button
            type="button"
            onClick={markComplete}
            disabled={pending}
            className="learn-cta flex-[1.4] disabled:opacity-60"
          >
            {pending ? "Saving…" : "Complete lesson"}
          </button>
        )}
      </div>

      {message ? (
        <p className="rounded-xl bg-purple/15 p-3 text-center text-sm text-purple-soft">
          {message}
        </p>
      ) : null}
    </div>
  );
}
