import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AccountDetailsForm } from "@/components/settings/AccountDetailsForm";
import { DeleteAccountSection } from "@/components/profile/DeleteAccountSection";
import { PAGE_SPACING, PAGE_WIDTH } from "@/components/ui/page-container";
import { PageTitle } from "@/components/ui/heading";

export default async function SettingsAccountPage() {
  const { user } = await requireSession();
  const account = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { name: true, username: true, bio: true, location: true },
  });

  return (
    <main>
      <div className={`${PAGE_WIDTH.narrow} ${PAGE_SPACING}`}>
        <PageTitle>Account</PageTitle>
        <p className="mt-2 text-sm text-ink-muted">Update your name, username, bio and location.</p>

        <div className="mt-8 overflow-hidden rounded-xl border border-border bg-surface">
          <div className="p-5">
            <AccountDetailsForm
              name={account.name}
              username={account.username}
              bio={account.bio}
              location={account.location}
            />
          </div>
          <DeleteAccountSection />
        </div>
      </div>
    </main>
  );
}
