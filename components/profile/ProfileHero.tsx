import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { FadeImage } from "@/components/common/FadeImage";
import { cn, formatCompactNumber } from "@/lib/utils";
import { ProfileAvatarStory } from "@/components/profile/ProfileAvatarStory";
import { ProfileFollowStats } from "@/components/profile/ProfileFollowStats";
import { ProfileTrustStat } from "@/components/profile/ProfileTrustStat";
import { BioPanel } from "@/components/profile/BioPanel";
import { Stat } from "@/components/profile/ProfileStat";
import type { CreatorStory } from "@/lib/discovery/stories";
import type { CreatorTrust } from "@/lib/profile/trustScore";
import { PageTitle } from "@/components/ui/heading";
import { PANEL_ACCENT } from "@/components/ui/panel";
import { PAGE_WIDTH } from "@/components/ui/page-container";

type ProfileHeroProps = {
  /** Id dell'utente di cui si sta guardando il profilo (non del visitatore) — serve a
   * ProfileFollowStats per caricare gli elenchi Followers/Following di questa persona. */
  profileUserId: string;
  coverUrl: string | null;
  /** Punto orizzontale (0-1) scelto dalla persona su CoverFocalPicker: 0.5 = centro. */
  coverFocalX: number;
  avatarUrl: string | null;
  name: string;
  username: string | null;
  bio: string | null;
  /** Interessi (Focus) mostrati nel riquadro Bio accanto alla copertina, solo da computer. */
  interests?: string[];
  /** Card del video di presentazione, in fondo al riquadro Bio accanto alla copertina (solo computer). */
  presentationCard?: React.ReactNode;
  location: string | null;
  joinedAt: Date;
  /** null per chi non è creator: niente Trust Score né "Trusted by". */
  trust: CreatorTrust | null;
  journeysCount: number;
  followersCount: number;
  followingCount: number;
  isOwnProfile: boolean;
  /** null se questo profilo non ha un Creator (mai avuto un Update possibile). */
  activeStory: CreatorStory | null;
  /** Id di chi guarda la pagina, null per un ospite non loggato. */
  viewerId: string | null;
  isLoggedIn: boolean;
};

