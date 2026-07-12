import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getHomePageData } from "@/lib/data/home";
import { GoalPlanner } from "@/components/student/goal-planner";
import { HomeCover } from "@/components/student/home-cover";

export default async function PlanHomePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/api/auth/signout?callbackUrl=/login");
  }

  const data = await getHomePageData(session.user.id);

  if (!data) {
    redirect("/api/auth/signout?callbackUrl=/login");
  }

  const { user, assignments, news, goals, monthExpenseTotal, monthIncomeTotal } =
    data;
  const firstName = user.name?.split(" ")[0] ?? "CEO";
  const goalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const goalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const submittedIds = new Set(
    data.submissions.map((s) => s.assignmentId),
  );
  const pendingLessons = assignments.filter(
    (a) => !submittedIds.has(a.id),
  ).length;

  return (
    <div className="space-y-6">
      <HomeCover
        firstName={firstName}
        myMoney={(monthIncomeTotal ?? 0) - (monthExpenseTotal ?? 0)}
        goalSaved={goalSaved}
        goalTarget={goalTarget}
        goalCount={goals.length}
        pendingLessons={pendingLessons}
        streak={user.streak}
      />

      <div className="fade-up fade-up-delay-1">
        <GoalPlanner
          monthExpenseTotal={monthExpenseTotal ?? 0}
          monthIncomeTotal={monthIncomeTotal ?? 0}
          goals={goals.map((g) => ({
            id: g.id,
            title: g.title,
            targetAmount: g.targetAmount,
            currentAmount: g.currentAmount,
            deadline: g.deadline?.toISOString() ?? null,
          }))}
        />
      </div>

      <section className="fade-up fade-up-delay-2 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Continue learning</h2>
          <Link href="/learn" className="text-xs text-cyan" prefetch>
            See all →
          </Link>
        </div>
        {assignments.length === 0 ? (
          <p className="text-sm text-muted">No lessons yet from admin.</p>
        ) : (
          assignments.map((assignment) => (
            <Link
              key={assignment.id}
              href={`/learn/${assignment.id}`}
              prefetch
              className="glass flex items-center gap-3 rounded-2xl p-4 transition hover:bg-white/10"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan/20 text-cyan">
                ✓
              </span>
              <div className="min-w-0">
                <p className="font-medium text-foreground">{assignment.title}</p>
                <p className="text-xs text-muted">{assignment.category}</p>
              </div>
            </Link>
          ))
        )}
      </section>

      <section className="fade-up fade-up-delay-3 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Newsfeed</h2>
          <Link href="/news" className="text-xs text-cyan" prefetch>
            Open feed →
          </Link>
        </div>
        {news.length === 0 ? (
          <p className="text-sm text-muted">No news yet.</p>
        ) : (
          news.map((item) => (
            <article key={item.id} className="glass overflow-hidden rounded-2xl">
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageUrl}
                  alt=""
                  className="aspect-[16/9] w-full object-cover"
                />
              ) : null}
              <div className="p-4">
                <p className="text-[10px] font-medium tracking-wider text-cyan uppercase">
                  News
                </p>
                <p className="mt-1 font-medium text-foreground">{item.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted">{item.body}</p>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
