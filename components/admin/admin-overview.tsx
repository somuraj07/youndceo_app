"use client";

import Link from "next/link";
import {
  AreaSpark,
  BubbleCluster,
  HeatStrip,
  OrbitRings,
  PolarBars,
  StatusRail,
  WaveBars,
} from "@/components/ui/charts";
import {
  IconChallenges,
  IconNews,
  IconSettings,
  IconUsers,
} from "@/components/ui/icons";

type OverviewData = {
  stats: {
    users: number;
    assignments: number;
    news: number;
    pendingSubmissions: number;
    completionRate: number;
    totalSubmissions: number;
    approved: number;
    rejected: number;
    mcqCount: number;
    fillCount: number;
  };
  analytics: number[];
  topStudents: { name: string; xp: number; streak: number }[];
};

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

export function AdminOverview({ data }: { data: OverviewData }) {
  const weekValues = data.analytics.every((v) => v === 0)
    ? [2, 4, 3, 6, 5, 8, 7]
    : data.analytics;

  const weekTotal = weekValues.reduce((a, b) => a + b, 0);
  const peakDay = Math.max(...weekValues, 0);
  const todayCount = weekValues[weekValues.length - 1] ?? 0;
  const approvalRate =
    data.stats.approved + data.stats.rejected === 0
      ? 0
      : Math.round(
          (data.stats.approved /
            (data.stats.approved + data.stats.rejected)) *
            100,
        );

  return (
    <div className="space-y-5">
      {/* Command header */}
      <section className="home-cover fade-up relative overflow-hidden rounded-[1.85rem] p-5 sm:p-6">
        <div className="home-cover-glow pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative z-[1] grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
          <div className="flex flex-col justify-center">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-purple-soft uppercase">
              Command center
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Dashboard
            </h1>
            <p className="mt-2 max-w-md text-sm text-muted">
              Live pulse of students, tasks, and reviews — built for quick action.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/admin/assignments"
                className="money-pad-submit inline-flex items-center gap-2 px-4 py-2.5 text-sm"
              >
                <IconChallenges className="h-4 w-4" />
                {data.stats.pendingSubmissions > 0
                  ? `Grade ${data.stats.pendingSubmissions} pending`
                  : "Open tasks"}
              </Link>
              <Link
                href="/admin/users"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-white/10"
              >
                <IconUsers className="h-4 w-4" />
                Students
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[10px] font-medium tracking-wide text-muted uppercase">
                  Today
                </p>
                <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">
                  {todayCount}
                </p>
                <p className="text-xs text-muted">submissions today</p>
              </div>
              <div className="h-14 w-28">
                <AreaSpark
                  values={weekValues}
                  color="#8b5cf6"
                  height={56}
                  className="h-14"
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/10 pt-4">
              <div>
                <p className="text-[10px] text-muted">Pending</p>
                <p className="text-sm font-bold text-orange">
                  {data.stats.pendingSubmissions}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted">Approved</p>
                <p className="text-sm font-bold text-green">
                  {approvalRate}%
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted">Students</p>
                <p className="text-sm font-bold text-purple-soft">
                  {data.stats.users}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento grid */}
      <div className="fade-up fade-up-delay-1 grid gap-3 sm:grid-cols-2 lg:grid-cols-12">
        {/* Orbit rings — span 5 */}
        <div className="glass-strong rounded-3xl p-5 sm:col-span-2 lg:col-span-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Orbit score</p>
              <p className="text-[11px] text-muted">Completion · students · tasks</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <OrbitRings
              rings={[
                {
                  label: "Done",
                  percent: data.stats.completionRate || 8,
                  color: "#22c55e",
                },
                {
                  label: "Reach",
                  percent: Math.min(100, data.stats.users * 12),
                  color: "#8b5cf6",
                },
                {
                  label: "Tasks",
                  percent: Math.min(100, data.stats.assignments * 14),
                  color: "#38bdf8",
                },
              ]}
              size={150}
            />
            <div className="w-full space-y-2 sm:max-w-[9rem]">
              {[
                { label: "Completion", color: "#22c55e", value: `${data.stats.completionRate}%` },
                { label: "Students", color: "#8b5cf6", value: data.stats.users },
                { label: "Assignments", color: "#38bdf8", value: data.stats.assignments },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-2 text-xs">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: row.color }}
                  />
                  <span className="flex-1 text-muted">{row.label}</span>
                  <span className="font-semibold text-foreground">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Polar week — span 4 */}
        <div className="glass rounded-3xl p-5 lg:col-span-4">
          <p className="text-sm font-semibold text-foreground">Radial week</p>
          <p className="text-[11px] text-muted">Submissions by day</p>
          <div className="mt-2 flex justify-center">
            <PolarBars values={weekValues} />
          </div>
          <p className="mt-1 text-center text-[11px] text-muted">
            {weekTotal} this week · peak {peakDay}/day
          </p>
        </div>

        {/* Stat stack — span 3 */}
        <div className="grid grid-cols-2 gap-3 sm:col-span-2 sm:grid-cols-4 lg:col-span-3 lg:grid-cols-1">
          {[
            {
              label: "Students",
              value: data.stats.users,
              href: "/admin/users",
              tint: "text-purple-soft",
            },
            {
              label: "Pending",
              value: data.stats.pendingSubmissions,
              href: "/admin/assignments",
              tint: "text-orange",
            },
            {
              label: "News",
              value: data.stats.news,
              href: "/admin/news",
              tint: "text-foreground",
            },
            {
              label: "Submits",
              value: data.stats.totalSubmissions,
              href: "/admin/assignments",
              tint: "text-foreground",
            },
          ].map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="glass flex flex-col justify-between rounded-2xl p-3 transition hover:bg-white/10 lg:flex-row lg:items-center"
            >
              <p className="text-[10px] text-muted">{stat.label}</p>
              <p className={`text-xl font-bold ${stat.tint}`}>{stat.value}</p>
            </Link>
          ))}
        </div>

        {/* Heat strip — full */}
        <div className="glass rounded-3xl p-5 sm:col-span-2 lg:col-span-7">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Heat trail</p>
              <p className="text-[11px] text-muted">7-day submission intensity</p>
            </div>
            <Link href="/admin/assignments" className="text-xs text-purple-soft">
              Grade →
            </Link>
          </div>
          <HeatStrip values={weekValues} labels={DAY_LABELS} />
          <div className="mt-4">
            <AreaSpark
              values={weekValues}
              color="#8b5cf6"
              height={56}
              className="h-14"
            />
          </div>
        </div>

        {/* Status rail — span 5 */}
        <div className="glass-strong rounded-3xl p-5 sm:col-span-2 lg:col-span-5">
          <p className="text-sm font-semibold text-foreground">Review pipeline</p>
          <p className="mb-4 text-[11px] text-muted">
            Where submissions sit right now
          </p>
          <StatusRail
            segments={[
              {
                label: "Pending",
                value: data.stats.pendingSubmissions,
                color: "#f59e0b",
              },
              {
                label: "Approved",
                value: data.stats.approved,
                color: "#22c55e",
              },
              {
                label: "Rejected",
                value: data.stats.rejected,
                color: "#f472b6",
              },
            ]}
          />
          <div className="mt-5 border-t border-white/10 pt-4">
            <p className="mb-2 text-xs font-medium text-muted">Task mix</p>
            <BubbleCluster
              items={[
                {
                  label: "MCQ",
                  value: data.stats.mcqCount,
                  color: "#8b5cf6",
                },
                {
                  label: "Fill-in",
                  value: data.stats.fillCount,
                  color: "#38bdf8",
                },
                {
                  label: "News",
                  value: data.stats.news,
                  color: "#22c55e",
                },
              ]}
            />
          </div>
        </div>

        {/* Wave + leaderboard */}
        <div className="glass rounded-3xl p-5 sm:col-span-2 lg:col-span-7">
          <p className="mb-3 text-sm font-semibold text-foreground">
            Submission pillars
          </p>
          <WaveBars
            values={weekValues}
            labels={DAY_LABELS}
            colors={[
              "#8b5cf6",
              "#a78bfa",
              "#38bdf8",
              "#22c55e",
              "#f59e0b",
              "#f472b6",
              "#818cf8",
            ]}
          />
        </div>

        <div className="glass rounded-3xl p-5 sm:col-span-2 lg:col-span-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">XP leaders</p>
            <Link href="/admin/users" className="text-xs text-purple-soft">
              All →
            </Link>
          </div>
          {data.topStudents.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">No students yet.</p>
          ) : (
            <ul className="space-y-2">
              {data.topStudents.map((student, index) => {
                const maxXp = data.topStudents[0]?.xp || 1;
                const width = Math.max(8, (student.xp / maxXp) * 100);
                return (
                  <li key={student.name + index} className="space-y-1">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="truncate font-medium text-foreground">
                        <span className="mr-1.5 text-muted">#{index + 1}</span>
                        {student.name}
                      </span>
                      <span className="shrink-0 text-purple-soft">
                        {student.xp.toLocaleString()} XP
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-purple to-blue"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="fade-up fade-up-delay-2 grid gap-3 sm:grid-cols-3">
        {[
          {
            title: "Create task",
            desc: "MCQ or fill-in blank",
            href: "/admin/assignments",
            icon: IconChallenges,
          },
          {
            title: "Post news",
            desc: "Photo or video update",
            href: "/admin/news",
            icon: IconNews,
          },
          {
            title: "Settings",
            desc: "Ranks, funds & account",
            href: "/admin/settings",
            icon: IconSettings,
          },
        ].map(({ title, desc, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="glass group flex items-center gap-3 rounded-2xl p-4 transition hover:bg-white/10"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple/20 text-purple-soft transition group-hover:scale-105">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="font-medium text-foreground">{title}</p>
              <p className="text-xs text-muted">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
