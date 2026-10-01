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

/**
 * Stessa idea di coverUrl ma per la foto profilo del creatore mostrata accanto al titolo nelle
 * card (CoverFrame/JourneyCard, VideoCard...): anche User.avatarUrl salva solo la chiave R2, mai
 * un link diretto.
 */
export function resolveAvatarUrl(avatarKey: string | null): Promise<string | null> {
  return avatarKey ? getImagePlaybackUrl(avatarKey) : Promise.resolve(null);
}

/** Risolve insieme la copertina e la foto del creatore di una card Journey (JourneyCardData): le
 * due chiavi R2 vivono su record diversi (Journey.coverUrl e User.avatarUrl) ma vanno sempre
 * risolte insieme prima di passare la card al client. */
export async function withResolvedJourneyCardUrls<
  T extends { coverUrl: string | null; creator: { avatarUrl: string | null } },
>(items: T[]): Promise<T[]> {
  return Promise.all(
    items.map(async (item) => ({
      ...item,
      coverUrl: await resolveCoverUrl(item.coverUrl),
      creator: { ...item.creator, avatarUrl: await resolveAvatarUrl(item.creator.avatarUrl) },
    }))
  );
}
