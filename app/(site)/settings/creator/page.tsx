import Link from "next/link";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { CreatorNotificationsForm } from "@/components/settings/CreatorNotificationsForm";

export default async function SettingsCreatorPage() {
  const { user } = await requireSession();
  const preferences = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { notifyNewFollower: true },
  });

  return (
    <main>
      <div className="mx-auto w-full max-w-2xl px-6 pb-16 pt-24">
        <h1 className="text-xl font-bold tracking-tight">Creator</h1>
        <p className="mt-2 text-sm text-ink-muted">Notifications and tools for what you publish on Zero.</p>

        <h2 className="mt-8 text-sm font-semibold text-ink-muted">Notifications</h2>
        <div className="mt-3 rounded-xl border border-border bg-surface p-5">
          <CreatorNotificationsForm notifyNewFollower={preferences.notifyNewFollower} />
        </div>

        <h2 className="mt-8 text-sm font-semibold text-ink-muted">Dashboard</h2>
        <Link
          href="/dashboard"
          className="mt-3 flex items-center justify-between gap-4 rounded-xl border border-border bg-surface px-5 py-4 transition-colors hover:bg-surface-2"
        >
          <span>
            <span className="block text-sm font-semibold text-ink">Manage your Journeys</span>
            <span className="block text-xs text-ink-muted">Publish, edit and track your content.</span>
          </span>
          <ChevronIcon className="h-4 w-4 shrink-0 text-ink-faint" />
        </Link>

        <h2 className="mt-8 text-sm font-semibold text-ink-muted">Payouts</h2>
        <p className="mt-3 rounded-xl border border-border bg-surface p-5 text-sm text-ink-muted">
          Coming soon. Payment details will be available once payments are connected.
        </p>
      </div>
    </main>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} className={className} aria-hidden="true">
      <path d="M7.5 4.5 13 10l-5.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
