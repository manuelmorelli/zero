import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { NotificationsForm } from "@/components/settings/NotificationsForm";

export default async function SettingsNotificationsPage() {
  const { user } = await requireSession();
  const preferences = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { notifyNewEpisode: true, notifyNewJourney: true, notifyQuestionAnswered: true },
  });

  return (
    <main className="flex min-h-screen flex-col justify-center">
      <div className="mx-auto w-full max-w-2xl px-6 pb-16 pt-24">
        <h1 className="text-2xl font-extrabold tracking-tight">Notifications</h1>
        <p className="mt-2 text-sm text-ink-muted">Choose which notifications you want to receive.</p>

        <div className="mt-8 rounded-xl border border-border bg-surface p-5">
          <NotificationsForm
            notifyNewEpisode={preferences.notifyNewEpisode}
            notifyNewJourney={preferences.notifyNewJourney}
            notifyQuestionAnswered={preferences.notifyQuestionAnswered}
          />
        </div>
      </div>
    </main>
  );
}
