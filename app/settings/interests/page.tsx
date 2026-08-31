import { Header } from "@/components/layout/Header";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { InterestsForm } from "@/components/settings/InterestsForm";
import type { JourneyCategory } from "@/lib/constants/categories";

export default async function SettingsInterestsPage() {
  const { user } = await requireSession();
  const account = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { interests: true },
  });

  return (
    <main className="flex min-h-screen flex-col justify-center">
      <Header />
      <div className="mx-auto w-full max-w-2xl px-6 pb-16 pt-24">
        <h1 className="text-2xl font-extrabold tracking-tight">Interests</h1>
        <p className="mt-2 text-sm text-ink-muted">
          The categories you picked during onboarding — used to personalize what you see.
        </p>

        <div className="mt-8 rounded-xl border border-border bg-surface p-5">
          <InterestsForm interests={account.interests as JourneyCategory[]} />
        </div>
      </div>
    </main>
  );
}
