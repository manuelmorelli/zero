import { PageContainer } from "@/components/ui/page-container";
import { PageTitle } from "@/components/ui/heading";
import { PANEL_DANGER } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";

type ErrorStateProps = {
  title: string;
  message: string;
  onRetry?: () => void;
  /** Uscite alternative al solo "Back to Home" (es. la pagina "non trovata": Home e Journeys). */
  links?: { label: string; href: string }[];
};

/** Riquadro di cortesia per le pagine di errore e "non trovata": niente stack trace o
 * schermate bianche, solo un messaggio semplice e un modo per uscirne. */
export function ErrorState({ title, message, onRetry, links }: ErrorStateProps) {
  return (
    <PageContainer spacing={false} className="flex min-h-[70vh] items-center justify-center pt-24">
      <div className={`${PANEL_DANGER} max-w-md text-center`}>
        <PageTitle>{title}</PageTitle>
        <p className="mt-2 text-ink-muted">{message}</p>
        <div className="mt-5 flex items-center justify-center gap-3">
          {onRetry && <Button onClick={onRetry}>Try again</Button>}
          {(links ?? [{ label: "Back to Home", href: "/" }]).map((link) => (
            <Button key={link.href} variant="secondary" href={link.href}>
              {link.label}
            </Button>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
