"use client";

import { useEffect, useState } from "react";
import { signOut } from "@/lib/auth-client";
import { BackLink } from "@/components/common/BackLink";

/** L'azione requestAccountDeletionAction() ha già segnato l'account per la cancellazione;
 * questa pagina chiude la sessione lato client (stesso pattern di SignOutButton) e mostra
 * conferma. Data del pulsante "Vieni a riattivare" già coperta dal login: rifare login qui entro
 * i 10 giorni porta a /reactivate-account (vedi lib/session.ts). */
export default function DeletionScheduledPage() {
  const [signedOut, setSignedOut] = useState(false);

  useEffect(() => {
    signOut().finally(() => setSignedOut(true));
  }, []);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-bg px-6 text-center">
      <div className="max-w-md space-y-3">
        <h1 className="text-xl font-semibold text-ink">Account scheduled for deletion</h1>
        <p className="text-sm text-ink-muted">
          Your account will be permanently deleted in 10 days. If you change your mind, just log back
          in before then to reactivate it — everything will be exactly as you left it.
        </p>
      </div>

      {signedOut && <BackLink href="/login" label="Back to login" />}
    </main>
  );
}
