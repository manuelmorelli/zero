import { PAGE_SPACING, PAGE_WIDTH } from "@/components/ui/page-container";
import { PageTitle } from "@/components/ui/heading";
export default function PricingPage() {
  return (
    <main>
      <div className={`${PAGE_WIDTH.narrow} ${PAGE_SPACING}`}>
        <PageTitle>Pricing</PageTitle>
        <p className="mt-2 text-sm text-ink-muted">
          Coming soon. Following Journeys on Zero is free. Pricing for creators is on its way.
        </p>
      </div>
    </main>
  );
}
