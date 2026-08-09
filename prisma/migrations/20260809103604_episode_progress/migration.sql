-- AlterTable
ALTER TABLE "journey_progresses" DROP COLUMN "completedAt",
DROP COLUMN "positionSec";

-- CreateTable
CREATE TABLE "episode_progresses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "episodeId" TEXT NOT NULL,
    "positionSec" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "episode_progresses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "episode_progresses_userId_episodeId_key" ON "episode_progresses"("userId", "episodeId");

-- AddForeignKey
ALTER TABLE "episode_progresses" ADD CONSTRAINT "episode_progresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "episode_progresses" ADD CONSTRAINT "episode_progresses_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "episodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

