import { requireSession } from "@/lib/session";
import { PAGE_SPACING, PAGE_WIDTH } from "@/components/ui/page-container";
import { PageTitle } from "@/components/ui/heading";

export default async function SettingsPrivacyPage() {
  await requireSession();

  return (
    <main>
      <div className={`${PAGE_WIDTH.narrow} ${PAGE_SPACING}`}>
        <PageTitle>Privacy</PageTitle>
        <p className="mt-2 text-sm text-ink-muted">
          Coming soon. Controls like a private account and blocked users will live here.
        </p>
      </div>
    </main>
  );
}
