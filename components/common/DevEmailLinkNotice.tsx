"use client";

import { useEffect, useState } from "react";
import { getDevEmailLink } from "@/lib/actions/devEmail";

type DevEmailLinkNoticeProps = {
  email: string;
  kind: "verify-email" | "reset-password";
};

/**
 * Solo per sviluppo, finché Resend non ha un dominio verificato (vedi lib/devEmailLog.ts):
 * l'invio email in background può richiedere un istante, quindi si ritenta poche volte prima
 * di rinunciare. In produzione `getDevEmailLink` restituisce sempre null: nessuna UI aggiuntiva.
 */
export function DevEmailLinkNotice({ email, kind }: DevEmailLinkNoticeProps) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    async function poll() {
      const found = await getDevEmailLink(email, kind);
      if (cancelled) return;
      if (found) {
        setUrl(found);
        return;
      }
      attempts += 1;
      if (attempts < 5) setTimeout(poll, 500);
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, [email, kind]);

  if (!url) return null;

  return (
    <div className="mt-4 rounded-lg border border-dashed border-border p-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
        Development only
      </p>
      <p className="mt-1 text-sm text-ink-muted">
        Email delivery isn&apos;t verified yet — here&apos;s the link directly:
      </p>
      <a href={url} className="mt-1 block truncate text-sm font-medium text-ink underline underline-offset-2">
        {url}
      </a>
    </div>
  );
}
