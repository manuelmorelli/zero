import { Header } from "@/components/layout/Header";
import { BackLink } from "@/components/common/BackLink";

export default function PricingPage() {
  return (
    <main className="flex min-h-screen flex-col justify-center">
      <Header />
      <div className="mx-auto w-full max-w-2xl px-6 pb-16 pt-24">
        <h1 className="text-2xl font-extrabold tracking-tight">Pricing</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Coming soon. Following Journeys on Zero is free — pricing for creators is on its way.
        </p>

        <div className="mt-8">
          <BackLink href="/" label="Back to Home" />
        </div>
      </div>
    </main>
  );
}
