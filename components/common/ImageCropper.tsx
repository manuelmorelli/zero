"use client";

import { useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { getCroppedImageBlob } from "@/lib/cropImage";
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/heading";

type ImageCropperProps = {
  imageSrc: string;
  title: string;
  /** Larghezza/altezza dell'area di ritaglio: 1 per l'avatar tondo, 3 per la copertina. */
  aspect: number;
  cropShape: "round" | "rect";
  onCancel: () => void;
  onConfirm: (blob: Blob) => void;
};

/** Riquadro "sposta e zooma" mostrato subito dopo aver scelto una foto, prima di caricarla. */
export function ImageCropper({ imageSrc, title, aspect, cropShape, onCancel, onConfirm }: ImageCropperProps) {
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

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-scrim px-4 py-8"
      onClick={(event) => {
        // Il riquadro può comparire annidato dentro un altro overlay (es. "Edit profile"):
        // ferma la propagazione, altrimenti il click sullo sfondo chiuderebbe anche quello.
        event.stopPropagation();
        onCancel();
      }}
    >
      <div
        className="flex w-full max-w-sm flex-col overflow-hidden rounded-xl border border-border bg-surface"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-border px-5 py-4">
          <CardTitle as="h2">{title}</CardTitle>
          <p className="mt-1 text-sm text-ink-muted">Drag to move, use the slider to zoom.</p>
        </div>

        <div className="relative h-72 w-full bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            minZoom={0.5}
            maxZoom={3}
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
            min={0.5}
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
    </div>
  );
}
