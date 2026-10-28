import Link from "next/link";
import { User, Lock, Bell, Star, Shield, Heart, CreditCard, LogOut } from "lucide-react";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PAGE_SPACING, PAGE_WIDTH } from "@/components/ui/page-container";
import { PageTitle } from "@/components/ui/heading";
import { ThemeToggle } from "@/components/settings/ThemeToggle";
import { SignOutButton } from "@/components/common/SignOutButton";

const SETTINGS_SECTIONS = [
  { href: "/settings/account", label: "Account", description: "Name, username, bio, location", icon: User },
  { href: "/settings/security", label: "Password & Security", description: "Password and email address", icon: Lock },
  { href: "/settings/notifications", label: "Notifications", description: "Which updates you receive", icon: Bell },
  { href: "/settings/creator", label: "Journeyer", description: "Notifications and tools for what you publish", icon: Star },
  { href: "/settings/privacy", label: "Privacy & Blocking", description: "Who can interact with you", icon: Shield },
  { href: "/settings/interests", label: "Interests", description: "Categories you care about", icon: Heart },
  { href: "/settings/subscription", label: "Subscription", description: "Billing and plan", icon: CreditCard },
];

export default async function SettingsPage() {
  const { user } = await requireSession();
  const { theme } = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { theme: true },
  });

  return (
    <main>
      <div className={`${PAGE_WIDTH.narrow} ${PAGE_SPACING}`}>
        <PageTitle className="text-ember">Settings</PageTitle>
        <p className="mt-2 text-sm text-ink">Manage your account, notifications and preferences.</p>

        <div className="mt-6">
          <ThemeToggle theme={theme} />
        </div>

        {/* Sotto i 768px: righe semplici icona+nome, senza descrizione/freccetta/riquadro bordato
            (identico a Settings.dc.html del mockup). Da tablet in su invariato: righe con
            descrizione e freccetta dentro un riquadro bordato, più informative per uno schermo
            largo. */}
        <div className="mt-6 divide-y divide-border pb-24 md:hidden">
          {SETTINGS_SECTIONS.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="flex items-center gap-4 py-4 text-ink transition-colors hover:text-ember"
            >
              <section.icon className="h-5 w-5 shrink-0" strokeWidth={1.75} />
              <span className="text-base font-semibold">{section.label}</span>
            </Link>
          ))}
          <SignOutButton className="flex w-full items-center gap-4 py-4 text-left text-danger transition-colors hover:opacity-80">
            <LogOut className="h-5 w-5 shrink-0" strokeWidth={1.75} />
            <span className="text-base font-semibold">Sign out</span>
          </SignOutButton>
        </div>

        <div className="mt-6 hidden divide-y divide-border rounded-xl border border-border bg-surface md:block">
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
