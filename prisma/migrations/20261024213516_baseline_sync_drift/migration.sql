-- Baseline migration (2026-10-24): catches the real database up with every change from EARLIER
-- sessions that was applied via `prisma db push` without ever getting its own migration file
-- (drift) — today's own new column (`Creator.presentationCoverUrl`) has its own separate
-- migration right after this one, kept apart so each migration still documents one change.
-- Nothing here changes any data: every column is either nullable or has a default, and both enum
-- values already matched what the live rows were using. Marked as "applied" with
-- `prisma migrate resolve`, not actually run against the database, since the database already
-- has all of this from the earlier `db push` calls.

-- CreateEnum
CREATE TYPE "EpisodeMomentSource" AS ENUM ('AI', 'CREATOR');

-- CreateEnum
CREATE TYPE "Theme" AS ENUM ('DARK', 'LIGHT');

-- AlterTable: creators
ALTER TABLE "creators" ADD COLUMN     "supportLinkUrl" TEXT,
ADD COLUMN     "allowsVoiceDubbing" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "inactivityNoticeStage" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "inactivityNoticeAt" TIMESTAMP(3),
ADD COLUMN     "pausedAt" TIMESTAMP(3),
ADD COLUMN     "resumedAt" TIMESTAMP(3);

-- AlterTable: episode_moments
ALTER TABLE "episode_moments" ADD COLUMN     "source" "EpisodeMomentSource" NOT NULL DEFAULT 'AI',
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "embedding" DROP NOT NULL;

-- AlterTable: episodes
ALTER TABLE "episodes" ADD COLUMN     "isSponsored" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable: journeys
ALTER TABLE "journeys" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "lifecycleDeleteAt" TIMESTAMP(3);

-- AlterTable: users
ALTER TABLE "users" ADD COLUMN     "creatorMode" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "creatorModeAt" TIMESTAMP(3),
ADD COLUMN     "theme" "Theme" NOT NULL DEFAULT 'DARK';
