"use server";

import { getLatestDevEmailLink } from "@/lib/devEmailLog";

/**
 * Solo per sviluppo (vedi lib/devEmailLog.ts): recupera l'ultimo link di verifica/reset
 * generato per un'email, per non restare bloccati mentre la consegna reale non è affidabile.
 * Restituisce sempre null in produzione.
 */
export async function getDevEmailLink(
  email: string,
  kind: "verify-email" | "reset-password"
): Promise<string | null> {
  return getLatestDevEmailLink(email, kind);
}
