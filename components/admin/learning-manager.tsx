"use client";

import { useActionState, useState } from "react";
import {
  createChallenge,
  createCourse,
  deleteChallenge,
  deleteCourse,
  type LearningAdminState,
  updateChallenge,
  updateCourse,
} from "@/app/actions/learning-admin";

const initial: LearningAdminState = {};
const inputClass =
  "w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted focus:border-purple";

type CourseItem = {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  isActive: boolean;
  sortOrder: number;
  modules: {
    id: string;
    title: string;
    sortOrder: number;
    contents: {
      id: string;
      title: string;
      body: string;
      sortOrder: number;
    }[];
  }[];
};

type ChallengeItem = {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  isActive: boolean;
  sortOrder: number;
  questions: {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    sortOrder: number;
  }[];
};

type ModuleDraft = {
  id?: string;
  title: string;
  contents: { id?: string; title: string; body: string }[];
};

type QuestionDraft = {
  id?: string;
  question: string;
  options: string[];
  correctIndex: number;
};

export function LearningManager({
  courses,
  challenges,
}: {
  courses: CourseItem[];
  challenges: ChallengeItem[];
}) {
  const [tab, setTab] = useState<"courses" | "challenges">("courses");

  return (
    <div className="space-y-5">
      <section className="home-cover rounded-[1.85rem] p-5">
        <p className="text-[11px] font-semibold tracking-[0.18em] text-purple-soft uppercase">
          Learning studio
        </p>
        <h1 className="mt-2 text-2xl font-bold text-foreground">
          Courses & challenges
        </h1>
        <p className="mt-2 text-sm text-muted">
          Publish structured lessons and multi-question challenges.
        </p>
      </section>

      <div className="money-pad-toggle">
        <button
          type="button"
          onClick={() => setTab("courses")}
          className={tab === "courses" ? "money-pad-toggle-active" : undefined}
        >
          📖 Courses
        </button>
        <button
          type="button"
          onClick={() => setTab("challenges")}
          className={tab === "challenges" ? "money-pad-toggle-active" : undefined}
        >
          🏆 Challenges
        </button>
      </div>

      {tab === "courses" ? (
        <CourseSection courses={courses} />
      ) : (
        <ChallengeSection challenges={challenges} />
      )}
    </div>
  );
}

