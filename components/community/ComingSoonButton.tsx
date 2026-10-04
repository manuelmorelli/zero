"use client";

import { useEffect, useState } from "react";
import { Button, type ButtonVariant } from "@/components/ui/button";
import { Notice } from "@/components/ui/panel";

const NOTICE_MS = 3000;

type ComingSoonButtonProps = {
  children: React.ReactNode;
  variant?: ButtonVariant;
  className?: string;
};

/** Payment button that stays clickable until Stripe is connected: a click explains, nothing is charged.
 * The note closes by itself after a few seconds, or at the next click on the button. */
export function ComingSoonButton({ children, variant = "secondary", className }: ComingSoonButtonProps) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!shown) return;
    const timer = setTimeout(() => setShown(false), NOTICE_MS);
    return () => clearTimeout(timer);
  }, [shown]);

  return (
    <div className="flex flex-col gap-2">
      <Button variant={variant} className={className} onClick={() => setShown((open) => !open)}>
        {children}
      </Button>
      {shown && <Notice>Payments open soon.</Notice>}
    </div>
  );
}
