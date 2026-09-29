import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { reactivateAccountAction } from "@/lib/actions/account";
import { SignOutButton } from "@/components/common/SignOutButton";
import { PageTitle } from "@/components/ui/heading";
import { Button, BUTTON_VARIANTS } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
        <PageTitle>Your Account Is Scheduled for Deletion</PageTitle>
        <p className="text-sm text-ink-muted">
          You asked to delete your account. It will be permanently deleted on{" "}
          <span className="font-medium text-ink">{deletionDate}</span>, along with your Journeys,
          Episodes, Updates and conversations. Until then, you can reactivate it and keep everything as
          it was.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <form action={reactivateAccountAction}>
          <Button variant="primary" type="submit">
            Reactivate My Account
          </Button>
        </form>
        <SignOutButton className={cn(BUTTON_VARIANTS.secondary, "border-border bg-transparent shadow-none hover:border-ink-muted")} />
      </div>
    </main>
  );
}
