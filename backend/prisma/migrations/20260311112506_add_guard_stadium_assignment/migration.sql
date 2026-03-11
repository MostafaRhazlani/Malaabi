-- AlterTable
ALTER TABLE "users" ADD COLUMN     "assignedStadiumId" TEXT;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_assignedStadiumId_fkey" FOREIGN KEY ("assignedStadiumId") REFERENCES "stadiums"("id") ON DELETE SET NULL ON UPDATE CASCADE;
