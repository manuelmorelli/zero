import { ErrorState } from "@/components/ui/error-state";

/** Pagina "non trovata" unica del sito, usata sia dentro il gruppo (site) sia per gli indirizzi
 * sbagliati in generale (app/not-found.tsx). */
export function NotFoundState() {
  return (
    <ErrorState
      title="Page not found"
      message="This page doesn't exist, or it's been moved."
      links={[
        { label: "Home", href: "/" },
        { label: "Journeys", href: "/journeys" },
      ]}
    />
  );
}
