import Link from "next/link";

export default function PricingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16">
      <Link href="/" className="font-sans text-xl font-extrabold tracking-tight">
        ZERO
      </Link>

      <h1 className="mt-8 text-2xl font-extrabold tracking-tight">Pricing</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Coming soon. Following Journeys on Zero is free — pricing for creators is on its way.
      </p>

      <Link
        href="/"
        className="mt-8 inline-flex w-fit rounded-full bg-ink px-6 py-3 text-sm font-semibold text-bg transition-colors hover:bg-ink-muted"
      >
        Back to Home
      </Link>
    </main>
  );
}
