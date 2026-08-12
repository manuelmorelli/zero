-- AlterTable
ALTER TABLE "updates" ADD COLUMN     "linkedEpisodeId" TEXT,
ADD COLUMN     "linkedJourneyId" TEXT,
ADD COLUMN     "mediaKey" TEXT;

-- CreateTable
CREATE TABLE "update_poll_options" (
    "id" TEXT NOT NULL,
    "updateId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "update_poll_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "update_votes" (
    "id" TEXT NOT NULL,
    "updateId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "update_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "update_views" (
    "id" TEXT NOT NULL,
    "updateId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "update_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "update_answers" (
    "id" TEXT NOT NULL,
    "updateId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "update_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "update_reactions" (
    "id" TEXT NOT NULL,
    "updateId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "update_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "update_poll_options_updateId_order_idx" ON "update_poll_options"("updateId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "update_votes_updateId_userId_key" ON "update_votes"("updateId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "update_views_updateId_userId_key" ON "update_views"("updateId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "update_answers_updateId_userId_key" ON "update_answers"("updateId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "update_reactions_updateId_userId_key" ON "update_reactions"("updateId", "userId");

-- AddForeignKey
ALTER TABLE "updates" ADD CONSTRAINT "updates_linkedJourneyId_fkey" FOREIGN KEY ("linkedJourneyId") REFERENCES "journeys"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "updates" ADD CONSTRAINT "updates_linkedEpisodeId_fkey" FOREIGN KEY ("linkedEpisodeId") REFERENCES "episodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "update_poll_options" ADD CONSTRAINT "update_poll_options_updateId_fkey" FOREIGN KEY ("updateId") REFERENCES "updates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "update_votes" ADD CONSTRAINT "update_votes_updateId_fkey" FOREIGN KEY ("updateId") REFERENCES "updates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "update_votes" ADD CONSTRAINT "update_votes_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "update_poll_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "update_votes" ADD CONSTRAINT "update_votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "update_views" ADD CONSTRAINT "update_views_updateId_fkey" FOREIGN KEY ("updateId") REFERENCES "updates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "update_views" ADD CONSTRAINT "update_views_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "update_answers" ADD CONSTRAINT "update_answers_updateId_fkey" FOREIGN KEY ("updateId") REFERENCES "updates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "update_answers" ADD CONSTRAINT "update_answers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "update_reactions" ADD CONSTRAINT "update_reactions_updateId_fkey" FOREIGN KEY ("updateId") REFERENCES "updates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "update_reactions" ADD CONSTRAINT "update_reactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
