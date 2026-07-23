import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { CreatorProfileForm } from "@/components/creator/CreatorProfileForm";

export default async function NewCreatorPage() {
  const { user } = await requireSession();

  const existing = await prisma.creator.findUnique({ where: { userId: user.id } });
  if (existing) redirect("/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-sans text-xl font-extrabold tracking-tight">
          ZERO
        </Link>
        <h1 className="mt-8 text-2xl font-extrabold tracking-tight">
          Become a creator
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Create your creator profile to start sharing your Journey.
        </p>

        <CreatorProfileForm />
      </div>
    </main>
  );
}
