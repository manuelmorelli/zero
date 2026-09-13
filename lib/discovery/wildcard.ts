import { prisma } from "@/lib/prisma";

/** Un pick più vecchio di 24 ore va ricalcolato alla prossima lettura (nessun cron job) — stesso
 * principio già in uso per il Journey Score, vedi lib/scoring/journeyScore.ts. */
const WILDCARD_STALE_AFTER_MS = 24 * 60 * 60 * 1000;

/**
 * Pick "Wildcard" stabile per categoria: stesso Journey scelto a caso per tutti gli utenti,
 * finché il pick salvato ha meno di 24 ore. Superata la soglia (o se il Journey scelto in
 * precedenza non è più tra i candidati, es. rimosso o spostato di categoria), ne viene scelto
 * uno nuovo e salvato. Usata sia dalla pagina /journeys (una Wildcard per riga categoria) sia
 * dalla riga Home "Wildcards to follow" (i creator dietro questi stessi pick).
 */
export async function getStableWildcardPicks(
  byCategory: Map<string, { id: string }[]>
): Promise<Map<string, string>> {
  const categories = Array.from(byCategory.keys()).filter((category) => (byCategory.get(category)?.length ?? 0) > 0);
  if (categories.length === 0) return new Map();

  const existing = await prisma.wildcardPick.findMany({ where: { category: { in: categories } } });
  const existingByCategory = new Map(existing.map((pick) => [pick.category, pick]));
  const staleThreshold = Date.now() - WILDCARD_STALE_AFTER_MS;

  const result = new Map<string, string>();

  await Promise.all(
    categories.map(async (category) => {
      const list = byCategory.get(category)!;
      const current = existingByCategory.get(category);
      const stillValid = current ? list.some((journey) => journey.id === current.journeyId) : false;
      const isFresh = stillValid && current!.pickedAt.getTime() >= staleThreshold;

      if (isFresh) {
        result.set(category, current!.journeyId);
        return;
      }

      const picked = list[Math.floor(Math.random() * list.length)]!;
      result.set(category, picked.id);
      await prisma.wildcardPick.upsert({
        where: { category },
        create: { category, journeyId: picked.id },
        update: { journeyId: picked.id, pickedAt: new Date() },
      });
    })
  );

  return result;
}
