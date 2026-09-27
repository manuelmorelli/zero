import Image from "next/image";
import { Check, ImagePlus } from "lucide-react";

// Indirizzo stabile delle immagini della chat (link R2 rigenerato a ogni richiesta, vedi
// app/api/community-ai/image/route.ts): serve perché la chat resta salvata fino al logout.
export function aiImageUrl(key: string): string {
  return `/api/community-ai/image?key=${encodeURIComponent(key)}`;
}

/** Immagine dentro un messaggio della chat AI Community (creata dall'AI o allegata col "+"), con il
 * pulsante "Use as cover" che la porta nel modulo come copertina. */
export function CommunityAiChatImage({
  imageKey,
  selected,
  onSelect,
}: {
  imageKey: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <div className="mb-2">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-surface-2">
        <Image src={aiImageUrl(imageKey)} alt="" fill sizes="320px" unoptimized className="object-cover" />
      </div>
      <button
        type="button"
        onClick={onSelect}
        disabled={selected}
        className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold opacity-70 transition-opacity hover:opacity-100 disabled:text-ember disabled:opacity-100"
      >
        {selected ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <ImagePlus className="h-3.5 w-3.5" aria-hidden="true" />}
        {selected ? "Cover selected" : "Use as cover"}
      </button>
    </div>
  );
}
