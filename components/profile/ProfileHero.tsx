import { FadeImage } from "@/components/common/FadeImage";
import { cn, formatCompactNumber } from "@/lib/utils";
import { ProfileAvatarStory } from "@/components/profile/ProfileAvatarStory";
import { ProfileFollowStats } from "@/components/profile/ProfileFollowStats";
import { ProfileTrustStat } from "@/components/profile/ProfileTrustStat";
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
  avatarUrl: string | null;
  name: string;
  username: string | null;
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
  actions?: React.ReactNode;
};

export function ProfileHero({
  profileUserId,
  coverUrl,
  avatarUrl,
  name,
  username,
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
  actions,
}: ProfileHeroProps) {
  const joinedLabel = joinedAt.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <section className="relative isolate w-full md:mt-[calc(3.85rem+0.5cm)]">
      {/* Foto di copertina: piena larghezza su mobile, come una card (angoli arrotondati +
       * margine laterale) da desktop in su — stesso trattamento della foto in Hero della Home.
       * Occupa davvero questa altezza nel flusso della pagina (non più fuori flusso con un
       * riempimento a mano sotto, misura che si disallineava ogni volta che il blocco sotto era
       * più basso del previsto, es. su schermi stretti): quello che viene dopo non può più finire
       * sopra la foto invece che sotto, qualunque cosa succeda al contenuto sotto. */}
      <div className="relative h-[22rem] overflow-hidden sm:h-[26rem] md:mx-[4.43%] md:h-[29rem] md:rounded-2xl">
        <div className="absolute inset-0 -z-10">
          {coverUrl ? (
            <FadeImage src={coverUrl} alt="" fill sizes="100vw" quality={90} className="object-cover" preload />
          ) : (
            <div className="absolute inset-0 cover-placeholder" />
          )}
          {/* Sfumatura ampia con curva "ad S" (vedi .cover-fade in globals.css): copre la parte
           * bassa della foto, dove poggiano anche le statistiche e i bottoni, così quegli elementi
           * si trovano su uno sfondo già naturalmente scurito invece che sulla foto a piena luce —
           * meno contrasto netto, transizione morbida verso la barra Overview/Journeys sotto. */}
          <div className="cover-fade absolute inset-x-0 bottom-0 h-32 sm:h-40 md:h-48" />
        </div>
      </div>

      {/* Stesso spostamento verso l'alto di prima (foto meno il margine da cima a dove inizia il
       * nome), solo calcolato come risalita da sotto invece che riempimento da sopra: il risultato
       * visivo è identico, ma ora la foto sopra ha sempre la sua altezza garantita. */}
      <div
        className={cn(
          "relative z-10 -mt-[calc(14.5rem-0.9cm)] sm:-mt-[calc(15rem-0.9cm)] md:-mt-[calc(17rem-0.9cm)]",
          PAGE_WIDTH.wideCover
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
            <PageTitle className="truncate text-on-photo">
              {name}
            </PageTitle>
            {username && <p className="text-sm text-on-photo-muted drop-shadow-sm">@{username}</p>}
            {trust && trust.trustedByCount > 0 && (
              <p className="mt-0.5 text-sm font-semibold text-on-photo drop-shadow-sm">
                {trust.trustedByCount.toLocaleString("en-US")} Trusty
              </p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-on-photo-muted drop-shadow-sm">
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

          {actions && <div className="mt-[0.5cm] flex shrink-0 items-center gap-2.5">{actions}</div>}
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
