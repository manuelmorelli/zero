import { requireSession } from "@/lib/session";
import { PAGE_SPACING, PAGE_WIDTH } from "@/components/ui/page-container";
import { PageTitle, SectionTitle } from "@/components/ui/heading";
import { PANEL } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";

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
      <div className={`${PAGE_WIDTH.narrow} ${PAGE_SPACING}`}>
        <PageTitle>Subscription</PageTitle>
        <p className="mt-2 text-sm text-ink-muted">
          Billing and real payments will be available once payments are connected. This is a preview of how your
          memberships will look and how you&apos;ll be able to cancel them.
        </p>

        <SectionTitle className="mt-8">Your Memberships</SectionTitle>
        <div className={`mt-3 ${PANEL}`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-ink">{exampleMembership.creatorName}</p>
              <p className="mt-0.5 text-sm text-ink-muted">
                {exampleMembership.price} · Renews on {exampleMembership.renewsOn}
              </p>
            </div>
            <Button variant="danger" disabled title="Coming soon: payments aren't connected yet">
              Cancel Membership
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
