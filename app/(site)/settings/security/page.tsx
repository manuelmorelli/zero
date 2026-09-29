import { requireSession } from "@/lib/session";
import { PasswordForm } from "@/components/settings/PasswordForm";
import { EmailForm } from "@/components/settings/EmailForm";
import { PAGE_SPACING, PAGE_WIDTH } from "@/components/ui/page-container";
import { PageTitle, SectionTitle } from "@/components/ui/heading";
import { PANEL } from "@/components/ui/panel";

export default async function SettingsSecurityPage() {
  const { user } = await requireSession();

  return (
    <main>
      <div className={`${PAGE_WIDTH.narrow} ${PAGE_SPACING}`}>
        <PageTitle>Password & Security</PageTitle>
        <p className="mt-2 text-sm text-ink-muted">Change your password or update your email address.</p>

        <div className={`mt-8 ${PANEL}`}>
          <SectionTitle>Password</SectionTitle>
          <div className="mt-4">
            <PasswordForm />
          </div>
        </div>

        <div className={`mt-6 ${PANEL}`}>
          <SectionTitle>Email</SectionTitle>
          <div className="mt-4">
            <EmailForm currentEmail={user.email} />
          </div>
        </div>
      </div>
    </main>
  );
}
