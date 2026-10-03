// Test manuale della Mappa dei Momenti su uno o pochi episodi, prima di lanciarla su tutta la
// libreria. Uso: npx tsx --env-file=.env scripts/extract-episode-moments.ts <episodeId> [altroId...]
// Senza argomenti, mostra 5 episodi recenti da cui scegliere. Richiede MOMENTS_LIBRARY_ENABLED=true
// in .env, altrimenti si ferma subito con un errore chiaro (è lo stesso interruttore usato dal sito).
import { prisma } from "@/lib/prisma";
import { extractEpisodeMoments } from "@/lib/ai/episodeMoments";

async function main() {
  const ids = process.argv.slice(2);

  if (ids.length === 0) {
    const episodes = await prisma.episode.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, durationSec: true, videoKey: true },
    });
    console.log("Nessun episodio indicato. Ultimi 5 episodi in libreria:\n");
    for (const episode of episodes) {
      console.log(`${episode.id}  "${episode.title}"  (${episode.durationSec ?? "?"}s, video: ${episode.videoKey ? "si" : "NO"})`);
    }
    console.log("\nUso: npx tsx --env-file=.env scripts/extract-episode-moments.ts <episodeId> [altroId...]");
    await prisma.$disconnect();
    return;
  }

  for (const id of ids) {
    process.stdout.write(`Episodio ${id}... `);
    const result = await extractEpisodeMoments(id);
    console.log("count" in result ? `${result.count} momenti scritti` : `ERRORE: ${result.error}`);
  }
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
