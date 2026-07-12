import { PrismaClient } from "../app/generated/prisma/client.ts";

const p = new PrismaClient();

async function main() {
  const tables = await p.$queryRawUnsafe(
    "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY 1",
  );
  console.log(
    "tables:",
    tables.map((t) => t.tablename).join(", "),
  );
  console.log("users", await p.user.count());
  for (const [name, fn] of [
    ["sipPlan", () => p.sipPlan.count()],
    ["notification", () => p.notification.count()],
    ["coverUrl", () => p.user.findFirst({ select: { coverUrl: true } })],
    ["expense.kind", () => p.expense.findFirst({ select: { kind: true } })],
  ]) {
    try {
      console.log(name, "ok", await fn());
    } catch (e) {
      console.log(name, "FAIL", String(e).slice(0, 220));
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
