-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'MENTION';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "notifyMention" BOOLEAN NOT NULL DEFAULT true;
