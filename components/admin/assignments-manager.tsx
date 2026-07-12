"use client";

import { useActionState, useState } from "react";
import {
  createAssignment,
  deleteAssignment,
  gradeSubmission,
  type ActionState,
} from "@/app/actions/admin";
import { AdminForm, Field, FileField } from "@/components/admin/admin-form";
import { IconChallenges } from "@/components/ui/icons";

type AssignmentItem = {
  id: string;
  title: string;
  category: string;
  type: string;
  question: string;
  xpReward: number;
  imageUrl: string | null;
  isActive: boolean;
};

type SubmissionItem = {
  id: string;
  answer: string;
  status: string;
  createdAt: string;
  user: { name: string; email: string };
  assignment: { title: string; type: string; xpReward: number };
};

const filters = ["PENDING", "ALL", "APPROVED", "REJECTED"] as const;
const gradeInitial: ActionState = {};

const fieldClass =
  "mt-1 w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted focus:border-purple";

function GradeForm({ submission }: { submission: SubmissionItem }) {
  const [state, action, pending] = useActionState(gradeSubmission, gradeInitial);

  return (
    <form action={action} className="mt-4 space-y-3 border-t border-white/10 pt-4">
      <input type="hidden" name="submissionId" value={submission.id} />
      <label className="block text-xs text-muted">
        Marks / XP
        <input
          name="marks"
          type="number"
          min={0}
          defaultValue={submission.assignment.xpReward}
          className={fieldClass}
        />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="submit"
          name="decision"
          value="APPROVED"
          disabled={pending}
          className="money-pad-submit py-2.5 text-sm disabled:opacity-60"
        >
          Assign marks
        </button>
        <button
          type="submit"
          name="decision"
          value="REJECTED"
          disabled={pending}
          className="rounded-full bg-red/15 px-3 py-2.5 text-sm font-semibold text-red disabled:opacity-60"
        >
          Reject
        </button>
      </div>
      {state.error ? <p className="text-xs text-red">{state.error}</p> : null}
      {state.success ? <p className="text-xs text-green">{state.success}</p> : null}
    </form>
  );
}

