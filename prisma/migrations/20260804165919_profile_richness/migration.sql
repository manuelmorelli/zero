-- CreateEnum
CREATE TYPE "LikeTargetType" AS ENUM ('EPISODE', 'UPDATE');

-- AlterTable
ALTER TABLE "journeys" ADD COLUMN     "viewsCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "coverUrl" TEXT,
ADD COLUMN     "location" TEXT;

-- CreateTable
CREATE TABLE "likes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetType" "LikeTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "likes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "likes_targetType_targetId_idx" ON "likes"("targetType", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "likes_userId_targetType_targetId_key" ON "likes"("userId", "targetType", "targetId");

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
