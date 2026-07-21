import Link from "next/link";
import { requireCreator } from "@/lib/creator";
import { JourneyForm } from "@/components/creator/JourneyForm";

export default async function NewJourneyPage() {
  await requireCreator();

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg">
        <Link href="/creator" className="font-sans text-xl font-extrabold tracking-tight">
          ZERO
        </Link>
        <h1 className="mt-8 text-2xl font-extrabold tracking-tight">
          Crea il tuo Journey
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Racconta il percorso che stai per documentare. Potrai aggiungere Capitoli ed Episodi subito dopo.
        </p>

        <JourneyForm />
      </div>
    </main>
  );
}
