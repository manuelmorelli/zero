-- Follow diventa persona-segue-persona invece di persona-segue-Creator
-- (vedi 00-project-context.md, sezione "Modello utente unico"). Nessun
-- backfill necessario: la tabella "follows" non ha righe al momento di
-- questa migrazione.

-- DropForeignKey
ALTER TABLE "follows" DROP CONSTRAINT "follows_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "follows" DROP CONSTRAINT "follows_userId_fkey";

-- DropIndex
DROP INDEX "follows_userId_creatorId_key";

-- AlterTable
ALTER TABLE "follows" DROP COLUMN "creatorId",
DROP COLUMN "userId",
ADD COLUMN     "followerId" TEXT NOT NULL,
ADD COLUMN     "followingId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "follows_followerId_followingId_key" ON "follows"("followerId", "followingId");

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
