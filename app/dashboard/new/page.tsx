import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { CreatorProfileForm } from "@/components/creator/CreatorProfileForm";
import { Header } from "@/components/layout/Header";

export default async function NewCreatorPage() {
  const { user } = await requireSession();

  const existing = await prisma.creator.findUnique({ where: { userId: user.id } });
  if (existing) redirect("/dashboard");

  return (
    <main>
      <Header />
      <div className="flex min-h-screen items-center justify-center px-6 pb-16 pt-24">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-extrabold tracking-tight">
            Become a creator
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            Create your creator profile to start sharing your Journey.
          </p>

          <CreatorProfileForm />
        </div>
      </div>
    </main>
  );
}
