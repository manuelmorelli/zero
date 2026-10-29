import Link from "next/link";
import { AuthHeader } from "@/components/layout/AuthHeader";
import { PageTitle } from "@/components/ui/heading";
import { Notice } from "@/components/ui/panel";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { isRegistrationDisabled } from "@/lib/betaAccess";

export default function RegisterPage() {
  const closed = isRegistrationDisabled();

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <AuthHeader />
        <PageTitle className="mt-8">
          {closed ? "New accounts are closed for now" : "Create Your Account"}
        </PageTitle>
        <p className="mt-2 text-sm text-ink-muted">
          {closed
            ? "Zero is in a private beta right now. If you already have an account, sign in below."
            : "Start following Journeys or sharing your own."}
        </p>

        {closed ? (
          <Notice className="mt-8">
            We&apos;ll open new accounts once Zero is ready for everyone.
          </Notice>
        ) : (
          <RegisterForm />
        )}

        <p className="mt-6 text-center text-sm text-ink-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-ink hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
