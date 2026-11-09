import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { SignOutButton } from "@/components/common/SignOutButton";
import { PageTitle } from "@/components/ui/heading";
import { BUTTON_VARIANTS } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CONTACT_EMAIL = "team.zero@gmail.com";

/** Non usa requireSession(): un account bannato viene mandato proprio qui da requireSession(),
 * quindi questa pagina deve poter essere raggiunta senza rimbalzare via. */
export default async function AccountSuspendedPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { status: true },
  });
  if (!user || user.status === "ACTIVE") redirect("/");

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-bg px-6 text-center">
      <div className="max-w-md space-y-3">
        <PageTitle>Account Suspended</PageTitle>
        <p className="text-sm text-ink-muted">
          Your account has been suspended for violating Zero&apos;s Community Guidelines. If you
          think this is a mistake, contact us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-ink underline underline-offset-2">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </div>

      <SignOutButton className={cn(BUTTON_VARIANTS.secondary, "border-border bg-transparent shadow-none hover:border-ember-line")} />
    </main>
  );
}
