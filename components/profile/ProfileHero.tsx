import Image from "next/image";
import { formatCompactNumber } from "@/lib/utils";
import { ProfileAvatarStory } from "@/components/profile/ProfileAvatarStory";
import type { CreatorStory } from "@/lib/discovery/stories";

/** Vignetta: la foto stessa sfuma nel trasparente su tutti i lati (più generosa in basso), via
 * mask-image — nessun overlay colorato sopra, sotto la foto si vede semplicemente lo sfondo. */
const COVER_FADE_MASK = {
  maskImage:
    "linear-gradient(to bottom, transparent 0%, black 4%, black 87%, transparent 100%), linear-gradient(to right, transparent 0%, black 3%, black 97%, transparent 100%)",
  WebkitMaskImage:
    "linear-gradient(to bottom, transparent 0%, black 4%, black 87%, transparent 100%), linear-gradient(to right, transparent 0%, black 3%, black 97%, transparent 100%)",
  maskComposite: "intersect",
} as const;

type ProfileHeroProps = {
  coverUrl: string | null;
  avatarUrl: string | null;
  name: string;
  username: string | null;
  location: string | null;
  joinedAt: Date;
  trustScore: number;
  journeysCount: number;
  followersCount: number;
  followingCount: number;
  isOwnProfile: boolean;
  /** null se questo profilo non ha un Creator (mai avuto un Update possibile). */
  activeStory: CreatorStory | null;
  actions?: React.ReactNode;
};

export function ProfileHero({
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
  actions,
}: ProfileHeroProps) {
  const joinedLabel = joinedAt.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <section className="relative isolate w-full">
      <div
        className="absolute inset-x-0 top-0 -z-10 h-56 overflow-hidden sm:h-72 md:h-80"
        style={COVER_FADE_MASK}
      >
        {coverUrl ? (
          <Image src={coverUrl} alt="" fill sizes="100vw" className="object-cover" preload />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-surface-2 via-surface-2 to-black" />
        )}
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-5 md:px-8">
        <div className="pt-[7.5rem] sm:pt-[11rem] md:pt-[12rem]">
          <div className="flex items-end gap-4">
            <ProfileAvatarStory
              avatarUrl={avatarUrl}
              name={name}
              isOwnProfile={isOwnProfile}
              activeStory={activeStory}
            />

            <div className="min-w-0 pb-1">
              <h1 className="truncate text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
                {name}
              </h1>
              {username && <p className="text-sm text-ink-muted">@{username}</p>}
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
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

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 pb-4">
          <ul className="grid shrink-0 grid-cols-4 gap-2 rounded-xl border border-border bg-white/[0.02] px-3 py-2">
            <Stat label="Trust Score" value={trustScore.toString()} ember />
            <Stat label="Journeys" value={formatCompactNumber(journeysCount)} />
            <Stat label="Followers" value={formatCompactNumber(followersCount)} />
            <Stat label="Following" value={formatCompactNumber(followingCount)} />
          </ul>

          {actions && <div className="flex shrink-0 items-center gap-2.5">{actions}</div>}
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, ember }: { label: string; value: string; ember?: boolean }) {
  return (
    <li className="text-center">
      <p className={`text-sm font-bold tracking-tight md:text-base ${ember ? "text-ember" : "text-ink"}`}>
        {value}
      </p>
      <p className="text-[0.6rem] font-medium uppercase tracking-wider text-ink-faint">{label}</p>
    </li>
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
