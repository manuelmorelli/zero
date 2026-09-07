import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getLightVideoDetails, isStreamConfigured, startLightVideoEncoding } from "@/lib/stream";

/** Rete di sicurezza per la versione leggera dei video (vedi lib/stream.ts): il percorso normale
 * è istantaneo via webhook (app/api/webhooks/stream/route.ts), questo controllo giornaliero
 * recupera solo i casi persi — un webhook mai arrivato, o un tentativo di avvio fallito al
 * momento della pubblicazione. Chiamato 1x/giorno da Vercel Cron (vedi vercel.json), stessa
 * protezione CRON_SECRET di app/api/cron/purge-accounts. */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isStreamConfigured()) {
    return NextResponse.json({ skipped: "Cloudflare Stream not configured" });
  }

  const pending = await prisma.episode.findMany({
    where: { lightVideoStatus: "PENDING", lightVideoId: { not: null }, deletedAt: null },
  });

  let readyCount = 0;
  let failedCount = 0;
  for (const episode of pending) {
    const details = await getLightVideoDetails(episode.lightVideoId!);
    if (!details) continue;
    if (details.state === "ready" && details.hlsUrl) {
      await prisma.episode.update({
        where: { id: episode.id },
        data: { lightVideoStatus: "READY", lightVideoPlaybackUrl: details.hlsUrl },
      });
      readyCount++;
    } else if (details.state === "error") {
      await prisma.episode.update({ where: { id: episode.id }, data: { lightVideoStatus: "FAILED" } });
      failedCount++;
    }
  }

  // Episodi pubblicati con un video ma senza alcun tentativo di versione leggera ancora avviato:
  // succede se il tentativo al momento della pubblicazione è fallito (es. Cloudflare
  // irraggiungibile) o se Stream non era ancora configurato quando sono stati pubblicati.
  const notStarted = await prisma.episode.findMany({
    where: { lightVideoStatus: null, videoKey: { not: null }, publishedAt: { not: null }, deletedAt: null },
  });

  let startedCount = 0;
  for (const episode of notStarted) {
    const streamVideoId = await startLightVideoEncoding(episode.videoKey!);
    if (streamVideoId) {
      await prisma.episode.update({
        where: { id: episode.id },
        data: { lightVideoId: streamVideoId, lightVideoStatus: "PENDING" },
      });
      startedCount++;
    }
  }

  return NextResponse.json({ readyCount, failedCount, startedCount });
}
