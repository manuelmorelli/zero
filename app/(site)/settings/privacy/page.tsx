import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { listBlockedUsers } from "@/lib/actions/block";
import { PrivacyForm } from "@/components/settings/PrivacyForm";
import { BlockedUsersList } from "@/components/settings/BlockedUsersList";
import { PAGE_SPACING, PAGE_WIDTH } from "@/components/ui/page-container";
import { PageTitle, SectionTitle } from "@/components/ui/heading";
import { PANEL } from "@/components/ui/panel";

export default async function SettingsPrivacyPage() {
  const { user } = await requireSession();
  const [{ isPrivate }, blockedUsers] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: { isPrivate: true } }),
    listBlockedUsers(),
  ]);

  return (
    <main>
      <div className={`${PAGE_WIDTH.narrow} ${PAGE_SPACING}`}>
        <PageTitle>Privacy</PageTitle>
        <p className="mt-2 text-sm text-ink-muted">Control who can see your profile and reach you.</p>

        <div className={`mt-8 ${PANEL}`}>
          <PrivacyForm isPrivate={isPrivate} />
        </div>

        <SectionTitle className="mt-10">Blocked users</SectionTitle>
        <p className="mt-1 text-sm text-ink-muted">
          Blocking stops you from following each other and from messaging each other, and hides
          your profiles from one another.
        </p>
        <div className="mt-4">
          <BlockedUsersList users={blockedUsers} />
        </div>
      </div>
    </main>
  );
}
