-- CreateTable
CREATE TABLE "episode_moments" (
    "id" TEXT NOT NULL,
    "episodeId" TEXT NOT NULL,
    "timestampSec" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "embedding" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "episode_moments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "episode_moments_episodeId_idx" ON "episode_moments"("episodeId");

-- AddForeignKey
ALTER TABLE "episode_moments" ADD CONSTRAINT "episode_moments_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "episodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