function CourseSection({ courses }: { courses: CourseItem[] }) {
  const [modules, setModules] = useState<ModuleDraft[]>([
    { title: "", contents: [{ title: "", body: "" }] },
  ]);
  const [state, action, pending] = useActionState(createCourse, initial);

  function updateModule(index: number, title: string) {
    setModules((current) =>
      current.map((module, itemIndex) =>
        itemIndex === index ? { ...module, title } : module,
      ),
    );
  }

  function updateContent(
    moduleIndex: number,
    contentIndex: number,
    field: "title" | "body",
    value: string,
  ) {
    setModules((current) =>
      current.map((module, itemIndex) =>
        itemIndex === moduleIndex
          ? {
              ...module,
              contents: module.contents.map((content, lessonIndex) =>
                lessonIndex === contentIndex
                  ? { ...content, [field]: value }
                  : content,
              ),
            }
          : module,
      ),
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
      <form action={action} className="glass-strong space-y-4 rounded-3xl p-5">
        <h2 className="font-semibold text-foreground">Create course</h2>
        <div className="grid grid-cols-[72px_1fr] gap-2">
          <input name="icon" defaultValue="📘" aria-label="Course icon" className={inputClass} />
          <input name="title" required placeholder="Course title" className={inputClass} />
        </div>
        <textarea
          name="description"
          placeholder="What students will learn"
          rows={2}
          className={inputClass}
        />
        <div className="grid grid-cols-3 gap-2">
          <input
            name="xpReward"
            type="number"
            min={1}
            defaultValue={200}
            aria-label="Completion XP"
            placeholder="Completion XP"
            className={inputClass}
          />
          <input
            name="sortOrder"
            type="number"
            min={0}
            defaultValue={0}
            aria-label="Sort order"
            placeholder="Order"
            className={inputClass}
          />
          <select name="isActive" defaultValue="true" aria-label="Course status" className={inputClass}>
            <option value="true" className="bg-[#1a1028]">Active</option>
            <option value="false" className="bg-[#1a1028]">Hidden</option>
          </select>
        </div>
        <input type="hidden" name="modules" value={JSON.stringify(modules)} />

        <div className="space-y-3">
          {modules.map((module, moduleIndex) => (
            <div key={moduleIndex} className="rounded-2xl border border-white/10 p-3">
              <div className="flex gap-2">
                <input
                  value={module.title}
                  onChange={(event) => updateModule(moduleIndex, event.target.value)}
                  placeholder={`Module ${moduleIndex + 1} title`}
                  className={inputClass}
                />
                {modules.length > 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setModules((current) =>
                        current.filter((_, index) => index !== moduleIndex),
                      )
                    }
                    className="px-2 text-red"
                    aria-label="Remove module"
                  >
                    ×
                  </button>
                ) : null}
              </div>

              <div className="mt-3 space-y-2">
                {module.contents.map((content, contentIndex) => (
                  <div key={contentIndex} className="rounded-xl bg-white/5 p-3">
                    <input
                      value={content.title}
                      onChange={(event) =>
                        updateContent(
                          moduleIndex,
                          contentIndex,
                          "title",
                          event.target.value,
                        )
                      }
                      placeholder={`Lesson ${contentIndex + 1} title`}
                      className={inputClass}
                    />
                    <textarea
                      value={content.body}
                      onChange={(event) =>
                        updateContent(
                          moduleIndex,
                          contentIndex,
                          "body",
                          event.target.value,
                        )
                      }
                      placeholder="Lesson content"
                      rows={4}
                      className={`${inputClass} mt-2`}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setModules((current) =>
                      current.map((item, index) =>
                        index === moduleIndex
                          ? {
                              ...item,
                              contents: [
                                ...item.contents,
                                { title: "", body: "" },
                              ],
                            }
                          : item,
                      ),
                    )
                  }
                  className="text-xs font-semibold text-purple-soft"
                >
                  + Add lesson
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() =>
            setModules((current) => [
              ...current,
              { title: "", contents: [{ title: "", body: "" }] },
            ])
          }
          className="text-sm font-semibold text-purple-soft"
        >
          + Add module
        </button>
        {state.error ? <p className="text-sm text-red">{state.error}</p> : null}
        {state.success ? <p className="text-sm text-green">{state.success}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="money-pad-submit w-full py-3 disabled:opacity-60"
        >
          {pending ? "Publishing…" : "Publish course"}
        </button>
      </form>

      <CoursePublishedList courses={courses} />
    </div>
  );
}

function ChallengeSection({ challenges }: { challenges: ChallengeItem[] }) {
  const [questions, setQuestions] = useState<QuestionDraft[]>([
    { question: "", options: ["", "", "", ""], correctIndex: 0 },
  ]);
  const [state, action, pending] = useActionState(createChallenge, initial);

  function updateQuestion(index: number, patch: Partial<QuestionDraft>) {
    setQuestions((current) =>
      current.map((question, itemIndex) =>
        itemIndex === index ? { ...question, ...patch } : question,
      ),
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
      <form action={action} className="glass-strong space-y-4 rounded-3xl p-5">
        <h2 className="font-semibold text-foreground">Create challenge</h2>
        <div className="grid grid-cols-[72px_1fr] gap-2">
          <input name="icon" defaultValue="🏆" aria-label="Challenge icon" className={inputClass} />
          <input name="title" required placeholder="Challenge title" className={inputClass} />
        </div>
        <textarea
          name="description"
          placeholder="Challenge description"
          rows={2}
          className={inputClass}
        />
        <div className="grid grid-cols-3 gap-2">
          <input
            name="xpReward"
            type="number"
            min={1}
            defaultValue={200}
            aria-label="Maximum XP"
            placeholder="Maximum XP"
            className={inputClass}
          />
          <input
            name="sortOrder"
            type="number"
            min={0}
            defaultValue={0}
            aria-label="Sort order"
            placeholder="Order"
            className={inputClass}
          />
          <select name="isActive" defaultValue="true" aria-label="Challenge status" className={inputClass}>
            <option value="true" className="bg-[#1a1028]">Active</option>
            <option value="false" className="bg-[#1a1028]">Hidden</option>
          </select>
        </div>
        <input type="hidden" name="questions" value={JSON.stringify(questions)} />

        <div className="space-y-3">
          {questions.map((question, questionIndex) => (
            <div key={questionIndex} className="rounded-2xl border border-white/10 p-3">
              <div className="flex gap-2">
                <textarea
                  value={question.question}
                  onChange={(event) =>
                    updateQuestion(questionIndex, { question: event.target.value })
                  }
                  placeholder={`Question ${questionIndex + 1}`}
                  rows={2}
                  className={inputClass}
                />
                {questions.length > 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setQuestions((current) =>
                        current.filter((_, index) => index !== questionIndex),
                      )
                    }
                    className="px-2 text-red"
                    aria-label="Remove question"
                  >
                    ×
                  </button>
                ) : null}
              </div>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <p className="sm:col-span-2 text-xs text-muted">
                  Enter the choices and select the correct answer.
                </p>
                {question.options.map((option, optionIndex) => (
                  <label key={optionIndex} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${questionIndex}`}
                      checked={question.correctIndex === optionIndex}
                      aria-label={`Mark choice ${String.fromCharCode(
                        65 + optionIndex,
                      )} as the correct answer`}
                      onChange={() =>
                        updateQuestion(questionIndex, {
                          correctIndex: optionIndex,
                        })
                      }
                    />
                    <input
                      value={option}
                      onChange={(event) => {
                        const options = [...question.options];
                        options[optionIndex] = event.target.value;
                        updateQuestion(questionIndex, { options });
                      }}
                      placeholder={`Choice ${String.fromCharCode(65 + optionIndex)}`}
                      className={inputClass}
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() =>
            setQuestions((current) => [
              ...current,
              { question: "", options: ["", "", "", ""], correctIndex: 0 },
            ])
          }
          className="text-sm font-semibold text-purple-soft"
        >
          + Add question
        </button>
        {state.error ? <p className="text-sm text-red">{state.error}</p> : null}
        {state.success ? <p className="text-sm text-green">{state.success}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="money-pad-submit w-full py-3 disabled:opacity-60"
        >
          {pending ? "Publishing…" : "Publish challenge"}
        </button>
      </form>

      <ChallengePublishedList challenges={challenges} />
    </div>
  );
}

function CoursePublishedList({ courses }: { courses: CourseItem[] }) {
  return (
    <section className="glass-strong rounded-3xl p-5">
      <h2 className="font-semibold text-foreground">Published</h2>
      {courses.length === 0 ? (
        <p className="mt-4 text-sm text-muted">No courses published.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {courses.map((course) => <CourseEditor key={course.id} course={course} />)}
        </div>
      )}
    </section>
  );
}

function CourseEditor({ course }: { course: CourseItem }) {
  const [editing, setEditing] = useState(false);
  const [modules, setModules] = useState<ModuleDraft[]>(course.modules);
  const [state, action, pending] = useActionState(updateCourse, initial);
  const lessonCount = modules.reduce((sum, module) => sum + module.contents.length, 0);

  function updateModule(index: number, patch: Partial<ModuleDraft>) {
    setModules((current) =>
      current.map((module, itemIndex) =>
        itemIndex === index ? { ...module, ...patch } : module,
      ),
    );
  }

  function updateLesson(
    moduleIndex: number,
    lessonIndex: number,
    field: "title" | "body",
    value: string,
  ) {
    setModules((current) =>
      current.map((module, itemIndex) =>
        itemIndex === moduleIndex
          ? {
              ...module,
              contents: module.contents.map((lesson, contentIndex) =>
                contentIndex === lessonIndex ? { ...lesson, [field]: value } : lesson,
              ),
            }
          : module,
      ),
    );
  }

  if (!editing) {
    return (
      <article className="glass rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{course.icon}</span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-foreground">{course.title}</p>
            <p className="text-xs text-muted">
              {course.modules.length} modules · {lessonCount} lessons · +{course.xpReward} XP
            </p>
            <p className="mt-1 text-[10px] text-muted">
              Order {course.sortOrder} · {course.isActive ? "Active" : "Hidden"}
            </p>
          </div>
          <button type="button" onClick={() => setEditing(true)} className="text-xs text-teal">
            Edit
          </button>
          <form action={deleteCourse.bind(null, course.id)}>
            <button type="submit" className="text-xs text-red">Delete</button>
          </form>
        </div>
      </article>
    );
  }

  return (
    <form action={action} className="glass space-y-3 rounded-2xl p-4">
      <input type="hidden" name="courseId" value={course.id} />
      <input type="hidden" name="modules" value={JSON.stringify(modules)} />
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Edit course</h3>
        <button type="button" onClick={() => setEditing(false)} className="text-xs text-muted">
          Cancel
        </button>
      </div>
      <div className="grid grid-cols-[72px_1fr] gap-2">
        <input name="icon" defaultValue={course.icon} aria-label="Course icon" className={inputClass} />
        <input name="title" required defaultValue={course.title} aria-label="Course title" className={inputClass} />
      </div>
      <textarea
        name="description"
        defaultValue={course.description}
        rows={2}
        aria-label="Course description"
        className={inputClass}
      />
      <div className="grid grid-cols-3 gap-2">
        <input name="xpReward" type="number" min={1} defaultValue={course.xpReward} aria-label="Completion XP" className={inputClass} />
        <input name="sortOrder" type="number" min={0} defaultValue={course.sortOrder} aria-label="Sort order" className={inputClass} />
        <select name="isActive" defaultValue={String(course.isActive)} aria-label="Course status" className={inputClass}>
          <option value="true" className="bg-[#1a1028]">Active</option>
          <option value="false" className="bg-[#1a1028]">Hidden</option>
        </select>
      </div>

      {modules.map((module, moduleIndex) => (
        <div key={module.id ?? moduleIndex} className="rounded-2xl border border-white/10 p-3">
          <div className="flex gap-2">
            <input
              value={module.title}
              onChange={(event) => updateModule(moduleIndex, { title: event.target.value })}
              placeholder={`Module ${moduleIndex + 1} title`}
              className={inputClass}
            />
            {modules.length > 1 ? (
              <button
                type="button"
                onClick={() => setModules((current) => current.filter((_, index) => index !== moduleIndex))}
                className="px-2 text-red"
                aria-label="Remove module"
              >
                ×
              </button>
            ) : null}
          </div>
          <div className="mt-3 space-y-2">
            {module.contents.map((lesson, lessonIndex) => (
              <div key={lesson.id ?? lessonIndex} className="rounded-xl bg-white/5 p-3">
                <div className="flex gap-2">
                  <input
                    value={lesson.title}
                    onChange={(event) => updateLesson(moduleIndex, lessonIndex, "title", event.target.value)}
                    placeholder={`Lesson ${lessonIndex + 1} title`}
                    className={inputClass}
                  />
                  {module.contents.length > 1 ? (
                    <button
                      type="button"
                      onClick={() =>
                        updateModule(moduleIndex, {
                          contents: module.contents.filter((_, index) => index !== lessonIndex),
                        })
                      }
                      className="px-2 text-red"
                      aria-label="Remove lesson"
                    >
                      ×
                    </button>
                  ) : null}
                </div>
                <textarea
                  value={lesson.body}
                  onChange={(event) => updateLesson(moduleIndex, lessonIndex, "body", event.target.value)}
                  placeholder="Lesson content"
                  rows={4}
                  className={`${inputClass} mt-2`}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                updateModule(moduleIndex, {
                  contents: [...module.contents, { title: "", body: "" }],
                })
              }
              className="text-xs font-semibold text-purple-soft"
            >
              + Add lesson
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          setModules((current) => [
            ...current,
            { title: "", contents: [{ title: "", body: "" }] },
          ])
        }
        className="text-xs font-semibold text-purple-soft"
      >
        + Add module
      </button>
      {state.error ? <p className="text-xs text-red">{state.error}</p> : null}
      {state.success ? <p className="text-xs text-green">{state.success}</p> : null}
      <button type="submit" disabled={pending} className="money-pad-submit w-full py-2.5 text-sm disabled:opacity-60">
        {pending ? "Saving…" : "Save course"}
      </button>
    </form>
  );
}

function ChallengePublishedList({ challenges }: { challenges: ChallengeItem[] }) {
  return (
    <section className="glass-strong rounded-3xl p-5">
      <h2 className="font-semibold text-foreground">Published</h2>
      {challenges.length === 0 ? (
        <p className="mt-4 text-sm text-muted">No challenges published.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {challenges.map((challenge) => (
            <ChallengeEditor key={challenge.id} challenge={challenge} />
          ))}
        </div>
      )}
    </section>
  );
}

function ChallengeEditor({ challenge }: { challenge: ChallengeItem }) {
  const [editing, setEditing] = useState(false);
  const [questions, setQuestions] = useState<QuestionDraft[]>(challenge.questions);
  const [state, action, pending] = useActionState(updateChallenge, initial);

  function updateQuestion(index: number, patch: Partial<QuestionDraft>) {
    setQuestions((current) =>
      current.map((question, itemIndex) =>
        itemIndex === index ? { ...question, ...patch } : question,
      ),
    );
  }

  if (!editing) {
    return (
      <article className="glass rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{challenge.icon}</span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-foreground">{challenge.title}</p>
            <p className="text-xs text-muted">
              {challenge.questions.length} questions · +{challenge.xpReward} XP
            </p>
            <p className="mt-1 text-[10px] text-muted">
              Order {challenge.sortOrder} · {challenge.isActive ? "Active" : "Hidden"}
            </p>
          </div>
          <button type="button" onClick={() => setEditing(true)} className="text-xs text-teal">
            Edit
          </button>
          <form action={deleteChallenge.bind(null, challenge.id)}>
            <button type="submit" className="text-xs text-red">Delete</button>
          </form>
        </div>
      </article>
    );
  }

  return (
    <form action={action} className="glass space-y-3 rounded-2xl p-4">
      <input type="hidden" name="challengeId" value={challenge.id} />
      <input type="hidden" name="questions" value={JSON.stringify(questions)} />
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Edit challenge</h3>
        <button type="button" onClick={() => setEditing(false)} className="text-xs text-muted">
          Cancel
        </button>
      </div>
      <div className="grid grid-cols-[72px_1fr] gap-2">
        <input name="icon" defaultValue={challenge.icon} aria-label="Challenge icon" className={inputClass} />
        <input name="title" required defaultValue={challenge.title} aria-label="Challenge title" className={inputClass} />
      </div>
      <textarea
        name="description"
        defaultValue={challenge.description}
        rows={2}
        aria-label="Challenge description"
        className={inputClass}
      />
      <div className="grid grid-cols-3 gap-2">
        <input name="xpReward" type="number" min={1} defaultValue={challenge.xpReward} aria-label="Maximum XP" className={inputClass} />
        <input name="sortOrder" type="number" min={0} defaultValue={challenge.sortOrder} aria-label="Sort order" className={inputClass} />
        <select name="isActive" defaultValue={String(challenge.isActive)} aria-label="Challenge status" className={inputClass}>
          <option value="true" className="bg-[#1a1028]">Active</option>
          <option value="false" className="bg-[#1a1028]">Hidden</option>
        </select>
      </div>

      {questions.map((question, questionIndex) => (
        <div key={question.id ?? questionIndex} className="rounded-2xl border border-white/10 p-3">
          <div className="flex gap-2">
            <textarea
              value={question.question}
              onChange={(event) => updateQuestion(questionIndex, { question: event.target.value })}
              placeholder={`Question ${questionIndex + 1}`}
              rows={2}
              className={inputClass}
            />
            {questions.length > 1 ? (
              <button
                type="button"
                onClick={() => setQuestions((current) => current.filter((_, index) => index !== questionIndex))}
                className="px-2 text-red"
                aria-label="Remove question"
              >
                ×
              </button>
            ) : null}
          </div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {question.options.map((option, optionIndex) => (
              <label key={optionIndex} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`edit-correct-${challenge.id}-${questionIndex}`}
                  checked={question.correctIndex === optionIndex}
                  onChange={() => updateQuestion(questionIndex, { correctIndex: optionIndex })}
                />
                <input
                  value={option}
                  onChange={(event) => {
                    const options = [...question.options];
                    options[optionIndex] = event.target.value;
                    updateQuestion(questionIndex, { options });
                  }}
                  placeholder={`Choice ${String.fromCharCode(65 + optionIndex)}`}
                  className={inputClass}
                />
              </label>
            ))}
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          setQuestions((current) => [
            ...current,
            { question: "", options: ["", "", "", ""], correctIndex: 0 },
          ])
        }
        className="text-xs font-semibold text-purple-soft"
      >
        + Add question
      </button>
      {state.error ? <p className="text-xs text-red">{state.error}</p> : null}
      {state.success ? <p className="text-xs text-green">{state.success}</p> : null}
      <button type="submit" disabled={pending} className="money-pad-submit w-full py-2.5 text-sm disabled:opacity-60">
        {pending ? "Saving…" : "Save challenge"}
      </button>
    </form>
  );
}
