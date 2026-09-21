import { FadeImage } from "@/components/common/FadeImage";
import { formatCompactNumber } from "@/lib/utils";
import { ProfileAvatarStory } from "@/components/profile/ProfileAvatarStory";
import { ProfileFollowStats } from "@/components/profile/ProfileFollowStats";
import { ProfileTrustStat } from "@/components/profile/ProfileTrustStat";
import { Stat } from "@/components/profile/ProfileStat";
import type { CreatorStory } from "@/lib/discovery/stories";

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
  trustScore: number | null;
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
  trustScore,
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
    <section className="relative isolate w-full">
      <div className="absolute inset-x-0 top-0 -z-10 h-[22rem] overflow-hidden sm:h-[26rem] md:h-[29rem]">
        {coverUrl ? (
          <FadeImage src={coverUrl} alt="" fill sizes="100vw" quality={90} className="object-cover" preload />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-surface-2 via-surface-2 to-black" />
        )}
        {/* Sfumatura ampia con curva "ad S" (vedi .cover-fade in globals.css): copre la parte
         * bassa della foto, dove poggiano anche le statistiche e i bottoni, così quegli elementi
         * si trovano su uno sfondo già naturalmente scurito invece che sulla foto a piena luce —
         * meno contrasto netto, transizione morbida verso la barra Overview/Journeys sotto. */}
        <div className="cover-fade absolute inset-x-0 bottom-0 h-32 sm:h-40 md:h-48" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-5 md:px-8">
        <div className="pt-[calc(7.5rem+0.9cm)] sm:pt-[calc(11rem+0.9cm)] md:pt-[calc(12rem+0.9cm)]">
          <div className="flex items-end gap-4">
            <ProfileAvatarStory
              avatarUrl={avatarUrl}
              name={name}
              isOwnProfile={isOwnProfile}
              activeStory={activeStory}
            />

            <div className="min-w-0 pb-1">
              <h1 className="truncate text-2xl font-extrabold tracking-tight text-ink drop-shadow-sm sm:text-3xl">
                {name}
              </h1>
              {username && <p className="text-sm text-ink-muted drop-shadow-sm">@{username}</p>}
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted drop-shadow-sm">
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
        </div>

        <div className="mt-1.5 flex flex-wrap items-center justify-between gap-3 pb-4">
          <ul className="grid shrink-0 grid-cols-4 gap-2 rounded-xl border border-ember/20 bg-gradient-to-b from-ember/8 to-white/[0.02] px-3 py-2 backdrop-blur-md">
            <ProfileTrustStat score={trustScore} />
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
