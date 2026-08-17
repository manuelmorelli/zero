import { getImagePlaybackUrl } from "@/lib/r2";

/**
 * Journey.coverUrl salva la chiave R2 della copertina caricata (o null se non ancora impostata),
 * mai un link diretto: va sempre risolta in un link temporaneo di sola lettura qui, non passata
 * così com'è a <Image>. Stesso principio già in uso per avatar/copertina utente (vedi
 * app/profile/[username]/page.tsx).
 */
export function resolveCoverUrl(coverKey: string | null): Promise<string | null> {
  return coverKey ? getImagePlaybackUrl(coverKey) : Promise.resolve(null);
}

export async function withResolvedCoverUrl<T extends { coverUrl: string | null }>(item: T): Promise<T> {
  return { ...item, coverUrl: await resolveCoverUrl(item.coverUrl) };
}

export async function withResolvedCoverUrls<T extends { coverUrl: string | null }>(items: T[]): Promise<T[]> {
  return Promise.all(items.map(withResolvedCoverUrl));
}
