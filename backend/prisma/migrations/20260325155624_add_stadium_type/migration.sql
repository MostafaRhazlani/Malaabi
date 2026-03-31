-- CreateEnum
CREATE TYPE "StadiumType" AS ENUM ('FIVE_V_FIVE', 'SEVEN_V_SEVEN', 'EIGHT_V_EIGHT', 'ELEVEN_V_ELEVEN', 'INDOOR');

-- AlterTable
ALTER TABLE "stadiums" ADD COLUMN     "stadiumType" "StadiumType" NOT NULL DEFAULT 'FIVE_V_FIVE';
