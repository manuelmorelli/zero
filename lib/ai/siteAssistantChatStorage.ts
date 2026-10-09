export type SiteAssistantChatMessage = { role: "user" | "assistant"; text: string; failed?: boolean };

export type StoredSiteAssistantChat = {
  messages: SiteAssistantChatMessage[];
  interactionId: string | null;
};

// Una sola chiave per browser, non per account: Ember funziona anche senza login e non tratta dati
// personali, a differenza della chat Community (lib/communityAiChatStorage.ts, una chiave per utente).
const STORAGE_KEY = "zero:ember-chat";

export function loadSiteAssistantChat(): StoredSiteAssistantChat | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredSiteAssistantChat) : null;
  } catch {
    return null;
  }
}

export function saveSiteAssistantChat(chat: StoredSiteAssistantChat): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chat));
  } catch {
    // Spazio pieno o storage bloccato: la chat funziona lo stesso, solo non sopravvive al refresh.
  }
}
