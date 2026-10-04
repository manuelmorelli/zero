"use client";

import { useState } from "react";
import { ComingSoonButton } from "@/components/community/ComingSoonButton";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { Textarea } from "@/components/ui/textarea";

/** "Gift a month" on the creator's page. Opens a short form; payment stays off until Stripe is connected. */
export function GiftMonthPanel() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button variant="secondary" className="hover:shadow-glow-strong" onClick={() => setOpen(true)}>
        Gift a month
      </Button>
    );
  }

  return (
    <Panel className="flex w-full flex-col gap-3 sm:max-w-md">
      <p className="text-sm text-ink-muted">
        Give one month to a friend. They have no obligations: they can use it, or ignore it.
      </p>
      <Textarea rows={3} placeholder="Write a short note (optional)" />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ComingSoonButton className="hover:shadow-glow-strong">Pay for the gift</ComingSoonButton>
        <Button variant="text" onClick={() => setOpen(false)}>
          Close
        </Button>
      </div>
    </Panel>
  );
}
