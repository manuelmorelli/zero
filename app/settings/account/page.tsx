import { Header } from "@/components/layout/Header";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AccountDetailsForm } from "@/components/settings/AccountDetailsForm";
import { DeleteAccountSection } from "@/components/profile/DeleteAccountSection";

export default async function SettingsAccountPage() {
  const { user } = await requireSession();
  const account = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { name: true, username: true, bio: true, location: true },
  });

  return (
    <main className="flex min-h-screen flex-col justify-center">
      <Header />
      <div className="mx-auto w-full max-w-2xl px-6 pb-16 pt-24">
        <h1 className="text-2xl font-extrabold tracking-tight">Account</h1>
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
