"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { PANEL_GLASS } from "@/components/ui/panel";
import { EmberChatPanel } from "@/components/common/EmberChatPanel";
import { cn } from "@/lib/utils";

const INTRO_VISIBLE_MS = 8000;

/**
 * L'assistente AI di Zero nell'header: la "O" del logo con una faccina (idea di Manuel,
 * 2026-10-09), ora collegata a Ember (components/common/EmberChatPanel.tsx), l'assistente che
 * spiega come funziona il sito. Visibile a tutti, loggati e no: Ember non vede dati personali e
 * non esegue mai azioni al posto di chi lo usa. Al primo caricamento mostra da solo un fumetto di
 * presentazione (Manuel, 2026-10-09), visibile senza bisogno di passare il mouse sopra, che si
 * dissolve da solo dopo pochi secondi.
 */
export function AiMascotButton() {
  const [open, setOpen] = useState(false);
  const [justLanded, setJustLanded] = useState(true);
  const [intro, setIntro] = useState<"visible" | "leaving" | "hidden">("visible");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setJustLanded(false), 1000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => setIntro("leaving"), INTRO_VISIBLE_MS);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!open) return;
    setIntro("hidden");
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
        <div className="absolute right-0 top-11 z-50 origin-top-right animate-[panel-in_300ms_cubic-bezier(0.16,1,0.3,1)]">
          <EmberChatPanel />
        </div>
      )}

      {!open && intro !== "hidden" && (
        <div
          role="status"
          onAnimationEnd={() => intro === "leaving" && setIntro("hidden")}
          className={cn(
            "absolute right-0 top-11 z-40 w-64 origin-top-right",
            intro === "visible"
              ? "animate-[panel-in_400ms_cubic-bezier(0.16,1,0.3,1)_forwards]"
              : "animate-[panel-out_300ms_cubic-bezier(0.16,1,0.3,1)_forwards]"
          )}
        >
          <div
            aria-hidden="true"
            className="absolute -top-1.5 right-3 h-3 w-3 rotate-45 border-l border-t border-ember-line bg-ember-soft"
          />
          <p className={cn(PANEL_GLASS, "p-3 text-sm leading-snug text-ink shadow-xl")}>
            Hi, I&apos;m Ember, the assistant that explains how Zero works. Click here anytime you need a hand.
          </p>
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
