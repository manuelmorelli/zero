// Eseguito in un processo Node separato via tsx (vedi helpers.ts, callDb), non importato
// direttamente dai test: generated/prisma/client è generato solo in ESM (Prisma 7) e Playwright
// transpila i test a CommonJS, dove caricarlo va in errore ("require() ES Module ... in a cycle").
// tsx carica i moduli con il vero resolver ESM di Node, senza questo problema.
//
// Uso: tsx tests/e2e/db-cli.ts <model> <action> [argsJson]
// Esempio: tsx tests/e2e/db-cli.ts user update '{"where":{"id":"..."},"data":{"bio":"x"}}'
// Stampa su stdout il risultato come JSON (null se l'azione non restituisce nulla).
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/generated/prisma/client";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;

function reviveDates(value: unknown): unknown {
  if (typeof value === "string" && ISO_DATE.test(value)) return new Date(value);
  if (Array.isArray(value)) return value.map(reviveDates);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, reviveDates(v)]));
  }
  return value;
}

async function main() {
  const [model, action, argsJson] = process.argv.slice(2);
  if (!model || !action) throw new Error("usage: db-cli.ts <model> <action> [argsJson]");

  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter });

  const args = argsJson ? reviveDates(JSON.parse(argsJson)) : undefined;
  const client = prisma as unknown as Record<string, Record<string, (args?: unknown) => Promise<unknown>>>;
  const result = await client[model][action](args);
  await prisma.$disconnect();
  process.stdout.write(JSON.stringify(result ?? null));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
