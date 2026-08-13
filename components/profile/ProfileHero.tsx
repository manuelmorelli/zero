import Image from "next/image";
import { formatCompactNumber } from "@/lib/utils";
import { AboutCard } from "@/components/profile/AboutCard";
import { JourneyStatsCard } from "@/components/profile/JourneyStatsCard";
import { AvatarRing } from "@/components/profile/AvatarRing";

type ProfileHeroProps = {
  coverUrl: string | null;
  avatarUrl: string | null;
  name: string;
  bio: string | null;
  interests: string[];
  location: string | null;
  joinedAt: Date;
  trustScore: number;
  journeysCount: number;
  followersCount: number;
  actions?: React.ReactNode;
  stats: {
    episodesPublished: number;
    totalViews: number;
    likesReceived: number;
    completionRate: number | null;
  };
};

export function ProfileHero({
  coverUrl,
  avatarUrl,
  name,
  bio,
  interests,
  location,
  joinedAt,
  trustScore,
  journeysCount,
  followersCount,
  actions,
  stats,
}: ProfileHeroProps) {
  const joinedLabel = joinedAt.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="relative w-full bg-surface-2">
      <div className="relative h-40 w-full overflow-hidden sm:h-48 md:h-56 lg:h-80">
        {coverUrl ? (
          <Image src={coverUrl} alt="" fill sizes="100vw" className="object-cover" preload />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-surface-2 via-surface-2 to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />
        {/* La foto si spegne verso destra, dove sono sovrapposte About/Journey Stats (solo desktop):
            evita un bordo netto tra la foto e i riquadri semi-trasparenti. */}
        <div className="absolute inset-0 hidden bg-gradient-to-l from-black/85 via-black/25 to-transparent lg:block" />

        {/* About + Journey Stats, sovrapposte alla copertina in alto a destra: solo desktop, stesso
            principio già usato per il pannello Updates nella Hero della Home (su schermi stretti
            sovrapporsi al resto sarebbe illeggibile — restano nella loro posizione sotto, vedi
            app/profile/[username]/page.tsx). Dentro il riquadro della copertina (che taglia ciò che
            eccede): non deve mai scendere fino a sovrapporsi al pulsante Follow/Edit più in basso. */}
        <div className="absolute right-6 top-6 z-10 hidden w-full max-w-xs space-y-3 lg:block">
          <AboutCard name={name} bio={bio} interests={interests} transparent />
          <JourneyStatsCard {...stats} transparent />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6">
        <div className="relative -mt-20 flex flex-col gap-6 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="relative h-36 w-36 shrink-0 sm:h-40 sm:w-40">
              <div className="absolute inset-[6%] overflow-hidden rounded-full border-4 border-bg bg-surface-2">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt={name} fill sizes="160px" className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-ink-muted">
                    {name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <AvatarRing className="pointer-events-none absolute inset-0 h-full w-full text-ember" />
            </div>

            <div className="pb-1">
              <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">{name}</h1>
              {bio && <p className="mt-1.5 max-w-md break-words text-sm text-ink-muted line-clamp-2">{bio}</p>}
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-faint">
                {location && (
                  <span className="inline-flex items-center gap-1">
                    <LocationIcon className="h-3.5 w-3.5" />
                    {location}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  Joined {joinedLabel}
                </span>
              </div>
            </div>
          </div>

          {actions && <div className="flex shrink-0 items-center gap-3 pb-1">{actions}</div>}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pb-6">
          <ul className="grid shrink-0 grid-cols-3 gap-2 rounded-xl border border-border bg-surface px-3 py-2">
            <Stat label="Trust Score" value={trustScore.toString()} ember />
            <Stat label="Journeys" value={formatCompactNumber(journeysCount)} />
            <Stat label="Followers" value={formatCompactNumber(followersCount)} />
          </ul>
        </div>
      </div>
    </div>
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
