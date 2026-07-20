import Link from "next/link";
import { requireSession } from "@/lib/session";
import { SignOutButton } from "@/components/common/SignOutButton";

export default async function AccountPage() {
  const { user } = await requireSession();

  return (
    <main className="mx-auto max-w-lg px-6 py-16">
      <Link
        href="/"
        className="font-sans text-xl font-extrabold tracking-tight"
      >
        ZERO
      </Link>
      <h1 className="mt-8 text-2xl font-extrabold tracking-tight">
        Il tuo account
      </h1>

      <div className="mt-8 space-y-4 rounded-xl border border-border bg-surface p-6">
        <InfoRow label="Nome" value={user.name} />
        <InfoRow label="Email" value={user.email} />
      </div>

      <SignOutButton className="mt-6 rounded-full border border-border px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-ink-muted">
        Esci
      </SignOutButton>
    </main>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
        {label}
      </p>
      <p className="mt-1 text-sm text-ink">{value}</p>
    </div>
  );
}
