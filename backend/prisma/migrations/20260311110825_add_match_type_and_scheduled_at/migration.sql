-- CreateEnum
CREATE TYPE "MatchType" AS ENUM ('FULL', 'HALF');

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "matchType" "MatchType" NOT NULL DEFAULT 'FULL',
ADD COLUMN     "scheduledAt" TIMESTAMP(3);
