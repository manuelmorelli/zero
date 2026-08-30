import Link from "next/link";
import { Header } from "@/components/layout/Header";

export default function PricingPage() {
  return (
    <main className="flex min-h-screen flex-col justify-center">
      <Header />
      <div className="mx-auto w-full max-w-2xl px-6 pb-16 pt-24">
        <h1 className="text-2xl font-extrabold tracking-tight">Pricing</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Coming soon. Following Journeys on Zero is free — pricing for creators is on its way.
        </p>

        <Link
          href="/"
          className="mt-8 inline-flex w-fit rounded-full bg-ink px-6 py-3 text-sm font-semibold text-bg transition-colors hover:bg-ink-muted"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
