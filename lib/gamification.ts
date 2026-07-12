const XP_PER_LEVEL = 5000;

export function getLevel(xp: number) {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export function getLevelProgress(xp: number) {
  const level = getLevel(xp);
  const levelStartXp = (level - 1) * XP_PER_LEVEL;
  const xpInLevel = xp - levelStartXp;
  const percent = Math.round((xpInLevel / XP_PER_LEVEL) * 100);

  return {
    level,
    nextLevel: level + 1,
    levelStartXp,
    xpInLevel,
    xpNeeded: XP_PER_LEVEL,
    levelCapXp: levelStartXp + XP_PER_LEVEL,
    xpToNext: XP_PER_LEVEL - xpInLevel,
    percent,
  };
}

export async function getUserLeaderboardRank(
  userId: string,
  getUsers: () => Promise<{ id: string; xp: number }[]>,
) {
  const users = await getUsers();
  const sorted = [...users].sort((a, b) => b.xp - a.xp);
  const index = sorted.findIndex((user) => user.id === userId);

  return index === -1 ? null : index + 1;
}

export function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
