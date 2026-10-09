// Test manuale della Mappa dei Momenti su uno o pochi episodi, prima di lanciarla su tutta la
// libreria. Uso: npx tsx --env-file=.env scripts/extract-episode-moments.ts <episodeId> [altroId...]
// Senza argomenti, mostra 5 episodi recenti da cui scegliere. Richiede MOMENTS_LIBRARY_ENABLED=true
// in .env, altrimenti si ferma subito con un errore chiaro (è lo stesso interruttore usato dal sito).
//
// Uso --all: npx tsx --env-file=.env scripts/extract-episode-moments.ts --all [--force]
// Lancio unico da fare quando MOMENTS_LIBRARY_ENABLED verrà acceso sul serio: elabora, uno alla
// volta, tutti gli episodi già pubblicati con un video. Da quel momento in poi i nuovi episodi
// vengono elaborati da soli alla pubblicazione (lib/actions/episode.ts), questo script serve solo
// a recuperare quelli pubblicati prima dell'accensione. Salta di default gli episodi che hanno già
// dei "momenti" salvati; --force li rielabora comunque.
import { prisma } from "@/lib/prisma";
import { extractEpisodeMoments } from "@/lib/ai/episodeMoments";

async function runAll(force: boolean) {
  const episodes = await prisma.episode.findMany({
    where: { publishedAt: { not: null }, videoKey: { not: null }, deletedAt: null },
    orderBy: { publishedAt: "asc" },
    select: { id: true, title: true, _count: { select: { moments: true } } },
  });

  const toProcess = force ? episodes : episodes.filter((episode) => episode._count.moments === 0);
  console.log(`${toProcess.length} episodi da elaborare (su ${episodes.length} pubblicati con video).\n`);

  let done = 0;
  for (const episode of toProcess) {
    process.stdout.write(`[${done + 1}/${toProcess.length}] "${episode.title}" (${episode.id})... `);
    const result = await extractEpisodeMoments(episode.id);
    console.log("count" in result ? `${result.count} momenti scritti` : `ERRORE: ${result.error}`);
    done++;
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args[0] === "--all") {
    await runAll(args.includes("--force"));
    await prisma.$disconnect();
    return;
  }

  const ids = args;

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
    console.log("Uso (tutti i già pubblicati): npx tsx --env-file=.env scripts/extract-episode-moments.ts --all [--force]");
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
