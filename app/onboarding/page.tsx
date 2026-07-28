import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";

export default async function OnboardingPage() {
  const { user } = await requireSession();

  const current = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { interests: true },
  });
  if (current.interests.length > 0) redirect("/");

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-2xl">
        <Link href="/" className="font-sans text-xl font-extrabold tracking-tight">
          ZERO
        </Link>
        <h1 className="mt-8 text-2xl font-extrabold tracking-tight">
          What are you into?
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Pick a few interests so we can show you Journeys worth following.
        </p>

        <div className="mt-8">
          <OnboardingForm />
        </div>
      </div>
    </main>
  );
}
