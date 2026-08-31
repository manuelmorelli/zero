-- AlterTable
ALTER TABLE "users" ADD COLUMN     "notifyNewEpisode" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifyNewJourney" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifyQuestionAnswered" BOOLEAN NOT NULL DEFAULT true;
