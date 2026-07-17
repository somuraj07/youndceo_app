import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ProfileStudio } from "@/components/profile/profile-studio";
import { getProfileData } from "@/lib/data/home";

export default async function AdminSettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await getProfileData(session.user.id);

  if (!user) {
    redirect("/login");
  }

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
        goals: 0,
        completed: 0,
        coursesDone: 0,
        challengesDone: 0,
        xp: user.xp,
        savedPercent: 0,
      }}
    />
  );
}
