"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "@/lib/auth-client";
import { clearCommunityAiChats } from "@/lib/communityAiChatStorage";
import { PageTitle } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";

/** L'azione requestAccountDeletionAction() ha già segnato l'account per la cancellazione;
 * questa pagina chiude la sessione lato client (stesso pattern di SignOutButton) e mostra
 * conferma. Data del pulsante "Vieni a riattivare" già coperta dal login: rifare login qui entro
 * i 10 giorni porta a /reactivate-account (vedi lib/session.ts). */
export default function DeletionScheduledPage() {
  const [signedOut, setSignedOut] = useState(false);

  useEffect(() => {
    clearCommunityAiChats();
    signOut().finally(() => setSignedOut(true));
  }, []);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-bg px-6 text-center">
      <div className="max-w-md space-y-3">
        <PageTitle>Account Scheduled for Deletion</PageTitle>
        <p className="text-sm text-ink-muted">
          Your account will be permanently deleted in 10 days. If you change your mind, just log back
          in before then to reactivate it. Everything will be exactly as you left it.
        </p>
      </div>

      {signedOut && (
        <Button variant="primary" href="/login">
          Back to Login
        </Button>
      )}
    </main>
  );
}
