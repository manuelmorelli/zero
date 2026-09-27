import type { CommunityListingType } from "@/lib/constants/communityListing";
import type { CommunityListingDraft } from "@/components/creator/CommunityListingForm";

export type CommunityAiChatMessage = {
  role: "user" | "assistant";
  text: string;
  failed?: boolean;
  /** Immagine creata dall'AI con questa risposta (chiave R2 "ai-images/..."). */
  imageKey?: string;
};

export type CommunityAiPendingDraft = { type: CommunityListingType; draft: CommunityListingDraft };

export type StoredCommunityAiChat = {
  messages: CommunityAiChatMessage[];
  interactionId: string | null;
  readyDraft: CommunityAiPendingDraft | null;
  /** Indice del primo messaggio dopo l'ultima creazione confermata: la bozza si estrae solo da lì. */
  draftStartIndex: number;
  /** Immagine scelta con "Use as cover": va nel modulo insieme alla bozza. */
  coverKey?: string | null;
};

// La chat "Crea con l'AI" resta salvata nel browser finché il creator non fa logout (decisione di
// Manuel del 2026-09-27): sopravvive al passaggio chat → modulo → indietro, alla freccia indietro
// del browser e alla chiusura della scheda. Una chiave per utente, così un altro account sullo
// stesso computer non vede mai la conversazione di qualcun altro.
const STORAGE_KEY_PREFIX = "zero:community-ai-chat:";

function storageKey(userId: string): string {
  return `${STORAGE_KEY_PREFIX}${userId}`;
}

export function loadCommunityAiChat(userId: string): StoredCommunityAiChat | null {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    return raw ? (JSON.parse(raw) as StoredCommunityAiChat) : null;
  } catch {
    return null;
  }
}

export function saveCommunityAiChat(userId: string, chat: StoredCommunityAiChat): void {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(chat));
  } catch {
    // Spazio pieno o storage bloccato: la chat funziona lo stesso, solo non sopravvive al refresh.
  }
}

/** Dopo una creazione confermata: la conversazione resta, ma il pulsante di quella bozza sparisce
 * (evita di creare due volte la stessa cosa) e le bozze successive ripartono da qui. */
export function markCommunityAiDraftUsed(userId: string): void {
  const chat = loadCommunityAiChat(userId);
  if (!chat) return;
  saveCommunityAiChat(userId, { ...chat, readyDraft: null, coverKey: null, draftStartIndex: chat.messages.length });
}

/** Al logout: cancella le chat di qualunque account salvate in questo browser. */
export function clearCommunityAiChats(): void {
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(STORAGE_KEY_PREFIX))
      .forEach((key) => localStorage.removeItem(key));
  } catch {
    // Storage non accessibile: non c'era niente da cancellare.
  }
}
