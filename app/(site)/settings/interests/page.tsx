import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { InterestsForm } from "@/components/settings/InterestsForm";
import type { JourneyCategory } from "@/lib/constants/categories";
import { PAGE_SPACING, PAGE_WIDTH } from "@/components/ui/page-container";
import { PageTitle } from "@/components/ui/heading";
import { PANEL } from "@/components/ui/panel";

export default async function SettingsInterestsPage() {
  const { user } = await requireSession();
  const account = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { interests: true },
  });

  return (
    <main>
      <div className={`${PAGE_WIDTH.narrow} ${PAGE_SPACING}`}>
        <PageTitle>Interests</PageTitle>
        <p className="mt-2 text-sm text-ink-muted">
          The categories you picked during onboarding, used to personalize what you see.
        </p>

        <div className={`mt-8 ${PANEL}`}>
          <InterestsForm interests={account.interests as JourneyCategory[]} />
        </div>
      </div>
    </main>
  );
}
