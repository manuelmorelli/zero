import { ArrowRight, CircleAlert } from "lucide-react";
import { ButtonPrimary, TextButton } from "@/components/ui/button";
import { CardTitle, PageTitle } from "@/components/ui/heading";
import { Badge, PANEL_ACCENT } from "@/components/ui/panel";
import { SailingScene } from "@/components/ui/sailing-scene";
import { cn } from "@/lib/utils";

/** Card quadrata con bordo arancione: stessa base per le due card in fondo alla Home. Quadrata
 * solo da tablet in su: su telefono stanno affiancate in uno spazio più strette (vedi il grid
 * qui sotto). Altezza fissa (non più libera sul contenuto) sul telefono: con l'altezza libera il
 * bottone "Get started" finiva sopra la barca animata, perché il testo spingeva in basso finché
 * non ci sbatteva contro; con un'altezza fissa il contenuto resta ancorato in alto e la barca ha
 * sempre il suo spazio vuoto sotto. */
const SQUARE_CARD = cn(PANEL_ACCENT, "relative h-[360px] overflow-hidden shadow-glow max-md:p-4 md:h-auto md:aspect-square");

/** I tre passi di Zero in breve (versione completa in app/(site)/how-it-works/page.tsx). */
const STEPS = [
  { number: "01", title: "Choose a Journey", text: "real stories, episode by episode, chapter by chapter." },
  { number: "02", title: "Follow it", text: "pick up exactly where you left off." },
  { number: "03", title: "Build your own", text: "document your Journey, mistakes included." },
];

/**
 * Le due card quadrate in fondo alla Home (al posto di "How Zero Works" e del banner con la
 * foto). A sinistra una finta pagina 404 con la barca a vela animata: invita a creare il primo
 * Journey. A destra una card ancora vuota, contenuto da decidere.
 */
export function HomeClosingCards({ signedIn }: { signedIn: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
      <div className={cn(SQUARE_CARD, "p-0 lg:col-start-2")}>
        <SailingScene className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-b from-scrim-soft to-transparent to-55%" />

        <div className="relative flex h-full flex-col items-center px-6 pb-4 pt-3 text-center md:justify-center md:gap-3 md:pb-[30%]">
          <div className="flex flex-col items-center gap-1.5">
            <Badge className="border-ember-line bg-ember-soft uppercase tracking-[0.18em] text-ember">
              <CircleAlert className="h-3.5 w-3.5" aria-hidden="true" />
              Error 404
            </Badge>
            <PageTitle as="h2" className="text-base leading-tight text-on-photo md:max-w-[17ch] md:text-xl">
              This path doesn&apos;t exist, but you can create it.
            </PageTitle>
            <p className="text-sm font-medium text-on-photo-muted">Become a journeyer.</p>
          </div>
          <ButtonPrimary
            href={signedIn ? "/dashboard/journeys/new" : "/register"}
            className="mt-auto !text-on-photo md:mt-0"
          >
            Get started
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </ButtonPrimary>
        </div>
      </div>

      <div className={cn(SQUARE_CARD, "flex flex-col justify-between gap-4")}>
        <div>
          <CardTitle as="h2">How Zero works</CardTitle>
          <ol className="mt-4 space-y-3">
            {STEPS.map((step) => (
              <li key={step.number} className="flex gap-3 text-sm leading-snug text-ink-muted">
                <span className="font-bold text-ember">{step.number}</span>
                <span>
                  <span className="font-semibold text-ink">{step.title}:</span> {step.text}
                </span>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <p className="text-sm font-semibold text-ember">Paying never gets you seen more.</p>
          <TextButton href="/how-it-works" className="mt-2">
            Learn how it works
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </TextButton>
        </div>
      </div>
    </div>
  );
}
