"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import Cropper, { type Area } from "react-easy-crop";
import { getCroppedImageBlob } from "@/lib/cropImage";
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/heading";

type ImageCropperProps = {
  imageSrc: string;
  title: string;
  /** Larghezza/altezza dell'area di ritaglio: 1 per l'avatar tondo, 16/9 per la copertina del profilo. */
  aspect: number;
  cropShape: "round" | "rect";
  /** true: la foto riempie sempre il riquadro (niente zoom indietro, niente margini vuoti). */
  fillFrame?: boolean;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void;
};

/** Riquadro "sposta e zooma" mostrato subito dopo aver scelto una foto, prima di caricarla. */
export function ImageCropper({ imageSrc, title, aspect, cropShape, fillFrame = false, onCancel, onConfirm }: ImageCropperProps) {
  const minZoom = fillFrame ? 1 : 0.5;
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  async function handleConfirm() {
    if (!croppedAreaPixels) return;
    setProcessing(true);
    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels);
      onConfirm(blob);
    } finally {
      setProcessing(false);
    }
  }

  // Portal diretto su document.body: annidato dentro il modale "Edit profile" (che si centra
  // con una transform CSS), questo riquadro "fixed" veniva inquadrato rispetto a quel modale
  // invece che allo schermo, e la parte alta finiva fuori dai bordi visibili (Manuel, 2026-11-04).
  return createPortal(
    <div
      className="pointer-events-auto fixed inset-0 z-[60] flex items-center justify-center bg-scrim px-4 py-8"
      onClick={(event) => event.stopPropagation()}
    >
      <div
        className="flex w-full max-w-sm flex-col overflow-hidden rounded-xl border border-border bg-surface"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative border-b border-border px-5 py-4 md:pr-14 max-md:pr-14">
          <button type="button" onClick={onCancel} aria-label="Close" className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border border-border text-ink-muted hover:text-ink">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
          <CardTitle as="h2">{title}</CardTitle>
          <p className="mt-1 text-sm text-ink-muted">Drag to move, use the slider to zoom.</p>
        </div>

        <div className="relative h-72 w-full overflow-hidden bg-surface-2">
          {/* Anteprima del margine: stessa foto, allargata e sfocata, dietro al riquadro di
              ritaglio. Statica (non segue pan/zoom), basta a far vedere il colore prima di confermare. */}
          {!fillFrame && (
          <div
            aria-hidden="true"
            className="absolute inset-0 scale-110 bg-cover bg-center"
            style={{ backgroundImage: `url(${imageSrc})`, filter: "blur(24px) saturate(1.6) brightness(1.05)" }}
          />
          )}
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            minZoom={minZoom}
            maxZoom={3}
            // Sotto zoom 1 la foto è più piccola del riquadro: il blocco normale della posizione
            // (pensato solo per foto più grandi del riquadro) andava in conflitto e il drag
            // si inceppava. Disattivato: a zoom basso il margine vuoto è voluto (sfondo pieno
            // dietro, riempito in lib/cropImage.ts), quindi non serve nessun blocco.
            restrictPosition={fillFrame}
            objectFit={fillFrame ? "cover" : "contain"}
            aspect={aspect}
            cropShape={cropShape}
            showGrid={cropShape === "rect"}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_area, areaPixels) => setCroppedAreaPixels(areaPixels)}
          />
        </div>

        <div className="space-y-4 p-5">
          <input
            type="range"
            min={minZoom}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
            aria-label="Zoom"
            className="w-full accent-ink"
          />

          <div className="flex gap-3">
            <Button variant="secondary" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirm} disabled={processing || !croppedAreaPixels} className="flex-1">
              {processing ? "Applying…" : "Apply"}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
