import type { NotificationType } from "@/generated/prisma/client";

// I quattro "mattoncini" Community ammessi (Punto 8 dell'allineamento): modelli Prisma già
// esistenti (Workshop, Event, DigitalProduct, PersonalService), mai collegati a nulla finora.
// Unica fonte di verità per tipo/etichette, usata dal modulo di creazione, dalla chat AI e dalle
// pagine Dashboard/Subscribe — non aggiungere altri tipi qui senza cambiare anche lo schema.
export const COMMUNITY_LISTING_TYPES = ["workshop", "event", "digital_product", "personal_service"] as const;
export type CommunityListingType = (typeof COMMUNITY_LISTING_TYPES)[number];

export const COMMUNITY_LISTING_LABELS: Record<CommunityListingType, string> = {
  workshop: "Workshop",
  event: "Event",
  digital_product: "Digital Product",
  personal_service: "1:1 Service",
};

// Solo Workshop ed Event possono essere gratuiti (interruttore "isFree") e hanno una data
// (startsAt): un Prodotto Digitale o una Consulenza restano sempre a pagamento, senza data propria.
export function listingSupportsFree(type: CommunityListingType): boolean {
  return type === "workshop" || type === "event";
}

export function listingHasDate(type: CommunityListingType): boolean {
  return type === "workshop" || type === "event";
}

export function listingHasFile(type: CommunityListingType): boolean {
  return type === "digital_product";
}

export const COMMUNITY_LISTING_NOTIFICATION_TYPE: Record<CommunityListingType, NotificationType> = {
  workshop: "WORKSHOP",
  event: "EVENT",
  digital_product: "DIGITAL_PRODUCT",
  personal_service: "PERSONAL_SERVICE",
};

export const MAX_LISTING_PRICE = 5000;

/** Pagina di dettaglio pubblica e condivisibile di un singolo elemento (2026-09-26, richiesta da
 * Manuel dopo che le notifiche portavano a una pagina generica dove l'elemento non si trovava
 * facilmente): usata come link delle notifiche e del pulsante Condividi. Vive qui (non in
 * lib/actions/communityListing.ts) perché quel file è "use server" — ogni sua funzione esportata
 * deve essere un'azione async, questa è solo un helper sincrono di formattazione. */
export function listingDetailPath(type: CommunityListingType, id: string): string {
  return `/community/${type}/${id}`;
}
