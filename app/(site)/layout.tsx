import { Theme } from "@/generated/prisma/client";
import { getThemeFromCookie } from "@/lib/theme";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { SandBackground } from "@/components/common/SandBackground";

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
      <Header />
      {/* Sfondo di sabbia dorata: decide da solo su quali pagine comparire. Pensato per lo sfondo
       * scuro, quindi spento nel tema chiaro (quelle pagine mostrano il semplice sfondo chiaro). */}
      {theme !== Theme.LIGHT && <SandBackground />}
      {children}
      {/* Solo sotto i 768px (md): vedi BottomNav.tsx. Qui e non in app/layout.tsx, così le pagine
       * di autenticazione (fuori da questo gruppo di route) non la mostrano. */}
      <BottomNav />
    </>
  );
}
