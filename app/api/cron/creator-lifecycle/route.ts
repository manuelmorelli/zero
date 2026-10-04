import { NextResponse } from "next/server";
import { runCreatorLifecycle } from "@/lib/account/creatorLifecycle";

/** Chiamata una volta al giorno da Vercel Cron (vedi vercel.json). Protetta da CRON_SECRET, come purge-accounts. */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runCreatorLifecycle();
  return NextResponse.json(result);
}