export function AssignmentsManager({
  assignments,
  submissions,
}: {
  assignments: AssignmentItem[];
  submissions: SubmissionItem[];
}) {
  const [assignmentType, setAssignmentType] = useState<"MCQ" | "FILL_IN_BLANK">(
    "MCQ",
  );
  const [filter, setFilter] = useState<(typeof filters)[number]>("PENDING");
  const [section, setSection] = useState<"create" | "published" | "grade">(
    "create",
  );

  const pendingCount = submissions.filter((s) => s.status === "PENDING").length;
  const gradedCount = submissions.filter((s) => s.status !== "PENDING").length;
  const filtered = submissions.filter((s) =>
    filter === "ALL" ? true : s.status === filter,
  );

  return (
    <div className="space-y-6">
      <section className="home-cover fade-up relative overflow-hidden rounded-[1.85rem] p-5 sm:p-6">
        <div className="home-cover-glow pointer-events-none absolute inset-0" aria-hidden />

        <div className="relative z-[1] space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.18em] text-purple-soft uppercase">
                Tasks
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Assignments
              </h1>
              <p className="mt-2 max-w-sm text-sm text-muted">
                Create lessons and grade student submissions.
              </p>
            </div>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-purple-soft">
              <IconChallenges className="h-6 w-6" />
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <SummaryChip label="Published" value={assignments.length} />
            <SummaryChip label="Pending" value={pendingCount} accent />
            <SummaryChip label="Graded" value={gradedCount} />
          </div>
        </div>
      </section>

      <section className="glass-strong fade-up fade-up-delay-1 overflow-hidden rounded-3xl">
        <div className="flex border-b border-white/10">
          {(
            [
              { id: "create", label: "Create" },
              {
                id: "published",
                label:
                  assignments.length > 0
                    ? `Published (${assignments.length})`
                    : "Published",
              },
              {
                id: "grade",
                label: pendingCount > 0 ? `Grade (${pendingCount})` : "Grade",
              },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSection(tab.id)}
              className={`flex-1 px-2 py-3 text-sm font-semibold transition sm:px-3 ${
                section === tab.id
                  ? "border-b-2 border-purple text-purple-soft"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-5">
          {section === "create" ? (
            <div className="mx-auto max-w-xl">
              <AdminForm
                action={createAssignment}
                submitLabel="Publish assignment"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Title" name="title" required />
                  <Field
                    label="Category"
                    name="category"
                    required
                    placeholder="Entrepreneurship"
                  />
                </div>
                <div>
                  <label
                    htmlFor="type"
                    className="block text-sm font-medium text-muted"
                  >
                    Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={assignmentType}
                    onChange={(e) =>
                      setAssignmentType(e.target.value as "MCQ" | "FILL_IN_BLANK")
                    }
                    className={fieldClass}
                  >
                    <option value="MCQ" className="bg-[#1a1028]">
                      MCQ — Multiple choice
                    </option>
                    <option value="FILL_IN_BLANK" className="bg-[#1a1028]">
                      Fill in the blank
                    </option>
                  </select>
                </div>
                <Field label="Question" name="question" required rows={2} />
                {assignmentType === "MCQ" ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Options (A|Answer per line)"
                      name="options"
                      required
                      rows={4}
                      placeholder={"A|Option one\nB|Option two"}
                    />
                    <Field
                      label="Correct option ID"
                      name="correctAnswer"
                      required
                      placeholder="B"
                    />
                  </div>
                ) : (
                  <Field
                    label="Expected answer"
                    name="correctAnswer"
                    required
                    placeholder="Reference answer for grading"
                  />
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="XP / marks reward"
                    name="xpReward"
                    type="number"
                    defaultValue={100}
                  />
                  <FileField label="Cover image" name="image" />
                </div>
                <Field label="Description" name="description" rows={2} />
              </AdminForm>
            </div>
          ) : null}

          {section === "published" ? (
            assignments.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted">
                No assignments yet.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {assignments.map((assignment) => (
                  <article key={assignment.id} className="glass rounded-2xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">
                          {assignment.title}
                        </p>
                        <p className="text-xs text-purple-soft">
                          {assignment.category} ·{" "}
                          {assignment.type.replaceAll("_", " ")} · +
                          {assignment.xpReward} XP
                        </p>
                        <p className="mt-1 line-clamp-2 text-sm text-muted">
                          {assignment.question}
                        </p>
                      </div>
                      {assignment.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={assignment.imageUrl}
                          alt={assignment.title}
                          width={48}
                          height={48}
                          className="h-12 w-12 shrink-0 rounded-xl object-cover"
                        />
                      ) : null}
                    </div>
                    <form
                      action={deleteAssignment.bind(null, assignment.id)}
                      className="mt-3"
                    >
                      <button type="submit" className="text-xs text-red">
                        Delete
                      </button>
                    </form>
                  </article>
                ))}
              </div>
            )
          ) : null}

          {section === "grade" ? (
            <div className="space-y-4">
              <div className="money-pad-toggle">
                {filters.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setFilter(item)}
                    className={
                      filter === item ? "money-pad-toggle-active" : undefined
                    }
                  >
                    {item.charAt(0) + item.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>

              {filtered.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted">
                  No submissions in this filter.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {filtered.map((submission) => (
                    <article
                      key={submission.id}
                      className="glass rounded-2xl p-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-foreground">
                            {submission.assignment.title}
                          </p>
                          <p className="text-xs text-muted">
                            {submission.user.name} · {submission.user.email}
                          </p>
                          <p className="mt-2 text-sm text-foreground">
                            Answer:{" "}
                            <span className="font-medium text-purple-soft">
                              {submission.answer}
                            </span>
                          </p>
                          <p className="mt-1 text-[10px] text-muted">
                            {new Date(submission.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            submission.status === "APPROVED"
                              ? "bg-green/20 text-green"
                              : submission.status === "REJECTED"
                                ? "bg-red/20 text-red"
                                : "bg-orange/20 text-orange"
                          }`}
                        >
                          {submission.status}
                        </span>
                      </div>

                      {submission.status === "PENDING" ? (
                        <GradeForm submission={submission} />
                      ) : null}
                    </article>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function SummaryChip({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="home-cover-chip rounded-2xl px-2 py-3 text-center">
      <p className="text-[10px] text-muted">{label}</p>
      <p
        className={`mt-1 text-sm font-bold ${
          accent ? "text-orange" : "text-foreground"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
