import { ArrowRight, CircleAlert } from "lucide-react";
import { ButtonPrimary } from "@/components/ui/button";
import { PageTitle } from "@/components/ui/heading";
import { Badge, PANEL_ACCENT } from "@/components/ui/panel";
import { SailingScene } from "@/components/ui/sailing-scene";
import { cn } from "@/lib/utils";

/** Card quadrata con bordo arancione: stessa base per le due card in fondo alla Home. */
const SQUARE_CARD = cn(PANEL_ACCENT, "relative aspect-square overflow-hidden shadow-glow");

/**
 * Le due card quadrate in fondo alla Home (al posto di "How Zero Works" e del banner con la
 * foto). A sinistra una finta pagina 404 con la barca a vela animata: invita a creare il primo
 * Journey. A destra una card ancora vuota, contenuto da decidere.
 */
export function HomeClosingCards({ signedIn }: { signedIn: boolean }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <div className={cn(SQUARE_CARD, "p-0 lg:col-start-2")}>
        <SailingScene className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-b from-scrim-soft to-transparent to-55%" />

        <div className="relative flex h-full flex-col items-center justify-center gap-3 px-6 pt-6 pb-[30%] text-center">
          <Badge className="border-ember-line bg-ember-soft uppercase tracking-[0.18em] text-ember">
            <CircleAlert className="h-3.5 w-3.5" aria-hidden="true" />
            Error 404
          </Badge>
          <PageTitle as="h2" className="max-w-[17ch] text-xl leading-tight text-on-photo">
            This path doesn&apos;t exist, but you can create it.
          </PageTitle>
          <p className="text-sm font-medium text-on-photo-muted">Become a journeyer.</p>
          <ButtonPrimary href={signedIn ? "/dashboard/journeys/new" : "/register"} className="!text-on-photo">
            Get started
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </ButtonPrimary>
        </div>
      </div>

      <div className={SQUARE_CARD} />
    </div>
  );
}
