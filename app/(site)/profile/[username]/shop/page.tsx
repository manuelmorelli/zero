import { notFound } from "next/navigation";
import { ClipboardList, Download, FileText, Map } from "lucide-react";
import { findUserByUsernameOrId } from "@/lib/profile/findUserByUsernameOrId";
import { getImagePlaybackUrl } from "@/lib/r2";
import { FadeImage } from "@/components/common/FadeImage";

/** Bozza visiva (nessun pagamento reale): Punto 7 dell'allineamento, "Struttura pagine Creator
 * Economy". Prodotti digitali venduti singolarmente dal creator (non in un unico pacchetto,
 * deciso con Manuel il 2026-09-22): ognuno ha il proprio prezzo. */
const products = [
  {
    icon: FileText,
    title: "The recovery guide",
    description: "A practical PDF with the exact exercises used in this Journey.",
    price: "€12",
    kind: "PDF guide",
  },
  {
    icon: ClipboardList,
    title: "Weekly reset template",
    description: "A ready-to-use printable template to plan and track your week.",
    price: "€7",
    kind: "Template",
  },
  {
    icon: Map,
    title: "Route map and guide",
    description: "The exact routes and timing, mapped out for you to follow.",
    price: "€5",
    kind: "Map",
  },
  {
    icon: Download,
    title: "90-day checklist",
    description: "A step-by-step printable checklist to keep momentum.",
    price: "€4",
    kind: "Checklist",
  },
];

export default async function ShopPage({ params }: { params: Promise<{ username: string }> }) {
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
            <h1 className="truncate text-lg font-bold tracking-tight text-ink">{user.name}&apos;s Shop</h1>
            <p className="truncate text-sm text-ink-muted">Digital products, sold individually.</p>
          </div>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => {
            const Icon = product.icon;
            return (
              <div key={product.title} className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface">
                <div className="flex aspect-video items-center justify-center border-b border-border bg-surface-2">
                  <Icon className="h-8 w-8 text-ink-faint" aria-hidden="true" />
                </div>
                <div className="flex flex-1 flex-col p-3.5">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-ink-faint">{product.kind}</p>
                  <p className="mt-1 text-sm font-semibold leading-snug text-ink">{product.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-muted">{product.description}</p>
                  <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                    <span className="text-base font-bold text-ink">{product.price}</span>
                    <button
                      type="button"
                      disabled
                      title="Coming soon: payments aren't connected yet"
                      className="cursor-not-allowed rounded-full bg-surface-2 px-3.5 py-1.5 text-xs font-semibold text-ink-faint"
                    >
                      Buy
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
