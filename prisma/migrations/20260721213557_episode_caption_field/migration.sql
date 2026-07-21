/*
  Warnings:

  - You are about to drop the column `description` on the `episodes` table. All the data in the column will be lost.
  - You are about to drop the column `text` on the `episodes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "episodes" DROP COLUMN "description",
DROP COLUMN "text",
ADD COLUMN     "caption" TEXT;
