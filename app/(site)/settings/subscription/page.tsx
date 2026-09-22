import { requireSession } from "@/lib/session";

/** Bozza visiva (Punto 7 dell'allineamento, "Struttura pagine Creator Economy"): nessun
 * abbonamento reale esiste ancora (Stripe non è collegato), un solo esempio fisso serve a
 * vedere come apparirebbe la gestione/cancellazione una volta costruita per davvero. */
const exampleMembership = {
  creatorName: "Marco Rinaldi",
  price: "€9/month",
  renewsOn: "October 22, 2026",
};

export default async function SettingsSubscriptionPage() {
  await requireSession();

  return (
    <main>
      <div className="mx-auto w-full max-w-2xl px-6 pb-16 pt-24">
        <h1 className="text-xl font-bold tracking-tight">Subscription</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Billing and real payments will be available once payments are connected. This is a preview of how your
          memberships will look and how you&apos;ll be able to cancel them.
        </p>

        <h2 className="mt-8 text-sm font-semibold text-ink-muted">Your memberships</h2>
        <div className="mt-3 rounded-xl border border-border bg-surface p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-ink">{exampleMembership.creatorName}</p>
              <p className="mt-0.5 text-xs text-ink-muted">
                {exampleMembership.price} · Renews on {exampleMembership.renewsOn}
              </p>
            </div>
            <button
              type="button"
              disabled
              title="Coming soon: payments aren't connected yet"
              className="cursor-not-allowed rounded-full border border-danger/30 bg-danger/10 px-4 py-2 text-xs font-semibold text-danger/70"
            >
              Cancel membership
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
