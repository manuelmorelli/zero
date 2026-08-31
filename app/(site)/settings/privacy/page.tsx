import { requireSession } from "@/lib/session";

export default async function SettingsPrivacyPage() {
  await requireSession();

  return (
    <main className="flex min-h-screen flex-col justify-center">
      <div className="mx-auto w-full max-w-2xl px-6 pb-16 pt-24">
        <h1 className="text-2xl font-extrabold tracking-tight">Privacy</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Coming soon. Controls like a private account and blocked users will live here.
        </p>
      </div>
    </main>
  );
}
