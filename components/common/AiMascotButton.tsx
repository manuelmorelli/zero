"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/panel";
import { cn } from "@/lib/utils";

/**
 * L'assistente AI di Zero nell'header: la "O" del logo con una faccina (idea di Manuel,
 * 2026-10-09). Per ora è solo il pulsante, onesto su cosa fa davvero: l'assistente vero
 * (cosa sa rispondere, dove compare il resto della conversazione) non è ancora stato
 * costruito, vedi project_ai_roadmap_decisions in memoria.
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
        <Notice className="absolute right-0 top-11 z-50 w-56 text-left shadow-2xl">
          Still learning, come back soon.
        </Notice>
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
