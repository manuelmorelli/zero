import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Endpoint pubblico per un servizio esterno di uptime monitoring (es. UptimeRobot).
 * Controlla anche il database: se risponde "ok" ma il DB è giù, non basta che Next.js sia vivo. */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok" });
  } catch {
    return NextResponse.json({ status: "error" }, { status: 503 });
  }
}
