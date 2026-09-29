import { requireCreator } from "@/lib/creator";
import { firstNameOf } from "@/lib/format/firstName";
import { parseCommunityChatRequest } from "@/lib/ai/communityChatRequest";
import { continueCommunityChat, extractCommunityDraft } from "@/lib/ai/communityDraft";
import type { CommunityAiStreamEvent } from "@/lib/communityAiChatStream";

/**
 * Un turno della chat "Crea con l'AI" nella pagina Community, solo per il creator proprietario
 * (requireCreator). La risposta esce a pezzi mentre Gemini la scrive, come nell'app Gemini; la
 * bozza si prepara dopo, mentre il creator legge. Non salva mai la bozza: la mostra soltanto, il
 * creator la conferma nel modulo (CommunityListingForm). L'unica scrittura è il conteggio delle
 * immagini AI create (limite giornaliero, lib/ai/communityImage.ts).
 */
export async function POST(request: Request) {
  const { user } = await requireCreator();

  let raw: Record<string, unknown>;
  try {
    raw = (await request.json()) as Record<string, unknown>;
  } catch {
    return new Response("Bad request", { status: 400 });
  }
  const turn = await parseCommunityChatRequest(user.id, raw);

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: CommunityAiStreamEvent) => controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));

      if ("error" in turn) {
        send({ type: "error", error: turn.error });
        controller.close();
        return;
      }

      const today = new Date();
      const result = await continueCommunityChat({
        userId: user.id,
        message: turn.message,
        lastImageKey: turn.lastImageKey,
        attachments: turn.attachments,
        previousInteractionId: turn.previousInteractionId,
        history: turn.history,
        today,
        creatorFirstName: firstNameOf(user.name),
        onText: (delta) => send({ type: "text", delta }),
      });

      if ("error" in result) {
        send({ type: "error", error: result.error });
      } else {
        send({ type: "reply", reply: result.reply, interactionId: result.interactionId, imageKey: result.imageKey });
        const draft = await extractCommunityDraft({
          draftConversation: turn.draftConversation,
          message: turn.message,
          reply: result.reply,
          today,
        });
        send({ type: "draft", draft });
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  });
}
