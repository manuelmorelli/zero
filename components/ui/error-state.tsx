import { PageContainer } from "@/components/ui/page-container";
import { PageTitle } from "@/components/ui/heading";
import { PANEL_DANGER } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";

type ErrorStateProps = {
  title: string;
  message: string;
  onRetry?: () => void;
};

/** Riquadro di cortesia per le pagine di errore e "non trovata": niente stack trace o
 * schermate bianche, solo un messaggio semplice e un modo per uscirne. */
export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  return (
    <PageContainer spacing={false} className="flex min-h-[70vh] items-center justify-center">
      <div className={`${PANEL_DANGER} max-w-md text-center`}>
        <PageTitle>{title}</PageTitle>
        <p className="mt-2 text-ink-muted">{message}</p>
        <div className="mt-5 flex items-center justify-center gap-3">
          {onRetry && <Button onClick={onRetry}>Try again</Button>}
          <Button variant="secondary" href="/">
            Back to Home
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
