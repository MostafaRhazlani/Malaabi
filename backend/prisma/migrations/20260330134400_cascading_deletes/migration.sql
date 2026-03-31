-- DropForeignKey
ALTER TABLE "teams" DROP CONSTRAINT "teams_leaderId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_managerId_fkey";

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
