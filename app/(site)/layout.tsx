import { Header } from "@/components/layout/Header";

// Header comune a tutte le pagine "principali" del sito (raggruppate qui via route group,
// che non compare nell'URL): prima restava montato dentro ogni singola pagina e veniva
// smontato/rimontato da zero a ogni cambio pagina, con un salto visibile del menu in alto.
// Qui invece resta in vita per tutta la navigazione tra queste pagine, solo il contenuto sotto
// cambia. Le pagine di autenticazione (login, registrazione, onboarding) restano fuori da
// questo gruppo: hanno un header diverso (AuthHeader), non questo.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
