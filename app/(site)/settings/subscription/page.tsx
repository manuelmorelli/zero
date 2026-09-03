import { requireSession } from "@/lib/session";

export default async function SettingsSubscriptionPage() {
  await requireSession();

  return (
    <main>
      <div className="mx-auto w-full max-w-2xl px-6 pb-16 pt-24">
        <h1 className="text-xl font-bold tracking-tight">Subscription</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Coming soon. Billing and plan management will be available once payments are connected.
        </p>
      </div>
    </main>
  );
}
