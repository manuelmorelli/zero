"use client";

import { useRef, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** Distanza di trascinamento (px) oltre la quale, al rilascio, scatta il ricaricamento. */
const PULL_THRESHOLD = 70;
/** Trascinamento massimo mostrato: oltre non cresce più, per non staccare il dito dal gesto. */
const MAX_PULL = 110;

/** Pull-to-refresh vero (come Instagram): solo touch, quindi non tocca il desktop per
 * costruzione — niente evento touch arriva da mouse/trackpad. Avvolge il contenuto con
 * `display: contents`, quindi non aggiunge nessun box al layout. */
export function PullToRefresh({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pull, setPull] = useState(0);
  const draggingRef = useRef(false);
  const startYRef = useRef(0);

  function handleTouchStart(e: React.TouchEvent) {
    if (window.scrollY > 0 || isPending) return;
    draggingRef.current = true;
    startYRef.current = e.touches[0].clientY;
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (!draggingRef.current) return;
    const delta = e.touches[0].clientY - startYRef.current;
    setPull(delta > 0 ? Math.min(delta * 0.5, MAX_PULL) : 0);
  }

  function handleTouchEnd() {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (pull >= PULL_THRESHOLD) {
      startTransition(() => {
        router.refresh();
      });
    }
    setPull(0);
  }

  const visible = pull > 0 || isPending;

  return (
    <div className="contents" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      <div
        className={cn(
          "pointer-events-none fixed left-1/2 top-16 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface shadow-md transition-opacity md:hidden",
          visible ? "opacity-100" : "opacity-0"
        )}
        style={{ transform: `translate(-50%, ${isPending ? 0 : pull - 40}px)` }}
      >
        <Loader2
          className={cn("h-5 w-5 text-ember", isPending && "animate-spin")}
          style={!isPending ? { transform: `rotate(${pull * 3}deg)` } : undefined}
          aria-hidden="true"
        />
      </div>
      {children}
    </div>
  );
}
