-- AlterTable
ALTER TABLE "episodes" ADD COLUMN     "musicFade" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "musicTrackId" TEXT,
ADD COLUMN     "musicVolume" INTEGER NOT NULL DEFAULT 30;

-- CreateTable
CREATE TABLE "music_tracks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "mood" TEXT NOT NULL,
    "durationSec" INTEGER NOT NULL,
    "audioKey" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "music_tracks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "episodes" ADD CONSTRAINT "episodes_musicTrackId_fkey" FOREIGN KEY ("musicTrackId") REFERENCES "music_tracks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
