import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";

// Bump when schema fields change so Turbopack/dev doesn't keep a stale client.
const PRISMA_CLIENT_REVISION = "v3-driver-adapter";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaRevision: string | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  // prisma-client (engineType client) requires a driver adapter — no Rust query engine.
  const adapter = new PrismaPg({
    connectionString,
    // Keep the pool small; Supabase transaction pooler is limited.
    max: 5,
  });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function getPrisma() {
  if (
    globalForPrisma.prisma &&
    globalForPrisma.prismaRevision === PRISMA_CLIENT_REVISION
  ) {
    return globalForPrisma.prisma;
  }

  void globalForPrisma.prisma?.$disconnect().catch(() => undefined);
  globalForPrisma.prisma = createPrismaClient();
  globalForPrisma.prismaRevision = PRISMA_CLIENT_REVISION;
  return globalForPrisma.prisma;
}

export const prisma = getPrisma();
