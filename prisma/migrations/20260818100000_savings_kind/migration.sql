-- CreateEnum
CREATE TYPE "SavingsKind" AS ENUM ('SAVINGS', 'MUTUAL_FUND');

-- AlterTable
ALTER TABLE "SavingsAccount" ADD COLUMN "kind" "SavingsKind" NOT NULL DEFAULT 'SAVINGS';
