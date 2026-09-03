import { requireSession } from "@/lib/session";
import { PasswordForm } from "@/components/settings/PasswordForm";
import { EmailForm } from "@/components/settings/EmailForm";

export default async function SettingsSecurityPage() {
  const { user } = await requireSession();

  return (
    <main>
      <div className="mx-auto w-full max-w-2xl px-6 pb-16 pt-24">
        <h1 className="text-xl font-bold tracking-tight">Password & Security</h1>
        <p className="mt-2 text-sm text-ink-muted">Change your password or update your email address.</p>

        <div className="mt-8 rounded-xl border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold text-ink-muted">Password</h2>
          <div className="mt-4">
            <PasswordForm />
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold text-ink-muted">Email</h2>
          <div className="mt-4">
            <EmailForm currentEmail={user.email} />
          </div>
        </div>
      </div>
    </main>
  );
}
