import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ListVideo, MessageSquare, Play, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getViewerSession } from "@/lib/session";
import { getEpisodeTimeline } from "@/lib/journey/episodeTimeline";
import { getWatchAction } from "@/lib/journey/watchAction";
import { isPubliclyReachableJourneyStatus, promoteExpiredDiscoveryJourneys } from "@/lib/constants/journeyStatus";
import { getCreatorTrust } from "@/lib/profile/trustScore";
import { resolveAvatarUrl, resolveCoverUrl } from "@/lib/media/resolveCoverUrl";
import { formatDuration } from "@/lib/format/duration";
import { FollowButton } from "@/components/profile/FollowButton";
import { ShareButton } from "@/components/common/ShareButton";
import { ReportButton } from "@/components/common/ReportButton";
import { ExpandableText } from "@/components/common/ExpandableText";
import { Avatar } from "@/components/ui/avatar";
import { TrustScoreBadge } from "@/components/common/TrustScoreBadge";
import { ButtonPrimary, ButtonSecondary } from "@/components/ui/button";
import { Reveal } from "@/components/common/Reveal";
import { CoverMenu } from "@/components/journey/CoverMenu";
import type { TimelineEpisode } from "@/lib/journey/episodeTimeline";
import { PAGE_SPACING, PAGE_WIDTH } from "@/components/ui/page-container";
import { NOTICE, ROW } from "@/components/ui/panel";
import { PageTitle, SectionTitle } from "@/components/ui/heading";
import { cn, formatCompactNumber } from "@/lib/utils";
import { COVER_IMAGE_QUALITY } from "@/lib/constants/image";

