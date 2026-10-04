"use client";

import { useState } from "react";
import { ComingSoonButton } from "@/components/community/ComingSoonButton";
import { Button } from "@/components/ui/button";
import { CHIP, CHIP_SELECTED, Panel } from "@/components/ui/panel";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const TIP_AMOUNTS = [3, 5, 10];

/** "Send a tip" on the creator's page. Opens a short form; the creator keeps the whole tip, minus payment fees. Payment stays off until Stripe is connected. */
export function TipPanel() {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(TIP_AMOUNTS[1]);
  const [anonymous, setAnonymous] = useState(false);

  if (!open) {
    return (
      <Button variant="secondary" className="hover:shadow-glow-strong" onClick={() => setOpen(true)}>
        Send a tip
      </Button>
    );
  }

  return (
    <Panel className="flex w-full flex-col gap-3 sm:max-w-md">
      <p className="text-sm text-ink-muted">Say thank you with a one-time tip. The creator receives the full amount.</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Tip amount">
        {TIP_AMOUNTS.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={amount === value}
            onClick={() => setAmount(value)}
            className={amount === value ? CHIP_SELECTED : CHIP}
          >
            €{value}
          </button>
        ))}
      </div>
      <Textarea rows={3} placeholder="Write a short message (optional)" />
      <Switch
        label="Stay anonymous"
        description="Your name won't be shown to the creator."
        checked={anonymous}
        onChange={setAnonymous}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ComingSoonButton className="hover:shadow-glow-strong">Send €{amount}</ComingSoonButton>
        <Button variant="text" onClick={() => setOpen(false)}>
          Close
        </Button>
      </div>
    </Panel>
  );
}
