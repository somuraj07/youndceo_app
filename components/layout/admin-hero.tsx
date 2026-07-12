import Link from "next/link";
import { IconChallenges, IconUsers } from "@/components/ui/icons";

type AdminHeroProps = {
  studentCount: number;
  pendingCount: number;
};

export function AdminHero({ studentCount, pendingCount }: AdminHeroProps) {
  return (
    <section className="fade-up space-y-5 pt-2">
      <div>
        <p className="text-base text-muted">Students</p>
        <p className="mt-1 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {studentCount.toLocaleString("en-IN")}
        </p>
        {pendingCount > 0 ? (
          <p className="mt-2 text-sm text-orange">
            {pendingCount} pending review{pendingCount === 1 ? "" : "s"}
          </p>
        ) : (
          <p className="mt-2 text-sm text-muted">All reviews caught up</p>
        )}
      </div>

      <div className="flex gap-3">
        <Link
          href="/admin/users"
          prefetch
          className="btn-send inline-flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold"
        >
          <IconUsers className="h-4 w-4" />
          Users
        </Link>
        <Link
          href="/admin/assignments"
          prefetch
          className="btn-receive inline-flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold"
        >
          <IconChallenges className="h-4 w-4" />
          Tasks
        </Link>
      </div>
    </section>
  );
}
