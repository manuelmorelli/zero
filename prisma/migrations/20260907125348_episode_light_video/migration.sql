-- CreateEnum
CREATE TYPE "LightVideoStatus" AS ENUM ('PENDING', 'READY', 'FAILED');

-- AlterTable
ALTER TABLE "episodes" ADD COLUMN     "lightVideoId" TEXT,
ADD COLUMN     "lightVideoPlaybackUrl" TEXT,
ADD COLUMN     "lightVideoStatus" "LightVideoStatus";
