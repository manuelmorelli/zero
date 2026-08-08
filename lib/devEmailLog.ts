// Ripiego temporaneo finché Resend non ha un dominio verificato (vedi lib/email.ts): il
// mittente condiviso "onboarding@resend.dev" viene consegnato ma spesso bloccato in
// silenzio da provider come Yahoo, prima ancora di finire nello Spam. Per non restare
// bloccati nei test, ogni link di verifica/reset viene tenuto anche qui in memoria, SOLO
// fuori produzione, recuperabile dalla UI (Register, Forgot password) invece di dipendere
// solo dall'email. Va rimosso quando un dominio verificato risolverà la consegna reale.
type DevEmailLink = {
  email: string;
  kind: "verify-email" | "reset-password";
  url: string;
  createdAt: number;
};

const globalForDevEmailLog = globalThis as unknown as {
  devEmailLinks: DevEmailLink[] | undefined;
};

const links = globalForDevEmailLog.devEmailLinks ?? [];
globalForDevEmailLog.devEmailLinks = links;

const MAX_ENTRIES = 20;

export function recordDevEmailLink(email: string, kind: DevEmailLink["kind"], url: string) {
  if (process.env.NODE_ENV === "production") return;
  links.push({ email: email.toLowerCase(), kind, url, createdAt: Date.now() });
  if (links.length > MAX_ENTRIES) links.shift();
}

export function getLatestDevEmailLink(email: string, kind: DevEmailLink["kind"]): string | null {
  if (process.env.NODE_ENV === "production") return null;
  const match = [...links].reverse().find((link) => link.email === email.toLowerCase() && link.kind === kind);
  return match?.url ?? null;
}
