import Link from "next/link";
import { requireSession } from "@/lib/session";
import { PAGE_SPACING, PAGE_WIDTH } from "@/components/ui/page-container";
import { PageTitle } from "@/components/ui/heading";

const SETTINGS_SECTIONS = [
  { href: "/settings/account", label: "Account", description: "Name, username, bio, location" },
  { href: "/settings/security", label: "Password & Security", description: "Password and email address" },
  { href: "/settings/notifications", label: "Notifications", description: "Which updates you receive" },
  { href: "/settings/creator", label: "Creator", description: "Notifications and tools for what you publish" },
  { href: "/settings/privacy", label: "Privacy", description: "Who can interact with you" },
  { href: "/settings/interests", label: "Interests", description: "Categories you care about" },
  { href: "/settings/subscription", label: "Subscription", description: "Billing and plan" },
];

export default async function SettingsPage() {
  await requireSession();

  return (
    <main>
      <div className={`${PAGE_WIDTH.narrow} ${PAGE_SPACING}`}>
        <PageTitle>Settings</PageTitle>
        <p className="mt-2 text-sm text-ink-muted">Manage your account, notifications and preferences.</p>

        <div className="mt-8 divide-y divide-border rounded-xl border border-border bg-surface">
          {SETTINGS_SECTIONS.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-surface-2"
            >
              <span>
                <span className="block text-sm font-semibold text-ink">{section.label}</span>
                <span className="block text-sm text-ink-muted">{section.description}</span>
              </span>
              <ChevronIcon className="h-4 w-4 shrink-0 text-ink-faint" />
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} className={className} aria-hidden="true">
      <path d="M7.5 4.5 13 10l-5.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
