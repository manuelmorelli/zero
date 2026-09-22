import { notFound } from "next/navigation";
import { Calendar, MapPin, Video } from "lucide-react";
import { findUserByUsernameOrId } from "@/lib/profile/findUserByUsernameOrId";
import { getImagePlaybackUrl } from "@/lib/r2";
import { FadeImage } from "@/components/common/FadeImage";

/** Bozza visiva (nessun pagamento reale): Punto 7 dell'allineamento, "Struttura pagine Creator
 * Economy". Ogni workshop/evento ha il proprio prezzo e la propria data (stesso gruppo economico
 * di Shop e Membership, 90% creator / 10% Zero, deciso al Punto 3). */
const workshops = [
  {
    icon: Video,
    title: "Getting started: the first 30 days",
    description: "A live online session walking through the exact steps to begin this Journey.",
    date: "Feb 23, 2026 · 6:00 PM",
    format: "Live online",
    price: "€15",
  },
  {
    icon: MapPin,
    title: "In-person meetup",
    description: "A small group meetup to share progress and answer questions face to face.",
    date: "Mar 8, 2026 · 10:00 AM",
    format: "In person",
    price: "€20",
  },
  {
    icon: Video,
    title: "Q&A and troubleshooting",
    description: "Bring your questions, live online, recorded for anyone who can't attend.",
    date: "Mar 15, 2026 · 7:00 PM",
    format: "Live online",
    price: "€10",
  },
];

export default async function WorkshopsPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const user = await findUserByUsernameOrId(username);
  if (!user || user.deletedAt) notFound();

  const avatarUrl = user.avatarUrl ? await getImagePlaybackUrl(user.avatarUrl) : null;

  return (
    <main>
      <div className="mx-auto w-full max-w-4xl px-5 pb-16 pt-24">
        <section className="flex items-center gap-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-surface-2">
            {avatarUrl ? (
              <FadeImage src={avatarUrl} alt={user.name} fill sizes="48px" className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-bold text-ink-muted">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold tracking-tight text-ink">{user.name}&apos;s Workshops & Events</h1>
            <p className="truncate text-sm text-ink-muted">Live sessions and meetups, booked individually.</p>
          </div>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workshops.map((workshop) => {
            const Icon = workshop.icon;
            return (
              <div key={workshop.title} className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface">
                <div className="flex aspect-video items-center justify-center border-b border-border bg-surface-2">
                  <Icon className="h-8 w-8 text-ink-faint" aria-hidden="true" />
                </div>
                <div className="flex flex-1 flex-col p-3.5">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-ink-faint">{workshop.format}</p>
                  <p className="mt-1 text-sm font-semibold leading-snug text-ink">{workshop.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-muted">{workshop.description}</p>
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-muted">
                    <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {workshop.date}
                  </p>
                  <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                    <span className="text-base font-bold text-ink">{workshop.price}</span>
                    <button
                      type="button"
                      disabled
                      title="Coming soon: payments aren't connected yet"
                      className="cursor-not-allowed rounded-full bg-surface-2 px-3.5 py-1.5 text-xs font-semibold text-ink-faint"
                    >
                      Reserve
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
