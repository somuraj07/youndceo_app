import { getRedis } from "@/lib/redis";

const ISO_DATE =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

function reviveDates(_key: string, value: unknown) {
  if (typeof value === "string" && ISO_DATE.test(value)) {
    return new Date(value);
  }
  return value;
}

export const CacheKeys = {
  contentVer: "yc:v1:content:ver",
  home: (userId: string, ver: number) => `yc:v1:home:${userId}:c${ver}`,
  portfolio: (userId: string) => `yc:v1:portfolio:${userId}`,
  spend: (userId: string) => `yc:v1:spend:${userId}`,
  learn: (userId: string, ver: number) => `yc:v1:learn:${userId}:c${ver}`,
  learnDetail: (userId: string, id: string, ver: number) =>
    `yc:v1:learn:${userId}:${id}:c${ver}`,
  news: (ver: number) => `yc:v1:news:c${ver}`,
  newsFeed: (userId: string, ver: number) => `yc:v1:newsfeed:${userId}:c${ver}`,
  admin: (ver: number) => `yc:v1:admin:c${ver}`,
  adminUsers: (ver: number) => `yc:v1:admin:users:c${ver}`,
  adminAssignments: (ver: number) => `yc:v1:admin:assignments:c${ver}`,
  market: "yc:v1:market:quotes",
  profile: (userId: string) => `yc:v1:profile:${userId}`,
  funds: (ver: number) => `yc:v1:funds:c${ver}`,
} as const;

const TTL = {
  home: 180,
  portfolio: 180,
  spend: 180,
  learn: 240,
  news: 180,
  admin: 120,
  market: 120,
  profile: 300,
  funds: 300,
} as const;

type MemoryEntry = { value: unknown; expiresAt: number };
const memory = new Map<string, MemoryEntry>();
const MEMORY_TTL_MS = 90_000;

function memoryGet<T>(key: string): T | undefined {
  const hit = memory.get(key);
  if (!hit) return undefined;
  if (Date.now() > hit.expiresAt) {
    memory.delete(key);
    return undefined;
  }
  return hit.value as T;
}

function memorySet(key: string, value: unknown, ttlSeconds: number) {
  memory.set(key, {
    value,
    expiresAt: Date.now() + Math.min(ttlSeconds * 1000, MEMORY_TTL_MS),
  });
}

function memoryDelete(...keys: string[]) {
  for (const key of keys) memory.delete(key);
}

function memoryClear() {
  memory.clear();
}

let versionCache: { value: number; at: number } | null = null;
const VERSION_TTL_MS = 30_000;

async function contentVersion() {
  if (versionCache && Date.now() - versionCache.at < VERSION_TTL_MS) {
    return versionCache.value;
  }

  const client = getRedis();
  if (!client) return 1;

  try {
    const ver = await client.get<number>(CacheKeys.contentVer);
    const value = typeof ver === "number" ? ver : 1;
    versionCache = { value, at: Date.now() };
    return value;
  } catch {
    return versionCache?.value ?? 1;
  }
}

export async function bumpContentVersion() {
  memoryClear();
  versionCache = null;
  const client = getRedis();
  if (!client) return;
  try {
    const next = await client.incr(CacheKeys.contentVer);
    versionCache = { value: next, at: Date.now() };
  } catch {
    versionCache = null;
  }
}

export async function cached<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>,
): Promise<T> {
  const local = memoryGet<T>(key);
  if (local !== undefined) {
    return local;
  }

  const client = getRedis();

  if (client) {
    try {
      const hit = await client.get(key);
      if (hit != null) {
        const parsed =
          typeof hit === "string"
            ? (JSON.parse(hit, reviveDates) as T)
            : (JSON.parse(JSON.stringify(hit), reviveDates) as T);
        memorySet(key, parsed, ttlSeconds);
        return parsed;
      }
    } catch {
      // Cache miss / parse error — load fresh
    }
  }

  const data = await loader();
  memorySet(key, data, ttlSeconds);

  if (client) {
    // Don't block the response on Redis write
    void client.set(key, JSON.stringify(data), { ex: ttlSeconds }).catch(() => {});
  }

  return data;
}

export async function invalidateKeys(...keys: string[]) {
  memoryDelete(...keys);
  const client = getRedis();
  if (!client || keys.length === 0) return;
  try {
    await client.del(...keys);
  } catch {
    // Ignore
  }
}

export async function invalidateUserCaches(userId: string) {
  const ver = await contentVersion();
  await invalidateKeys(
    CacheKeys.home(userId, ver),
    CacheKeys.portfolio(userId),
    CacheKeys.spend(userId),
    CacheKeys.learn(userId, ver),
    CacheKeys.profile(userId),
  );
}

export async function invalidateStudentFinance(userId: string) {
  const ver = await contentVersion();
  await invalidateKeys(
    CacheKeys.home(userId, ver),
    CacheKeys.portfolio(userId),
    CacheKeys.spend(userId),
  );
}

export async function invalidateAfterAdminContentChange() {
  await bumpContentVersion();
}

export async function invalidateAfterGrading(userId: string) {
  const ver = await contentVersion();
  await Promise.all([
    bumpContentVersion(),
    invalidateKeys(
      CacheKeys.home(userId, ver),
      CacheKeys.learn(userId, ver),
      CacheKeys.profile(userId),
    ),
  ]);
}

export async function getContentVersion() {
  return contentVersion();
}

export { TTL };
