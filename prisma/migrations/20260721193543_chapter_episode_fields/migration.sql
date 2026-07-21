/*
  Warnings:

  - You are about to drop the column `durationSec` on the `episodes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "chapters" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "episodes" DROP COLUMN "durationSec",
ADD COLUMN     "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
