import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyStreamWebhookSignature } from "@/lib/stream";

type StreamWebhookPayload = {
  uid: string;
  readyToStream: boolean;
  status: { state: string };
  playback?: { hls?: string };
};

/** Cloudflare Stream chiama questo endpoint appena la versione leggera di un video è pronta (o è
 * fallita), così il player può passare a servirla senza aspettare il controllo giornaliero di
 * riserva (vedi app/api/cron/sync-light-videos). Registrazione one-off del webhook fatta da fuori
 * l'app (vedi .env.example, sezione Cloudflare Stream). */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("webhook-signature");

  const valid = await verifyStreamWebhookSignature(rawBody, signature);
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as StreamWebhookPayload;

  const episode = await prisma.episode.findFirst({ where: { lightVideoId: payload.uid } });
  // Nessun episodio trovato: video su Stream non collegato a un episodio (es. test manuale dal
  // pannello Cloudflare), o già eliminato nel frattempo — non è un errore da segnalare.
  if (!episode) return NextResponse.json({ ok: true });

  if (payload.readyToStream && payload.playback?.hls) {
    await prisma.episode.update({
      where: { id: episode.id },
      data: { lightVideoStatus: "READY", lightVideoPlaybackUrl: payload.playback.hls },
    });
    revalidatePath(`/journeys/${episode.journeyId}/episodes/${episode.id}`);
  } else if (payload.status.state === "error") {
    await prisma.episode.update({
      where: { id: episode.id },
      data: { lightVideoStatus: "FAILED" },
    });
  }

  return NextResponse.json({ ok: true });
}
