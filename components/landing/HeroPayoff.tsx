import { HERO_PAYOFFS } from "@/lib/landing/heroPayoffs";
import { cn } from "@/lib/utils";

type HeroPayoffProps = {
  index: number;
  /** Tipografia del titolo: resta in Hero.tsx, l'unico file con le taglie su misura della Hero. */
  className: string;
};

// Dissolvenza in due tempi, senza movimento: la frase vecchia svanisce del tutto, solo dopo compare
// la nuova. Spostare di pochi pixel un testo così grande fa saltare le lettere da un pixel
// all'altro (scatto), e due frasi visibili insieme nello stesso punto sembrano un errore. Niente
// sfocatura: con video e sabbia 3D sotto, costava troppo.
const ACTIVE = "opacity-100 transition-opacity duration-500 delay-300 ease-out will-change-[opacity]";
const INACTIVE = "opacity-0 transition-opacity duration-300 ease-out will-change-[opacity]";

/** Titolo della Hero: le frasi stanno una sopra l'altra nella stessa cella, così il riquadro
 * prende l'altezza della più lunga e il cambio non sposta i bottoni sotto. */
export function HeroPayoff({ index, className }: HeroPayoffProps) {
  return (
    <div className={cn("relative grid", className)}>
      {HERO_PAYOFFS.map((payoff, phraseIndex) => (
        <p
          key={payoff.text}
          aria-hidden={phraseIndex !== index}
          className={cn("col-start-1 row-start-1 self-center", phraseIndex === index ? ACTIVE : INACTIVE)}
        >
          {payoff.text} <span className="text-ember">{payoff.accent}</span>
        </p>
      ))}
    </div>
  );
}
