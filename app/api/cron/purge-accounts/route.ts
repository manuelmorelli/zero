import { NextResponse } from "next/server";
import { purgeExpiredAccounts } from "@/lib/account/deletion";

/** Chiamata una volta al giorno da Vercel Cron (vedi vercel.json). Protetta da CRON_SECRET:
 * Vercel allega automaticamente "Authorization: Bearer $CRON_SECRET" alle chiamate cron quando
 * la variabile d'ambiente si chiama esattamente così, vedi .env.example. */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deletedCount = await purgeExpiredAccounts();
  return NextResponse.json({ deletedCount });
}
