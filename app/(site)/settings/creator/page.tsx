import Link from "next/link";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { CreatorNotificationsForm } from "@/components/settings/CreatorNotificationsForm";
import { CreatorModeSwitch } from "@/components/settings/CreatorModeSwitch";
import { CreatorPauseSwitch } from "@/components/settings/CreatorPauseSwitch";
import { VoiceDubbingSwitch } from "@/components/settings/VoiceDubbingSwitch";
import { SupportLinkForm } from "@/components/settings/SupportLinkForm";
import { countJourneysToHide } from "@/lib/account/creatorLifecycle";
import { PAGE_SPACING, PAGE_WIDTH } from "@/components/ui/page-container";
import { PageTitle, SectionTitle } from "@/components/ui/heading";
import { NOTICE, PANEL } from "@/components/ui/panel";
import { cn } from "@/lib/utils";

export default async function SettingsCreatorPage() {
  const { user } = await requireSession();
  const preferences = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: {
      notifyNewFollower: true,
      creatorMode: true,
      creator: { select: { pausedAt: true, supportLinkUrl: true, allowsVoiceDubbing: true } },
    },
  });
  const journeyCount = await countJourneysToHide(user.id);

  return (
    <main>
      <div className={`${PAGE_WIDTH.narrow} ${PAGE_SPACING}`}>
        <PageTitle>Creator</PageTitle>
        <p className="mt-2 text-sm text-ink-muted">Notifications and tools for what you publish on Zero.</p>

        <SectionTitle className="mt-8">Account type</SectionTitle>
        <div className="mt-3 space-y-3">
          <CreatorModeSwitch creatorMode={preferences.creatorMode} journeyCount={journeyCount} />
          {preferences.creatorMode && <CreatorPauseSwitch paused={preferences.creator?.pausedAt != null} />}
        </div>
        <Link href="/creator" className="mt-3 inline-block text-sm text-ink-muted underline underline-offset-4">
          How Creator mode works
        </Link>

        <SectionTitle className="mt-8">Notifications</SectionTitle>
        <div className={`mt-3 ${PANEL}`}>
          <CreatorNotificationsForm notifyNewFollower={preferences.notifyNewFollower} />
        </div>

        <SectionTitle className="mt-8">Dashboard</SectionTitle>
        <Link
          href="/dashboard"
          className={cn(PANEL, "mt-3 flex items-center justify-between gap-4 shadow-card transition-[border-color,box-shadow] duration-300 hover:border-ember-line hover:shadow-glow")}
        >
          <span>
            <span className="block text-sm font-semibold text-ink">Manage Your Journeys</span>
            <span className="block text-sm text-ink-muted">Publish, edit and track your content.</span>
          </span>
          <ChevronIcon className="h-4 w-4 shrink-0 text-ink-faint" />
        </Link>

        {preferences.creatorMode && (
          <>
            <SectionTitle className="mt-8">Support link</SectionTitle>
            <div className={`mt-3 ${PANEL}`}>
              <SupportLinkForm supportLinkUrl={preferences.creator?.supportLinkUrl ?? null} />
            </div>

            <SectionTitle className="mt-8">Voice dubbing</SectionTitle>
            <div className="mt-3">
              <VoiceDubbingSwitch allowed={preferences.creator?.allowsVoiceDubbing ?? false} />
            </div>
          </>
        )}

        <SectionTitle className="mt-8">Payouts</SectionTitle>
        <p className={`mt-3 ${NOTICE}`}>
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