export default async function PublicJourneyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  await promoteExpiredDiscoveryJourneys();
  const journey = await prisma.journey.findUnique({
    where: { id },
    include: { creator: { include: { user: { select: { avatarUrl: true } } } } },
  });

  if (!journey || journey.deletedAt || !isPubliclyReachableJourneyStatus(journey.status)) notFound();

  // Contatore semplice per "Total Views" nel Profilo pubblico: nessuna deduplica per
  // visitatore/sessione nell'MVP, coerente con l'approccio minimo già scelto altrove.
  void prisma.journey.update({ where: { id: journey.id }, data: { viewsCount: { increment: 1 } } }).catch(() => {});

  const [journeyCoverUrl, creatorAvatarUrl] = await Promise.all([
    resolveCoverUrl(journey.coverUrl),
    resolveAvatarUrl(journey.creator.user.avatarUrl),
  ]);

  const session = await getViewerSession();
  const { groups, flatEpisodes } = await getEpisodeTimeline(journey.id, { userId: session?.user.id });
  const watchAction = getWatchAction(flatEpisodes);

  const isOwnJourney = session?.user.id === journey.creator.userId;
  // Follow è persona-segue-persona (vedi 00-project-context.md, sezione "Modello utente
  // unico"): si segue la persona dietro il creator, non un "Follow di Creator" a parte.
  const followersCount = await prisma.follow.count({ where: { followingId: journey.creator.userId } });
  const isFollowing =
    session && !isOwnJourney
      ? Boolean(
          await prisma.follow.findUnique({
            where: {
              followerId_followingId: { followerId: session.user.id, followingId: journey.creator.userId },
            },
          })
        )
      : false;

  const trust = await getCreatorTrust(journey.creator.id, followersCount);
  // Trusty totali ricevuti dagli episodi di QUESTO Journey (non il Trust Score del creator): in
  // copertina su telefono si mostrano questi, non il punteggio — si parte senza algoritmo, il
  // punteggio può anche essere null/poco significativo ora, i Trusty sono un numero vero da subito.
  const journeyTrustyCount =
    flatEpisodes.length === 0
      ? 0
      : await prisma.like.count({
          where: { targetType: "EPISODE", targetId: { in: flatEpisodes.map((episode) => episode.id) } },
        });

  return (
    <main>

      <div className={cn(PAGE_WIDTH.wide, PAGE_SPACING, "md:grid md:grid-cols-[minmax(0,1fr)_340px] md:items-start md:gap-5")}>
        <Reveal className="md:min-w-0">
          <div className="grid gap-4">
            {/* Sul telefono la foto esce dal margine laterale della pagina (-mx-5 annulla
             * esattamente il px-5 del contenitore) ed è più alta (aspect-[40/39], il 4:3 di
             * partenza +30%). Angoli arrotondati su tutti e quattro i lati, come da computer. */}
            <div className="relative -mx-5 aspect-[40/39] w-auto overflow-hidden rounded-xl border border-border bg-surface-2 md:mx-auto md:aspect-video md:w-[min(100%,calc(70vh*16/9))]">
              {journeyCoverUrl ? (
                <Image
                  src={journeyCoverUrl}
                  alt={journey.title}
                  fill
                  sizes="(min-width: 768px) calc(70vh * 16 / 9), 100vw"
                  quality={COVER_IMAGE_QUALITY}
                  className="object-cover"
                  preload
                />
              ) : (
                <div className="absolute inset-0 cover-placeholder" />
              )}
              <div className="absolute inset-0 card-scrim" />
              {/* Sfumatura in più, solo telefono: il blocco di testo sopra la foto qui è più alto
               * (titolo, autore, conteggi, bottone Watch) di una card normale, serve più scurimento
               * perché resti leggibile. Da computer card-scrim da sola basta già, come prima. */}
              <div className="absolute inset-0 card-scrim-soft md:hidden" />
              {watchAction && (
                <Link
                  href={`/journeys/${journey.id}/episodes/${watchAction.episodeId}`}
                  aria-label="Play"
                  className="absolute inset-0 hidden place-items-center bg-scrim transition-opacity md:grid"
                >
                  <span className="video-play-circle grid h-16 w-16 place-items-center rounded-full border border-border bg-scrim backdrop-blur-md transition-transform duration-300 hover:scale-105">
                    <Play className="h-6 w-6 fill-current text-ember" aria-hidden="true" />
                  </span>
                </Link>
              )}
              {(journey.status === "ARCHIVED" || journey.completedAt) && (
                <span className="absolute right-3 top-3 rounded-full border border-border bg-scrim px-2.5 py-1 text-sm font-semibold uppercase tracking-wider">
                  {journey.status === "ARCHIVED" ? "Archived" : "Completed"}
                </span>
              )}
              {/* Menu a tre puntini sopra la copertina, solo telefono: Condividi (qui, non più
               * un'icona a parte), Forum, Segnala, Modifica Journey (solo per chi l'ha creato). Da
               * computer non esiste, quelle azioni restano dove sono già (riga Follow più sotto). */}
              <div className="absolute right-3 top-3 md:hidden">
                <CoverMenu
                  share={{
                    path: `/journeys/${journey.id}`,
                    label: journey.title,
                    updateCaption: isOwnJourney
                      ? `New Journey: ${journey.title}`
                      : `Check out this Journey by ${journey.creator.displayName}: ${journey.title}`,
                    linkedJourneyId: journey.id,
                  }}
                  forumHref={`/community/forum/${journey.id}`}
                  report={!isOwnJourney && session ? { targetType: "JOURNEY", targetId: journey.id } : undefined}
                  editHref={isOwnJourney ? `/dashboard/journeys/${journey.id}` : undefined}
                  editLabel="Edit Journey"
                />
              </div>
              {/* Categoria+titolo+conteggi+Watch sopra la foto, solo telefono (come nel mockup):
               * da computer restano sotto la foto, versione invariata più giù (hidden md:block /
               * md:flex). Il bottone Watch sta in basso a dx, affianco al testo; se la scritta è
               * troppo lunga ("Continue watching · Episode N") si tronca con i puntini. Foto e nome
               * del creator non stanno più qui: sono appena sotto la copertina (vedi riga subito
               * dopo), ingranditi, col bottone Follow a fianco. */}
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 md:hidden">
                <div className="mb-4 min-w-0 flex-1">
                  <p className="text-sm font-bold leading-none tracking-[0.22em] text-ember uppercase">Journey</p>
                  {journey.category && (
                    <p className="text-sm font-bold leading-none tracking-[0.22em] text-ember uppercase">{journey.category}</p>
                  )}
                  <PageTitle as="p" className="mt-1.5 truncate text-3xl text-on-photo">
                    {journey.title}
                  </PageTitle>
                  <div className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-ember">
                    <span>
                      {flatEpisodes.length} {flatEpisodes.length === 1 ? "Episode" : "Episodes"}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true" />
                      {formatCompactNumber(journeyTrustyCount)} Trusty
                    </span>
                  </div>
                </div>
                {watchAction && (
                  <ButtonSecondary
                    href={`/journeys/${journey.id}/episodes/${watchAction.episodeId}`}
                    className="-mb-2 max-w-[42%] shrink-0 px-5 py-1.5 text-sm"
                  >
                    <Play className="h-3.5 w-3.5 shrink-0 fill-current" aria-hidden="true" />
                    <span className="min-w-0 truncate">{watchAction.label}</span>
                  </ButtonSecondary>
                )}
              </div>
            </div>

            {/* Watch, Condividi e Forum appena sotto la copertina, allineati a destra: solo
             * computer (su telefono Condividi e Forum stanno nel menu a tre puntini). Il Forum
             * qui è nuovo: da computer prima non esisteva per il Journey, solo su telefono
             * accanto a "Episodes". */}
            {/* Foto+nome del creator, appena sotto la copertina, solo telefono: ingranditi del
             * 15%, con Follow a destra (finisce praticamente in linea col bottone Watch sopra). */}
            <div className="flex items-center justify-between gap-3 md:hidden">
              <Link href={`/profile/${journey.creator.userId}`} className="flex min-w-0 items-center gap-2.5">
                <Avatar name={journey.creator.displayName} avatarUrl={creatorAvatarUrl} size="sm" className="h-[46px] w-[46px]" />
                <span className="truncate text-base font-semibold text-ink">{journey.creator.displayName}</span>
              </Link>
              {!isOwnJourney && (
                <FollowButton
                  userId={journey.creator.userId}
                  initialIsFollowing={isFollowing}
                  isLoggedIn={Boolean(session)}
                  className="py-1.5"
                />
              )}
            </div>

            <div className="flex flex-col justify-between gap-4">
              {/* Blocco scritte (Journey/categoria/titolo/creator/descrizione) e Watch+Condividi
               * +Forum sulla stessa riga, titolo a sinistra, bottoni a destra: solo computer. */}
              <div className="hidden items-start justify-between gap-4 md:flex">
                <div className="relative min-w-0 md:pl-21">
                  <div className="flex flex-wrap items-center gap-3 text-sm text-ink-muted">
                    <Link
                      href={`/profile/${journey.creator.userId}`}
                      className="flex min-w-0 items-center gap-2 transition-colors hover:text-ember"
                    >
                      <Avatar name={journey.creator.displayName} avatarUrl={creatorAvatarUrl} size="sm" />
                      <span className="truncate">{journey.creator.displayName}</span>
                    </Link>
                    {trust.score !== null && <TrustScoreBadge score={trust.score} trustedByCount={trust.trustedByCount} />}
                    <span className="inline-flex items-center gap-1.5">
                      <ListVideo className="h-3.5 w-3.5" aria-hidden="true" />
                      {flatEpisodes.length} {flatEpisodes.length === 1 ? "Episode" : "Episodes"}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm leading-none tracking-[0.22em] text-ember uppercase">
                    Journey{journey.category ? ` · ${journey.category}` : ""}
                  </p>
                  <PageTitle className="mt-1">
                    {journey.title}
                  </PageTitle>
                  {journey.description && (
                    <p className="mt-3 max-w-prose text-lg leading-relaxed text-ink-muted">
                      {journey.description}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-2.5 md:pr-20">
                  {watchAction && (
                    <ButtonSecondary
                      href={`/journeys/${journey.id}/episodes/${watchAction.episodeId}`}
                      className="px-4 py-2 text-sm"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                      {watchAction.label}
                    </ButtonSecondary>
                  )}
                  <ShareButton
                    path={`/journeys/${journey.id}`}
                    label={journey.title}
                    updateCaption={
                      isOwnJourney
                        ? `New Journey: ${journey.title}`
                        : `Check out this Journey by ${journey.creator.displayName}: ${journey.title}`
                    }
                    linkedJourneyId={journey.id}
                    className="grid h-9 w-9 place-items-center rounded-full border border-border text-ember transition-opacity hover:opacity-80"
                  />
                  <Link
                    href={`/community/forum/${journey.id}`}
                    aria-label="Open the Journey forum"
                    title="Forum"
                    className="grid h-9 w-9 place-items-center rounded-full border border-border text-ember transition-opacity hover:opacity-80"
                  >
                    <MessageSquare className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Da computer: Follow resta qui, come sempre. Su telefono vive accanto a
                 * foto+nome del creator appena sotto la copertina (vedi più sopra), non qui. */}
                {!isOwnJourney && (
                  <FollowButton
                    userId={journey.creator.userId}
                    initialIsFollowing={isFollowing}
                    isLoggedIn={Boolean(session)}
                    className="hidden md:inline-block"
                  />
                )}
                {!isOwnJourney && session && (
                  <ReportButton
                    targetType="JOURNEY"
                    targetId={journey.id}
                    className="hidden h-9 w-9 place-items-center rounded-full border border-border text-ink-muted transition-colors hover:border-danger hover:text-danger md:grid"
                  />
                )}
              </div>
              {/* Descrizione Journey, solo telefono: sopra sta già invariata da computer
               * (dentro il blocco hidden md:block più sopra). 4 righe poi "more", stile YouTube. */}
              {journey.description && (
                <ExpandableText text={journey.description} clampLines={4} className="text-lg leading-relaxed text-on-photo md:hidden" />
              )}
            </div>
          </div>
        </Reveal>

        <section className="mt-5 md:mt-0 md:min-w-0">
          {/* Solo telefono: stesso stile stampatello dei capitoli (maiuscolo, spaziato), ma
           * bianca invece che arancione — resta il titolo bianco della sezione. */}
          <div className="flex items-center justify-between gap-3">
            <SectionTitle className="text-xl uppercase tracking-[0.08em] md:text-lg md:normal-case md:tracking-tight">Episodes</SectionTitle>
            <ButtonSecondary href={`/community/forum/${journey.id}`} className="shrink-0 py-1.5 md:hidden">
              <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
              Forum
            </ButtonSecondary>
          </div>
          {flatEpisodes.length === 0 ? (
            <p className={`mt-3 ${NOTICE}`}>
              This Journey doesn&apos;t have any episodes yet.
            </p>
          ) : (
            <div className="mt-3 space-y-5">
              {groups.map((group) => (
                <div key={group.chapterId ?? "loose"}>
                  {group.chapterTitle && (
                    <p className="text-xl font-bold tracking-[0.08em] text-ember uppercase md:text-sm md:font-normal md:tracking-[0.22em] md:text-ink-muted">
                      {group.chapterTitle}
                    </p>
                  )}
                  <ul className="mt-2 space-y-2">
                    {group.episodes.map((episode) => (
                      <EpisodeRow key={episode.id} episode={episode} journeyId={journey.id} coverUrl={journeyCoverUrl} />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function EpisodeRow({
  episode,
  journeyId,
  coverUrl,
}: {
  episode: TimelineEpisode;
  journeyId: string;
  coverUrl: string | null;
}) {
  return (
    <li>
      <Link
        href={`/journeys/${journeyId}/episodes/${episode.id}`}
        id={episode.id}
        className={cn(ROW, "group flex w-full max-w-[420px] scroll-mt-24 items-center gap-3 p-2 text-left hover:-translate-y-0.5")}
      >
        <span className="relative aspect-4/3 w-36 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-2 sm:w-44 md:w-28">
          {episode.posterUrl || coverUrl ? (
            <Image
              src={episode.posterUrl || coverUrl!}
              alt=""
              fill
              sizes="(min-width: 768px) 112px, 176px"
              quality={COVER_IMAGE_QUALITY}
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 cover-placeholder transition-transform duration-700 group-hover:scale-105" />
          )}
          <div className="absolute inset-0 card-scrim" />
          <span className="absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="grid h-8 w-8 place-items-center rounded-full border border-border bg-scrim backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
              <Play className="h-3 w-3 translate-x-[1px] fill-current text-ember" aria-hidden="true" />
            </span>
          </span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="block text-sm font-bold tracking-[0.18em] text-ember uppercase md:font-normal">
              Episode {episode.number}
            </span>
            {episode.durationSec !== null && (
              <span className="hidden text-sm text-ember md:inline">{formatDuration(episode.durationSec)}</span>
            )}
            {episode.progress && (
              <span className="text-sm font-semibold text-ember md:ml-4 md:text-ink-muted">
                · {episode.progress.completedAt ? "Watched" : "Resume"}
              </span>
            )}
          </span>
          <span className="mt-0.5 block truncate text-sm font-semibold transition-colors group-hover:text-ember md:line-clamp-2 md:whitespace-normal">
            {episode.title}
          </span>
          {episode.durationSec !== null && (
            <span className="mt-0.5 block text-sm text-ink-muted md:hidden">{formatDuration(episode.durationSec)}</span>
          )}
        </span>
      </Link>
    </li>
  );
}
