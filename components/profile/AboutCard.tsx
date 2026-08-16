import { PenLine } from "lucide-react";

type AboutCardProps = {
  name: string;
  bio: string | null;
  /** Interessi reali dichiarati dalla persona (User.interests, stessa lista di lib/constants/categories.ts). */
  interests?: string[];
};

// Volutamente nessun link a social esterni (Instagram/YouTube/X): il traffico resta sulla
// piattaforma, decisione di prodotto esplicita per questa card.
export function AboutCard({ name, bio, interests }: AboutCardProps) {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-border bg-white/[0.02] p-5">
      <div>
        <h2 className="inline-flex items-center gap-1.5 text-sm font-semibold text-ember">
          <PenLine className="h-3.5 w-3.5" aria-hidden="true" />
          Bio
        </h2>
        {bio ? (
          <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-relaxed text-ink/85">{bio}</p>
        ) : (
          <p className="mt-4 text-sm text-ink-faint">{name} hasn&apos;t written a bio yet.</p>
        )}
      </div>
      {interests && interests.length > 0 && (
        <div className="mt-4">
          <p className="text-[0.65rem] uppercase tracking-wider text-ink-faint">Focus</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {interests.map((interest) => (
              <span
                key={interest}
                className="rounded-full border border-border px-2.5 py-1 text-[0.7rem] text-ink-muted"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
