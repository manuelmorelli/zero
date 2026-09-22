import { notFound } from "next/navigation";
import { MessageCircle, Phone, Video } from "lucide-react";
import { findUserByUsernameOrId } from "@/lib/profile/findUserByUsernameOrId";
import { getImagePlaybackUrl } from "@/lib/r2";
import { FadeImage } from "@/components/common/FadeImage";

/** Bozza visiva (nessun pagamento reale): Punto 7 dell'allineamento, "Struttura pagine Creator
 * Economy". Chiamate 1:1 vendute singolarmente per durata/formato (stesso gruppo economico di
 * Shop e Membership, 90% creator / 10% Zero, deciso al Punto 3). */
const sessions = [
  {
    icon: MessageCircle,
    title: "Quick question",
    description: "A short call to get unstuck on one specific question.",
    duration: "15 min",
    price: "€10",
  },
  {
    icon: Video,
    title: "1:1 video call",
    description: "A focused video session to talk through your situation in depth.",
    duration: "30 min",
    price: "€35",
  },
  {
    icon: Phone,
    title: "Deep dive session",
    description: "Extended time to go through a full plan, step by step.",
    duration: "60 min",
    price: "€60",
  },
];

export default async function ConsultingPage({ params }: { params: Promise<{ username: string }> }) {
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
            <h1 className="truncate text-lg font-bold tracking-tight text-ink">1:1 Consulting with {user.name.split(" ")[0]}</h1>
            <p className="truncate text-sm text-ink-muted">Book a call, sold individually by duration.</p>
          </div>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => {
            const Icon = session.icon;
            return (
              <div key={session.title} className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface">
                <div className="flex aspect-video items-center justify-center border-b border-border bg-surface-2">
                  <Icon className="h-8 w-8 text-ink-faint" aria-hidden="true" />
                </div>
                <div className="flex flex-1 flex-col p-3.5">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-ink-faint">{session.duration}</p>
                  <p className="mt-1 text-sm font-semibold leading-snug text-ink">{session.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-muted">{session.description}</p>
                  <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                    <span className="text-base font-bold text-ink">{session.price}</span>
                    <button
                      type="button"
                      disabled
                      title="Coming soon: payments aren't connected yet"
                      className="cursor-not-allowed rounded-full bg-surface-2 px-3.5 py-1.5 text-xs font-semibold text-ink-faint"
                    >
                      Book a call
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
