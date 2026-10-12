// Rifà, una volta, il video piccolo della Home (Hero) di un episodio: incolla insieme pezzi presi
// dai momenti migliori segnati a mano dal creator (stellina sul player, vedi
// components/journey/HighlightMarkButton.tsx), al posto del singolo pezzo continuo di 14 secondi di
// oggi. La durata totale è sempre TOTAL_TRAILER_SECONDS (uguale per ogni episodio, vedi
// lib/constants/moments.ts): ogni pezzo dura quel totale diviso quanti momenti ci sono. Il video
// originale su R2 non viene mai toccato: il risultato sovrascrive solo il file leggero in
// public/videos/ che la Home già usa (stesso nome, nessuna modifica a components/landing/Hero.tsx
// o lib/discovery/heroVideos.ts).
//
// Uso: npx tsx --env-file=.env scripts/make-hero-clip.ts <episodeId>
// Richiede che l'episodio abbia già almeno MIN_MANUAL_HIGHLIGHTS momenti segnati a mano.
import { execFileSync } from "child_process";
import { mkdtempSync, writeFileSync, rmSync } from "fs";
import path from "path";
import os from "os";
import ffmpeg from "@ffmpeg-installer/ffmpeg";
import { prisma } from "@/lib/prisma";
import { getVideoBytes } from "@/lib/r2";
import { TOTAL_TRAILER_SECONDS, MIN_MANUAL_HIGHLIGHTS, MAX_MANUAL_HIGHLIGHTS } from "@/lib/constants/moments";

// Stessi due episodi e stessi nomi di file di lib/discovery/heroVideos.ts: sovrascrivendo questi
// file, la Home li usa subito, senza toccare nessun componente.
const HERO_CLIP_FILES: Record<string, { video: string; poster: string }> = {
  "c687d519-d2b5-47d1-a478-71119e53718e": { video: "hero-valley.mp4", poster: "hero-valley-poster.jpg" },
  "8424721a-aa57-4d01-9deb-dec6df540b69": { video: "hero-swiss-alps.mp4", poster: "hero-swiss-alps-poster.jpg" },
};

function toPosix(filePath: string): string {
  return filePath.replace(/\\/g, "/");
}

async function main() {
  const episodeId = process.argv[2];
  const files = episodeId ? HERO_CLIP_FILES[episodeId] : undefined;
  if (!episodeId || !files) {
    console.log("Uso: npx tsx --env-file=.env scripts/make-hero-clip.ts <episodeId>\n");
    console.log("Episodi della Hero oggi:");
    for (const [id, clip] of Object.entries(HERO_CLIP_FILES)) {
      console.log(`  ${id}  ->  public/videos/${clip.video}`);
    }
    return;
  }

  const episode = await prisma.episode.findUnique({ where: { id: episodeId } });
  if (!episode?.videoKey) {
    console.log("Questo episodio non ha un video.");
    return;
  }

  const highlights = await prisma.episodeMoment.findMany({
    where: { episodeId, source: "CREATOR" },
    orderBy: { timestampSec: "asc" },
  });
  if (highlights.length < MIN_MANUAL_HIGHLIGHTS) {
    console.log(
      `Servono almeno ${MIN_MANUAL_HIGHLIGHTS} momenti segnati a mano (ne ha ${highlights.length}). ` +
        "Segnali con la stellina sul player di quell'episodio, poi rilancia questo script."
    );
    return;
  }
  const chosen = highlights.slice(0, MAX_MANUAL_HIGHLIGHTS);

  console.log(`Scarico il video originale di "${episode.title}"...`);
  const original = await getVideoBytes(episode.videoKey);
  if (!original) {
    console.log("Video non trovato su R2.");
    return;
  }

  const tempDir = mkdtempSync(path.join(os.tmpdir(), "hero-clip-"));
  try {
    const inputPath = path.join(tempDir, "original.mp4");
    writeFileSync(inputPath, original.data);

    const clipSeconds = TOTAL_TRAILER_SECONDS / chosen.length;
    const segmentPaths: string[] = [];
    chosen.forEach((moment, index) => {
      const segmentPath = path.join(tempDir, `segment-${index}.mp4`);
      console.log(`Taglio il pezzo ${index + 1}/${chosen.length} (dal secondo ${moment.timestampSec}, ${clipSeconds.toFixed(1)}s)...`);
      execFileSync(ffmpeg.path, [
        "-y",
        "-i", inputPath,
        "-ss", String(moment.timestampSec),
        "-t", String(clipSeconds),
        "-c:v", "libx264",
        "-c:a", "aac",
        "-movflags", "+faststart",
        segmentPath,
      ]);
      segmentPaths.push(segmentPath);
    });

    const listPath = path.join(tempDir, "list.txt");
    writeFileSync(listPath, segmentPaths.map((segmentPath) => `file '${toPosix(segmentPath)}'`).join("\n"));

    const outputVideoPath = path.join(process.cwd(), "public", "videos", files.video);
    console.log("Incollo i pezzi insieme...");
    // Riscrive tutto come un unico flusso pulito (non solo incollare i file già pronti): evita i
    // piccoli scatti che un semplice incollaggio può lasciare nei punti di giunzione tra un pezzo
    // e l'altro.
    execFileSync(ffmpeg.path, [
      "-y",
      "-fflags", "+genpts",
      "-f", "concat",
      "-safe", "0",
      "-i", listPath,
      "-c:v", "libx264",
      "-c:a", "aac",
      "-movflags", "+faststart",
      outputVideoPath,
    ]);

    const outputPosterPath = path.join(process.cwd(), "public", "videos", files.poster);
    execFileSync(ffmpeg.path, ["-y", "-i", outputVideoPath, "-vframes", "1", outputPosterPath]);

    console.log(
      `Fatto: public/videos/${files.video} e ${files.poster} aggiornati ` +
        `(${chosen.length} momenti, ${TOTAL_TRAILER_SECONDS} secondi totali).`
    );
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
