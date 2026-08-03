-- Episode.chapterId diventa opzionale: i Capitoli sono un livello organizzativo
-- facoltativo (05_Journey.md), un Episodio deve poter esistere senza Capitolo.
-- Aggiunge journeyId diretto su Episode, così un Episodio resta collegato al suo
-- Journey anche senza passare da un Capitolo.

-- DropForeignKey
ALTER TABLE "episodes" DROP CONSTRAINT "episodes_chapterId_fkey";

-- DropIndex
DROP INDEX "episodes_chapterId_order_idx";

-- AlterTable: journeyId aggiunta nullable per poter fare il backfill sui dati esistenti.
ALTER TABLE "episodes" ADD COLUMN "journeyId" TEXT,
ALTER COLUMN "chapterId" DROP NOT NULL;

-- Backfill: ogni episodio esistente eredita il journeyId dal proprio capitolo.
UPDATE "episodes" e
SET "journeyId" = c."journeyId"
FROM "chapters" c
WHERE e."chapterId" = c."id";

-- Ora che tutte le righe hanno un valore, la colonna può diventare NOT NULL.
ALTER TABLE "episodes" ALTER COLUMN "journeyId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "episodes_journeyId_chapterId_order_idx" ON "episodes"("journeyId", "chapterId", "order");

-- AddForeignKey
ALTER TABLE "episodes" ADD CONSTRAINT "episodes_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "journeys"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "episodes" ADD CONSTRAINT "episodes_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "chapters"("id") ON DELETE SET NULL ON UPDATE CASCADE;
