type ModerationResult = { flagged: boolean; categories: string[] };

type ModerationInput =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: string };

export const MODERATION_REJECTION_MESSAGE =
  "This content doesn't meet our community guidelines. Please review and try again.";

/**
 * Primo filtro automatico su testo e immagini appena caricati, tramite l'endpoint di moderazione
 * gratuito di OpenAI (`omni-moderation-latest`, gestisce sia testo sia immagini in una sola
 * chiamata — nessuna libreria aggiuntiva, solo fetch). Se OPENAI_API_KEY non è ancora configurata,
 * non blocca nulla: stesso principio già in uso in lib/email.ts prima che Resend fosse collegato,
 * permette di continuare a lavorare in locale prima di creare l'account OpenAI.
 *
 * Copre solo testo e immagini: i video non sono ancora controllati (servirebbe un'analisi per
 * fotogrammi, più complessa) — primo filtro, non soluzione completa.
 */
async function moderate(input: ModerationInput): Promise<ModerationResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return { flagged: false, categories: [] };

  let response: Response;
  try {
    response = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "omni-moderation-latest",
        input: [
          input.type === "text"
            ? { type: "text", text: input.text }
            : { type: "image_url", image_url: { url: input.image_url } },
        ],
      }),
    });
  } catch (error) {
    console.error("[moderation] OpenAI moderation request failed", error);
    return { flagged: false, categories: [] };
  }

  if (!response.ok) {
    // Un problema temporaneo del servizio di moderazione non deve impedire di pubblicare
    // contenuto legittimo: si registra l'errore e si lascia passare.
    console.error(`[moderation] OpenAI moderation request failed: ${response.status}`);
    return { flagged: false, categories: [] };
  }

  const data = await response.json();
  const result = data.results?.[0];
  if (!result?.flagged) return { flagged: false, categories: [] };

  const categories = Object.entries(result.categories ?? {})
    .filter(([, value]) => value)
    .map(([key]) => key);
  return { flagged: true, categories };
}

export async function moderateText(text: string | undefined | null): Promise<ModerationResult> {
  if (!text || !text.trim()) return { flagged: false, categories: [] };
  return moderate({ type: "text", text });
}

export async function moderateImageUrl(imageUrl: string): Promise<ModerationResult> {
  return moderate({ type: "image_url", image_url: imageUrl });
}
