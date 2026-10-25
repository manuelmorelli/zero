import { ButtonSecondary } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/heading";
import { Panel } from "@/components/ui/panel";

/**
 * Consiglio forte, non obbligatorio, di leggere What is Zero e le Community Guidelines appena
 * iscritti. L'accettazione vera resta una sola, la casella in fondo a /community-guidelines
 * (vedi components/common/GuidelinesAcceptance.tsx). I link aprono una nuova scheda per non far
 * perdere la scelta degli interessi a metà.
 */
export function OnboardingReadingTips() {
  return (
    <Panel accent>
      <SectionTitle>Before you start</SectionTitle>
      <p className="mt-1 text-sm leading-relaxed text-ink-muted">
        We strongly recommend reading these two pages. They explain what Zero is about and how we
        treat each other here. You&apos;ll need to accept the Community Guidelines before publishing,
        and you can do it now.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <ButtonSecondary href="/what-is-zero" target="_blank" rel="noopener noreferrer">
          What is Zero
        </ButtonSecondary>
        <ButtonSecondary href="/community-guidelines" target="_blank" rel="noopener noreferrer">
          Community Guidelines
        </ButtonSecondary>
      </div>
    </Panel>
  );
}