export function ProfileHero({
  profileUserId,
  coverUrl,
  coverFocalX,
  avatarUrl,
  name,
  username,
  bio,
  interests,
  presentationCard,
  location,
  joinedAt,
  trust,
  journeysCount,
  followersCount,
  followingCount,
  isOwnProfile,
  activeStory,
  viewerId,
  isLoggedIn,
}: ProfileHeroProps) {
  const joinedLabel = joinedAt.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <section
      className="relative isolate w-full md:mt-[calc(3.85rem+0.5cm)] md:[--profile-cover-x:calc(4.43%_-_2.5rem)] md:[--profile-cover-w:min(calc(100vw_-_340px_-_5.25rem),calc(1060px_-_5.25rem),calc(70vh*16/9))] md:[--profile-cover-h:min(calc((100vw_-_340px_-_5.25rem)*9/16),calc((1060px_-_5.25rem)*9/16),70vh)] md:[--profile-avatar-y:calc(var(--profile-cover-h)_-_17rem_+_2.4cm)]"
    >
      {/* Foto di copertina: su mobile una card con margine e angoli arrotondati (come la copertina
       * di Presentation.dc.html nel mockup — prima era un rettangolo a piena larghezza, angoli
       * vivi, molto più alto: lontano dal mockup), da desktop in su invariata (margine laterale +
       * angoli arrotondati, come prima). Occupa davvero questa altezza nel flusso della pagina:
       * quello che viene dopo non può finire sopra la foto invece che sotto.
       * Da desktop, l'altezza della copertina (--profile-cover-h) e la posizione della riga
       * avatar/nome dentro la foto (--profile-avatar-y, distanza dal bordo alto) sono due valori
       * separati e nominati: cambiare l'altezza della copertina non richiede più ricalcolare a
       * mano la risalita dell'avatar, che resta ancorata alla stessa posizione nella foto. */}
      {/* Luce ambiente come nella Hero della Home (solo da computer): copia sfocata della copertina
       * dietro a tutta la sezione, che sale sotto l'header (stesso spazio del margine della sezione). */}
      {coverUrl && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 hidden overflow-hidden max-md:top-0 max-md:block md:top-[calc(-3.85rem-0.5cm)] md:block"
          aria-hidden="true"
        >
          <div className="hero-ambient absolute inset-0 max-md:opacity-100!">
            <Image src={coverUrl} alt="" fill sizes="25vw" className="object-cover" />
          </div>
          <div className="hero-side-fade absolute inset-0 max-md:hidden" />
          <div className="cover-fade absolute inset-x-0 bottom-0 h-80" />
        </div>
      )}

      <div className="px-5 max-md:pt-20 md:px-0 md:pt-0">
        <div className="relative max-md:aspect-video aspect-4/3 overflow-hidden rounded-xl md:aspect-auto md:ml-[var(--profile-cover-x)] md:mr-0 md:w-[var(--profile-cover-w)] md:h-[var(--profile-cover-h)] md:rounded-2xl">
          <div className="absolute inset-0 -z-10">
            {coverUrl ? (
              <FadeImage
                src={coverUrl}
                alt=""
                fill
                sizes="100vw"
                quality={90}
                className="object-cover"
                preload
                // Stesso punto scelto una sola volta al caricamento (CoverFocalPicker): il
                // riquadro ha una forma diversa su telefono e computer, ma resta centrato
                // sullo stesso soggetto su entrambi invece del centro automatico della foto.
                style={{ objectPosition: `${coverFocalX * 100}% 50%` }}
              />
            ) : (
              <div className="absolute inset-0 cover-placeholder" />
            )}
            {/* Sfumatura ampia con curva "ad S" (vedi .cover-fade in globals.css): copre la parte
             * bassa della foto, dove poggia anche l'avatar che vi si sovrappone, così quell'angolo
             * si trova su uno sfondo già naturalmente scurito invece che sulla foto a piena luce. */}
            <div className="cover-fade absolute inset-x-0 bottom-0 h-24 md:h-80" />
            {/* Stesso trattamento della Hero della Home, solo da computer: grana, velo e velo laterale. */}
            <div className="hero-grain absolute inset-0 hidden md:block" aria-hidden="true" />
            <div className="hero-scrim absolute inset-0 hidden md:block" />
            <div className="hero-side-fade absolute inset-0 hidden md:block" />
          </div>
        </div>
      </div>

      {/* Riquadro Bio a destra della foto, in alto, alto quanto la foto: parte dal suo bordo destro
       * più uno spazio e si ferma al margine destro della pagina. Il video di presentazione sta
       * dentro, accanto al testo. Solo da computer. */}
      <BioPanel
        name={name}
        bio={bio}
        interests={interests}
        media={presentationCard}
        className="md:absolute md:top-0 md:right-[4.43%] md:left-[calc(var(--profile-cover-x)+var(--profile-cover-w)+1.25rem)] md:h-[var(--profile-cover-h)] md:max-w-sm md:pb-3"
      />

      {/* Risalita dell'avatar sopra il bordo della card qui sopra: su mobile la card è più corta
       * di prima (aspect-4/3, non più un rettangolo h-[22rem]), quindi la risalita è molto minore
       * — tarata sulla metà dell'avatar (h-28=112px) così si sovrappone al bordo della foto senza
       * coprirla quasi tutta. Da desktop in su invariata. */}
      <div
        className={cn(
          "relative z-10 -mt-14 sm:-mt-16 md:mt-[calc(var(--profile-avatar-y)-var(--profile-cover-h))] md:-translate-x-5",
          PAGE_WIDTH.profileCover
        )}
      >
        <div className="flex items-end gap-4">
          <ProfileAvatarStory
            avatarUrl={avatarUrl}
            name={name}
            isOwnProfile={isOwnProfile}
            activeStory={activeStory}
          />

          <div className="min-w-0 pb-1">
            <PageTitle className="truncate text-on-photo max-md:text-3xl">
              {name}
            </PageTitle>
            {username && <p className="text-sm text-on-photo-muted drop-shadow-sm max-md:text-base">@{username}</p>}
            {trust && trust.trustedByCount > 0 && (
              <p className="mt-0.5 flex items-center gap-1 text-base font-semibold text-ember drop-shadow-sm max-md:text-lg">
                <ShieldCheck className="h-4 w-4 max-md:h-5 max-md:w-5" aria-hidden="true" />
                {trust.trustedByCount.toLocaleString("en-US")} Trusty
              </p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-on-photo-muted drop-shadow-sm max-md:hidden">
              {location && (
                <span className="inline-flex items-center gap-1.5">
                  <LocationIcon className="h-3.5 w-3.5" />
                  {location}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <CalendarIcon className="h-3.5 w-3.5" />
                Joined {joinedLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-1.5 flex flex-wrap items-center justify-between gap-3 pb-4">
          <ul className={cn(PANEL_ACCENT, "profile-hero-glass grid shrink-0 grid-cols-4 gap-x-5 px-4 py-2")}>
            <ProfileTrustStat score={trust?.score ?? null} />
            <Stat label="Journeys" value={formatCompactNumber(journeysCount)} />
            <ProfileFollowStats
              profileUserId={profileUserId}
              followersCount={followersCount}
              followingCount={followingCount}
              viewerId={viewerId}
              isLoggedIn={isLoggedIn}
            />
          </ul>
        </div>
      </div>
    </section>
  );
}

function LocationIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} className={className} aria-hidden="true">
      <path d="M10 18s6-5.2 6-9.6A6 6 0 0 0 4 8.4C4 12.8 10 18 10 18Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="8.4" r="2" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} className={className} aria-hidden="true">
      <rect x="3" y="4.5" width="14" height="12" rx="2" />
      <path strokeLinecap="round" d="M3 8.5h14M7 2.5v3M13 2.5v3" />
    </svg>
  );
}
