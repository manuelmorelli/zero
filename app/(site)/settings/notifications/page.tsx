import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { NotificationsForm } from "@/components/settings/NotificationsForm";
import { PAGE_SPACING, PAGE_WIDTH } from "@/components/ui/page-container";
import { PageTitle } from "@/components/ui/heading";
import { PANEL } from "@/components/ui/panel";

export default async function SettingsNotificationsPage() {
  const { user } = await requireSession();
  const preferences = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: {
      notifyNewEpisode: true,
      notifyNewJourney: true,
      notifyQuestionAnswered: true,
      notifyNewOffering: true,
    },
  });

  return (
    <main>
      <div className={`${PAGE_WIDTH.narrow} ${PAGE_SPACING}`}>
        <PageTitle>Notifications</PageTitle>
        <p className="mt-2 text-sm text-ink-muted">Choose which notifications you want to receive.</p>

        <div className={`mt-8 ${PANEL}`}>
          <NotificationsForm
            notifyNewEpisode={preferences.notifyNewEpisode}
            notifyNewJourney={preferences.notifyNewJourney}
            notifyQuestionAnswered={preferences.notifyQuestionAnswered}
            notifyNewOffering={preferences.notifyNewOffering}
          />
        </div>
      </div>
    </main>
  );
}
