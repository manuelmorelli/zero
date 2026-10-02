-- CreateTable
CREATE TABLE "forum_messages" (
    "id" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "forum_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "forum_messages_journeyId_createdAt_idx" ON "forum_messages"("journeyId", "createdAt");

-- AddForeignKey
ALTER TABLE "forum_messages" ADD CONSTRAINT "forum_messages_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "journeys"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_messages" ADD CONSTRAINT "forum_messages_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
