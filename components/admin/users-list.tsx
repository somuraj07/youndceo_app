"use client";

import { useMemo, useState } from "react";
import { IconUsers } from "@/components/ui/icons";

type UserItem = {
  id: string;
  name: string;
  email: string;
  role: string;
  xp: number;
  streak: number;
  createdAt: string;
};

type Filter = "ALL" | "USER" | "ADMIN";

export function UsersList({ users }: { users: UserItem[] }) {
  const [filter, setFilter] = useState<Filter>("ALL");

  const students = users.filter((u) => u.role === "USER");
  const admins = users.filter((u) => u.role === "ADMIN");
  const avgXp =
    students.length === 0
      ? 0
      : Math.round(students.reduce((sum, u) => sum + u.xp, 0) / students.length);
  const topStreak = users.reduce((max, u) => Math.max(max, u.streak), 0);

  const filtered = useMemo(() => {
    if (filter === "ALL") return users;
    return users.filter((u) => u.role === filter);
  }, [filter, users]);

  return (
    <div className="space-y-6">
      <section className="home-cover fade-up relative overflow-hidden rounded-[1.85rem] p-5 sm:p-6">
        <div className="home-cover-glow pointer-events-none absolute inset-0" aria-hidden />

        <div className="relative z-[1] space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.18em] text-purple-soft uppercase">
                Directory
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Users
              </h1>
              <p className="mt-2 max-w-sm text-sm text-muted">
                {students.length} student{students.length === 1 ? "" : "s"} ·{" "}
                {admins.length} admin{admins.length === 1 ? "" : "s"}
              </p>
            </div>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-purple-soft">
              <IconUsers className="h-6 w-6" />
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <SummaryChip label="Total" value={users.length} />
            <SummaryChip label="Students" value={students.length} />
            <SummaryChip label="Avg XP" value={avgXp} />
            <SummaryChip label="Top streak" value={topStreak} />
          </div>
        </div>
      </section>

      <section className="glass-strong fade-up fade-up-delay-1 overflow-hidden rounded-3xl">
        <div className="flex border-b border-white/10">
          {(
            [
              { id: "ALL", label: "All" },
              { id: "USER", label: "Students" },
              { id: "ADMIN", label: "Admins" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`flex-1 px-3 py-3 text-sm font-semibold transition ${
                filter === tab.id
                  ? "border-b-2 border-purple text-purple-soft"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-5">
          {filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">
              No users in this filter.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((user) => {
                const initials = user.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <article
                    key={user.id}
                    className="glass flex flex-col rounded-2xl p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-purple/20 text-sm font-bold text-purple-soft">
                        {initials}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                          user.role === "ADMIN"
                            ? "bg-purple/20 text-purple-soft"
                            : "bg-white/10 text-muted"
                        }`}
                      >
                        {user.role === "ADMIN" ? "Admin" : "Student"}
                      </span>
                    </div>

                    <h2 className="mt-4 truncate font-semibold text-foreground">
                      {user.name}
                    </h2>
                    <p className="truncate text-xs text-muted">{user.email}</p>

                    <div className="mt-4 grid grid-cols-2 gap-2 border-t border-white/10 pt-4">
                      <div>
                        <p className="text-[10px] text-muted">XP</p>
                        <p className="text-sm font-semibold text-foreground">
                          {user.xp.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted">Streak</p>
                        <p className="text-sm font-semibold text-purple-soft">
                          {user.streak} day{user.streak === 1 ? "" : "s"}
                        </p>
                      </div>
                    </div>

                    <p className="mt-3 text-[11px] text-muted">
                      Joined{" "}
                      {new Date(user.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function SummaryChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="home-cover-chip rounded-2xl px-2 py-3 text-center">
      <p className="text-[10px] text-muted">{label}</p>
      <p className="mt-1 text-sm font-bold text-foreground">
        {value.toLocaleString()}
      </p>
    </div>
  );
}
