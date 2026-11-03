import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthHeader } from "@/components/layout/AuthHeader";
import { PageTitle } from "@/components/ui/heading";
import { Notice } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { CreateAccountReveal } from "@/components/auth/CreateAccountReveal";
import { isRegistrationDisabled } from "@/lib/betaAccess";
import { getCurrentSession } from "@/lib/session";

export default async function RegisterPage() {
  const session = await getCurrentSession();
  if (session) redirect("/");

  const closed = isRegistrationDisabled();

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      {/* flex-col: sul computer l'ordine resta quello del markup (nessun order impostato sopra
       * md, identico a prima), su telefono alcuni blocchi passano avanti con max-md:order-N.
       * Su richiesta di Manuel, 2026-11-03. */}
      <div className="flex w-full max-w-sm flex-col">
        <AuthHeader centerLogoOnMobile />

        {/* Solo telefono: saluto + "Sign in" ben visibile, prima di tutto il resto. */}
        {!closed && (
          <p className="mt-8 max-md:order-2 text-center text-2xl font-extrabold uppercase tracking-tight text-ink md:hidden">
            Welcome back on Zero
          </p>
        )}
        {!closed && (
          <Button variant="secondary" href="/login" className="mt-4 w-full max-md:order-3 text-base md:hidden">
            Sign in
          </Button>
        )}

        {closed ? (
          <>
            <PageTitle className="mt-8 max-md:order-4">New accounts are closed for now</PageTitle>
            <p className="mt-2 max-md:order-4 text-sm text-ink-muted">
              Zero is in a private beta right now. If you already have an account, sign in below.
            </p>
            <Notice className="mt-8 max-md:order-5">
              We&apos;ll open new accounts once Zero is ready for everyone.
            </Notice>
          </>
        ) : (
          <CreateAccountReveal>
            <PageTitle className="mt-8">Create Your Account</PageTitle>
            <p className="mt-2 text-sm text-ink-muted">Start following Journeys or sharing your own.</p>
            <RegisterForm />
          </CreateAccountReveal>
        )}

        <p className="mt-6 text-center text-sm text-ink-muted max-md:hidden">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-ink hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
