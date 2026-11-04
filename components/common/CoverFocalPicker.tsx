"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/heading";

type CoverFocalPickerProps = {
  imageSrc: string;
  /** Punto di partenza (0-1): il centro se la persona non ha mai scelto nulla prima. */
  initialFocalX: number;
  onCancel: () => void;
  onConfirm: (focalX: number) => void;
};

/** Dopo il ritaglio 3:1 della copertina, chiede di segnare dove si trova il soggetto
 * principale: su telefono il riquadro è più stretto, quindi senza questo punto il centro
 * automatico della foto può tagliare via quello che conta (Manuel, 2026-11-04). */
export function CoverFocalPicker({ imageSrc, initialFocalX, onCancel, onConfirm }: CoverFocalPickerProps) {
  const [focalX, setFocalX] = useState(initialFocalX);
  const trackRef = useRef<HTMLDivElement>(null);

  function updateFromClientX(clientX: number) {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    const fraction = (clientX - rect.left) / rect.width;
    setFocalX(Math.min(1, Math.max(0, fraction)));
  }

  // Portal diretto su document.body: senza, il riquadro erediva il contenitore trasformato
  // del Dialog "Edit profile" (il modale si centra con una transform CSS, che per i figli
  // "fixed" conta come nuovo punto di riferimento invece dello schermo) e la parte alta
  // finiva fuori dai bordi visibili (segnalato da Manuel, 2026-11-04).
  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-scrim px-4 py-8"
      onClick={(event) => {
        event.stopPropagation();
        onCancel();
      }}
    >
      <div
        className="flex w-full max-w-md flex-col overflow-hidden rounded-xl border border-border bg-surface"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-border px-5 py-4">
          <CardTitle as="h2">Dov&apos;è il soggetto?</CardTitle>
          <p className="mt-1 text-sm text-ink-muted">
            Tocca o trascina sul punto più importante: su telefono resterà sempre visibile.
          </p>
        </div>

        <div
          ref={trackRef}
          className="relative aspect-[3/1] w-full cursor-crosshair select-none bg-black"
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            updateFromClientX(event.clientX);
          }}
          onPointerMove={(event) => {
            if (event.buttons !== 1) return;
            updateFromClientX(event.clientX);
          }}
        >
          <img src={imageSrc} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
          <div
            className="pointer-events-none absolute inset-y-0 w-1 bg-ember"
            style={{ left: `${focalX * 100}%` }}
          />
        </div>

        {/* Anteprima dal vivo (come il taglio delle miniature su YouTube): la stessa foto nella
         * forma vera del telefono e del computer, così si vede subito il risultato invece di
         * doverlo immaginare o controllare aprendo il sito (Manuel, 2026-11-04). */}
        <div className="flex gap-4 border-t border-border px-5 py-4">
          <div className="flex-1">
            <p className="text-sm font-semibold text-ink-muted">Telefono</p>
            <div className="relative mt-1.5 aspect-4/3 w-full overflow-hidden rounded-lg border border-border bg-black">
              <img
                src={imageSrc}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: `${focalX * 100}% 50%` }}
                draggable={false}
              />
            </div>
          </div>
          <div className="flex-[2]">
            <p className="text-sm font-semibold text-ink-muted">Computer</p>
            <div className="relative mt-1.5 aspect-[12/5] w-full overflow-hidden rounded-lg border border-border bg-black">
              <img
                src={imageSrc}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: `${focalX * 100}% 50%` }}
                draggable={false}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-5">
          <Button variant="secondary" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button variant="primary" onClick={() => onConfirm(focalX)} className="flex-1">
            Apply
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
