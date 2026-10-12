import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/*
 * Pezzi comuni alle chat AI del sito (Community e Ember): bolla del messaggio, risposta
 * dell'assistente, barra di scrittura con bordo e bagliore arancioni. Prima erano ricopiati a
 * mano, quasi identici, in ogni chat: un cambiamento in uno si perdeva nell'altro.
 */

type BubbleProps = {
  children: React.ReactNode;
  className?: string;
  /** Versione più piccola, per il pannello di Ember (una finestra piccola, non a tutto schermo). */
  compact?: boolean;
};

/** Il messaggio di chi scrive, a destra, come su ogni app di chat. */
export function ChatBubbleUser({ children, className, compact }: BubbleProps) {
  return (
    <div
      className={cn(
        "ml-auto max-w-[85%] whitespace-pre-wrap rounded-3xl bg-surface-2 text-ink",
        compact ? "px-3.5 py-2 text-sm" : "rounded-tr-md px-4 py-2.5 text-base leading-relaxed",
        className
      )}
    >
      {children}
    </div>
  );
}

/** La risposta dell'assistente, a sinistra, con la stessa stella arancione ovunque sul sito. */
export function ChatBubbleAssistant({ children, className, compact, pulseIcon }: BubbleProps & { pulseIcon?: boolean }) {
  return (
    <div className={cn("flex", compact ? "gap-2" : "gap-3", className)}>
      <Sparkles
        className={cn("shrink-0 text-ember", compact ? "mt-0.5 h-4 w-4" : "mt-1 h-5 w-5", pulseIcon && "animate-pulse")}
        aria-hidden="true"
      />
      <div className={cn("min-w-0 flex-1 leading-relaxed", compact ? "text-sm" : "text-base")}>{children}</div>
    </div>
  );
}

/** Il messaggio di una conversazione 1:1 (Messaggi): a destra e scuro se è mio, a sinistra e
 * grigio se è dell'altra persona. Diverso dalle bolle della chat AI qui sopra: lì "a destra" è
 * sempre chi scrive, qui entrambe le persone hanno una bolla. */
export function MessageBubble({ mine, children, className }: { mine: boolean; children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm",
        mine ? "ml-auto rounded-tr-sm bg-ink text-bg" : "rounded-tl-sm bg-surface-2 text-ink",
        className
      )}
    >
      {children}
    </div>
  );
}

/** La barra di scrittura: bordo e bagliore arancioni sempre visibili, più accesi al passaggio
 * del mouse e mentre si scrive. */
export function ChatComposerShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-[2rem] border border-ember-line bg-surface shadow-glow transition-all duration-300 hover:border-ember hover:shadow-glow-strong focus-within:border-ember focus-within:shadow-glow-strong",
        className
      )}
    >
      {children}
    </div>
  );
}
