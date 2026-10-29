import { Theme } from "@/generated/prisma/client";
import { getThemeFromCookie } from "@/lib/theme";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { SandBackground } from "@/components/common/SandBackground";
import { Inbox } from "@/components/layout/Inbox";

// Header comune a tutte le pagine "principali" del sito (raggruppate qui via route group,
// che non compare nell'URL): prima restava montato dentro ogni singola pagina e veniva
// smontato/rimontato da zero a ogni cambio pagina, con un salto visibile del menu in alto.
// Qui invece resta in vita per tutta la navigazione tra queste pagine, solo il contenuto sotto
// cambia. Le pagine di autenticazione (login, registrazione, onboarding) restano fuori da
// questo gruppo: hanno un header diverso (AuthHeader), non questo.
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const theme = await getThemeFromCookie();

  return (
    <>
      {/* Sotto i 768px l'Inbox vive nella "mensola" dell'header (vedi Header.tsx, accanto a
       * Ember): un unico contenitore con un solo spazio tra le icone, non più due posizioni
       * calcolate a mano. Da tablet in su invece l'header ha lo sfondo sfocato (backdrop-blur),
       * che per il CSS "intrappola" dentro di sé ogni elemento a posizione fissa — l'Inbox
       * perdeva così il suo posto vero in basso a destra, sopra il tasto "+". Per questo da
       * tablet in su resta fuori dall'header, nella sua posizione originale. */}
      <Header inbox={<div className="md:hidden"><Inbox /></div>} />
      {/* Sfondo di sabbia dorata: decide da solo su quali pagine comparire. Pensato per lo sfondo
       * scuro, quindi spento nel tema chiaro (quelle pagine mostrano il semplice sfondo chiaro). */}
      {theme !== Theme.LIGHT && <SandBackground />}
      {children}
      <div className="hidden md:block">
        <Inbox />
      </div>
      {/* Solo sotto i 768px (md): vedi BottomNav.tsx. Qui e non in app/layout.tsx, così le pagine
       * di autenticazione (fuori da questo gruppo di route) non la mostrano. */}
      <BottomNav />
    </>
  );
}
