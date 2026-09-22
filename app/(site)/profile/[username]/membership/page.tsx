import { notFound } from "next/navigation";
import { Check, FileText, Lock, Map, Play } from "lucide-react";
import { findUserByUsernameOrId } from "@/lib/profile/findUserByUsernameOrId";
import { getImagePlaybackUrl } from "@/lib/r2";
import { FadeImage } from "@/components/common/FadeImage";

/** Bozza visiva (nessun pagamento reale): Punto 7 dell'allineamento, "Struttura pagine Creator
 * Economy". Un solo livello di abbonamento mensile per l'intero profilo del creator (non per
 * singolo Journey, deciso con Manuel il 2026-09-22), che sbloccherebbe materiale pratico extra
 * (video, documenti, mappe) slegato da Journey/Episodi/Update, che restano sempre gratis. */
const MONTHLY_PRICE = "€9";

const benefits = [
  "Exclusive video episodes, published only for members",
  "Downloadable documents and PDF worksheets",
  "Practical maps and step-by-step guides",
  "A member badge next to your name everywhere on Zero",
];

const insideItems = [
  { kind: "video" as const, title: "Extended behind-the-scenes cut", meta: "Video · Members only" },
  { kind: "document" as const, title: "The recovery worksheet", meta: "PDF · Members only" },
  { kind: "map" as const, title: "Route map and guide", meta: "Guide · Members only" },
];

export default async function MembershipPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const user = await findUserByUsernameOrId(username);
  if (!user || user.deletedAt) notFound();

  const avatarUrl = user.avatarUrl ? await getImagePlaybackUrl(user.avatarUrl) : null;

  return (
    <main>
      <div className="mx-auto w-full max-w-3xl px-5 pb-16 pt-24">
        <section className="rounded-2xl border border-ember/20 bg-gradient-to-b from-ember/8 to-white/[0.02] p-6 backdrop-blur-md sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
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
                  <h1 className="truncate text-lg font-bold tracking-tight text-ink">{user.name}</h1>
                  <p className="truncate text-sm text-ink-muted">@{user.username ?? username}</p>
                </div>
              </div>

              <p className="mt-5 max-w-[48ch] text-sm leading-relaxed text-ink-muted">
                Support {user.name.split(" ")[0]} and unlock extra material published only for members: bonus
                videos, downloadable documents and practical guides.
              </p>

              <ul className="mt-5 space-y-2.5">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-2.5 text-sm text-ink">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-ember" aria-hidden="true" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex shrink-0 flex-col items-start gap-3 sm:w-48 sm:items-stretch">
              <div>
                <p className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold tracking-tight text-ink">{MONTHLY_PRICE}</span>
                  <span className="text-sm text-ink-muted">/month</span>
                </p>
                <p className="mt-1 text-xs text-ink-muted">Cancel anytime.</p>
              </div>
              <button
                type="button"
                disabled
                title="Coming soon: payments aren't connected yet"
                className="cursor-not-allowed rounded-full bg-surface-2 px-5 py-2.5 text-sm font-semibold text-ink-faint"
              >
                Subscribe — Coming soon
              </button>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-base font-bold tracking-tight text-ink">What&apos;s inside</h2>
          <p className="mt-1 text-sm text-ink-muted">A preview of what members unlock.</p>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {insideItems.map((item) => (
              <div key={item.title} className="overflow-hidden rounded-xl border border-border bg-surface">
                <div className="relative flex aspect-video items-center justify-center border-b border-border bg-surface-2">
                  {item.kind === "video" && <Play className="h-8 w-8 text-ink-faint" aria-hidden="true" />}
                  {item.kind === "document" && <FileText className="h-8 w-8 text-ink-faint" aria-hidden="true" />}
                  {item.kind === "map" && <Map className="h-8 w-8 text-ink-faint" aria-hidden="true" />}
                  <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-ink-muted">
                    <Lock className="h-3 w-3" aria-hidden="true" />
                    Locked
                  </span>
                </div>
                <div className="p-3.5">
                  <p className="truncate text-sm font-semibold text-ink">{item.title}</p>
                  <p className="mt-0.5 text-xs text-ink-muted">{item.meta}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
