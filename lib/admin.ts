/**
 * Chi può aprire il pannello di gestione (/admin/reports). Le email arrivano dalla variabile
 * d'ambiente ADMIN_EMAILS (separate da virgola), così non finiscono scritte nel codice.
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(email.trim().toLowerCase());
}
