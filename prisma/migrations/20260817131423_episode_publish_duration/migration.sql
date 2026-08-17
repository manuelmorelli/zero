-- AlterTable
ALTER TABLE "episodes" ADD COLUMN     "durationSec" INTEGER,
ADD COLUMN     "publishedAt" TIMESTAMP(3);

-- Gli episodi già esistenti erano tutti pubblici prima di questa migrazione (non esisteva un
-- concetto di Bozza per episodio): li marchiamo pubblicati alla loro data di creazione, così non
-- spariscono dal sito. Solo gli episodi creati da qui in avanti nascono in Bozza.
UPDATE "episodes" SET "publishedAt" = "createdAt" WHERE "publishedAt" IS NULL;
