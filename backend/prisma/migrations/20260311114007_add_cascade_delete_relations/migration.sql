-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_playerId_fkey";

-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_stadiumId_fkey";

-- DropForeignKey
ALTER TABLE "stadiums" DROP CONSTRAINT "stadiums_managerId_fkey";

-- AddForeignKey
ALTER TABLE "stadiums" ADD CONSTRAINT "stadiums_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_stadiumId_fkey" FOREIGN KEY ("stadiumId") REFERENCES "stadiums"("id") ON DELETE CASCADE ON UPDATE CASCADE;
