import { ShieldCheck, Play } from "lucide-react";
import { CategoryIcon } from "@/components/journey/CategoryIcon";
import { CoverChip, CoverFrame, CoverPlay, CoverTitle } from "@/components/ui/cover-card";

type ContentCardProps = {
  href: string;
  imageUrl: string | null;
  imageAlt: string;
  title: string;
  category?: string | null;
  /** Formato ufficiale: "journey" (verticale 4:5) per i Journey, "episode" (4:3) per episodi e video. */
  format?: "journey" | "episode";
  /** Larghezza della card nelle righe a scorrimento laterale (CARD_ROW_ITEM); assente nelle
   * griglie, che la calcolano da sole. */
  className?: string;
  /** Badge in alto a sinistra sulla foto, es. "Discovery"/"Archived". */
  status?: string;
  /** Journey Score (0-100): per gli episodi è quello del Journey a cui appartengono. Assente per
   * Journey ancora in Discovery Phase. L'icona compare sempre, il numero solo se maggiore di zero
   * (un Journey appena pubblicato può avere davvero 0, mostrarlo sembrerebbe un errore). */
  trust?: number;
  /** Menu/azioni del proprietario in alto a destra, fuori dal link. */
  menu?: React.ReactNode;
  /** Testo al centro al posto della foto quando `imageUrl` è null (placeholder del feed demo). */
  emptyMessage?: React.ReactNode;
  /** Mostra l'icona play: solo per le card che aprono un video (episodi). */
  isVideo?: boolean;
};

/** Card del Profilo: stesso formato e stesso stile delle card Journey/episodio del resto del sito. */
export function ContentCard({
  href,
  imageUrl,
  imageAlt,
  title,
  category,
  format = "journey",
  className,
  status,
  trust,
  menu,
  emptyMessage,
  isVideo,
}: ContentCardProps) {
  return (
    <CoverFrame
      format={format}
      className={className}
      href={href}
      imageUrl={imageUrl}
      imageAlt={imageAlt}
      placeholder={emptyMessage}
      menu={menu}
      topLeft={
        status ? <CoverChip>{status}</CoverChip> : category ? <CategoryIcon category={category} /> : undefined
      }
      center={
        isVideo ? (
          <CoverPlay>
            <Play className="h-4 w-4 translate-x-px fill-current" aria-hidden="true" />
          </CoverPlay>
        ) : undefined
      }
      overlay={
        <>
          {category && <CoverChip>{category}</CoverChip>}
          <div className="mt-2 flex items-end justify-between gap-2">
            <CoverTitle className="min-w-0">{title}</CoverTitle>
            {trust !== undefined && (
              <span className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-ember">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                {trust > 0 ? trust : null}
              </span>
            )}
          </div>
        </>
      }
    />
  );
}
