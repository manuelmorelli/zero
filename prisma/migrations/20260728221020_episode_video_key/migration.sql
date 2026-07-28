-- Il link video esterno viene sostituito dal percorso del file caricato su Cloudflare R2:
-- i valori esistenti (link esterni temporanei) non sono compatibili col nuovo formato e vengono scartati.
ALTER TABLE "episodes" DROP COLUMN "videoUrl";
ALTER TABLE "episodes" ADD COLUMN "videoKey" TEXT;
