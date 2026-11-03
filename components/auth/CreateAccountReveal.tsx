"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Solo telefono: sotto il tasto "Sign in", la domanda "Don't you have an account?" con la
 * pillola "Create one". Il modulo di registrazione (passato come children) resta chiuso finché
 * non si clicca la pillola, invece di essere già tutto aperto sotto "Sign in" (richiesta di
 * Manuel, 2026-11-03). Da computer il modulo resta sempre visibile come prima: questo componente
 * non tocca nulla sopra md. */
export function CreateAccountReveal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <p className="mt-6 max-md:order-4 text-center text-base text-ink-muted md:hidden">
        Don&apos;t have an account?{" "}
        <Button
          variant="secondary"
          type="button"
          onClick={() => setOpen(true)}
          className="ml-1 px-4 py-1 text-sm"
        >
          Create one
        </Button>
      </p>
      <div className={cn("max-md:order-5", !open && "max-md:hidden")}>{children}</div>
    </>
  );
}
