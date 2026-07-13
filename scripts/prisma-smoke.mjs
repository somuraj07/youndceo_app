import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client.ts";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  max: 5,
});
const prisma = new PrismaClient({ adapter });
const n = await prisma.user.count();
const sample = await prisma.user.findMany({
  select: { email: true, role: true },
  take: 5,
});
console.log("count", n, sample);
await prisma.$disconnect();
