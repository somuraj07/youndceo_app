import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ProfileStudio } from "@/components/profile/profile-studio";
import { getProfileData } from "@/lib/data/home";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await getProfileData(session.user.id);

  if (!user) {
    redirect("/login");
  }

  const [goals, lessonsDone] = await Promise.all([
    prisma.goal.findMany({
      where: { userId: session.user.id },
      select: { currentAmount: true, targetAmount: true },
    }),
    prisma.assignmentSubmission.count({
      where: { userId: session.user.id, status: "APPROVED" },
    }),
  ]);

  const saved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const target = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const savedPercent =
    target <= 0 ? 0 : Math.min(100, Math.round((saved / target) * 100));

  return (
    <ProfileStudio
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        coverUrl: user.coverUrl,
        role: user.role,
        streak: user.streak,
      }}
      stats={{
        goals: goals.length,
        lessonsDone,
        savedPercent,
      }}
    />
  );
}
