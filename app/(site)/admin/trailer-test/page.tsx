import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { isAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { getVideoPlaybackUrl } from "@/lib/r2";
import { MomentsTrailerPlayer } from "@/components/common/MomentsTrailerPlayer";
import { PAGE_SPACING, PAGE_WIDTH } from "@/components/ui/page-container";
import { PageTitle, SectionTitle } from "@/components/ui/heading";

// Episodi di prova già usati in passato per testare la Mappa dei Momenti ("the valley" e "Swiss
// Alps", vedi lib/discovery/heroVideos.ts): servono solo a verificare il meccanismo del trailer,
// non fanno parte di nessuna pagina vista dagli utenti normali.
const TEST_EPISODE_IDS = ["c687d519-d2b5-47d1-a478-71119e53718e", "8424721a-aa57-4d01-9deb-dec6df540b69"];

export default async function TrailerTestPage() {
  const session = await requireSession();
  // Chi non è amministratore vede una pagina inesistente, come /admin/reports.
  if (!isAdminEmail(session.user.email)) notFound();

  const episodes = await prisma.episode.findMany({
    where: { id: { in: TEST_EPISODE_IDS }, deletedAt: null },
    include: { moments: { where: { isHighlight: true }, orderBy: { timestampSec: "asc" } } },
  });

  const items = await Promise.all(
    episodes.map(async (episode) => ({
      episode,
      videoSrc: episode.videoKey ? await getVideoPlaybackUrl(episode.videoKey) : null,
    }))
  );

  return (
    <main>
      <div className={`${PAGE_WIDTH.narrow} ${PAGE_SPACING}`}>
        <PageTitle>Trailer automatico (prova)</PageTitle>
        <p className="mt-2 text-sm text-ink-muted">
          Pagina di collaudo, visibile solo agli amministratori. Ogni video salta tra i suoi momenti
          migliori già salvati nella Mappa dei Momenti, invece di scorrere dal secondo 0.
        </p>

        <div className="mt-8 grid gap-10">
          {items.map(({ episode, videoSrc }) => (
            <div key={episode.id}>
              <SectionTitle>{episode.title}</SectionTitle>
              {videoSrc ? (
                <div className="mt-3">
                  <MomentsTrailerPlayer videoSrc={videoSrc} moments={episode.moments} />
                </div>
              ) : (
                <p className="mt-3 text-sm text-ink-muted">Nessun video per questo episodio.</p>
              )}
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-sm text-ink-muted">Nessuno degli episodi di prova è stato trovato.</p>
          )}
        </div>
      </div>
    </main>
  );
}
