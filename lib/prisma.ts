import { PrismaClient } from "@/app/generated/prisma/client";

// Bump when schema fields change so Turbopack/dev doesn't keep a stale client.
const PRISMA_CLIENT_REVISION = "v2-coverUrl-moneyKind";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaRevision: string | undefined;
};

function createPrismaClient() {
  return new PrismaClient({
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
