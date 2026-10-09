"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { EmberChatPanel } from "@/components/common/EmberChatPanel";
import { cn } from "@/lib/utils";

/**
 * L'assistente AI di Zero nell'header: la "O" del logo con una faccina (idea di Manuel,
 * 2026-10-09), ora collegata a Ember (components/common/EmberChatPanel.tsx), l'assistente che
 * spiega come funziona il sito. Visibile a tutti, loggati e no: Ember non vede dati personali e
 * non esegue mai azioni al posto di chi lo usa.
 */
export function AiMascotButton() {
  const [open, setOpen] = useState(false);
  const [justLanded, setJustLanded] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setJustLanded(false), 1000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="mascot"
        aria-label="Zero assistant"
        onClick={() => setOpen((value) => !value)}
        className={cn("group", justLanded && "animate-bounce")}
      >
        <MascotFace />
      </Button>

      {open && (
        <div className="absolute right-0 top-11 z-50">
          <EmberChatPanel />
        </div>
      )}
    </div>
  );
}

function MascotFace() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <ellipse cx="6.5" cy="11" rx="1.6" ry="2" fill="currentColor" className="animate-pulse text-ember" />
      <ellipse cx="17.5" cy="11" rx="1.6" ry="2" fill="currentColor" className="animate-pulse text-ember" />
      <path
        d="M6 18.5 Q12 22 18 18.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="text-ember opacity-0 transition-opacity duration-200 group-hover:opacity-100"
      />
    </svg>
  );
}
