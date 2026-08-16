-- AlterTable
-- Dati attuali fittizi: nessun backfill che preservi l'ordine esistente, tutti a 0.
ALTER TABLE "journeys" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "journeys" ALTER COLUMN "order" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "journeys_creatorId_order_idx" ON "journeys"("creatorId", "order");
