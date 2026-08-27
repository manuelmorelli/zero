import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { reactivateAccountAction } from "@/lib/actions/account";
import { SignOutButton } from "@/components/common/SignOutButton";

/** Non usa requireSession(): un account in cancellazione viene mandato proprio qui da
 * requireSession(), quindi questa pagina deve poter essere raggiunta senza rimbalzare via. */
export default async function ReactivateAccountPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { deletedAt: true, scheduledDeletionAt: true },
  });
  if (!user?.deletedAt) redirect("/");

  const deletionDate = user.scheduledDeletionAt?.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-bg px-6 text-center">
      <div className="max-w-md space-y-3">
        <h1 className="text-xl font-semibold text-ink">Your account is scheduled for deletion</h1>
        <p className="text-sm text-ink-muted">
          You asked to delete your account. It will be permanently deleted on{" "}
          <span className="font-medium text-ink">{deletionDate}</span>, along with your Journeys,
          Episodes, Updates and conversations. Until then, you can reactivate it and keep everything as
          it was.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <form action={reactivateAccountAction}>
          <button
            type="submit"
            className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-bg transition-colors hover:bg-ink-muted"
          >
            Reactivate my account
          </button>
        </form>
        <SignOutButton className="rounded-full border border-border px-6 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink-muted" />
      </div>
    </main>
  );
}
