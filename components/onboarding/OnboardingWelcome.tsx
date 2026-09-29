import { DisplayTitle } from "@/components/ui/heading";
type OnboardingWelcomeProps = {
  name: string;
};

/**
 * Titolo di apertura della pagina onboarding, non un banner separato: l'utente
 * la vede una sola volta per natura del flusso (dopo aver scelto gli interessi
 * non torna più su /onboarding, vedi redirect in app/onboarding/page.tsx).
 */
export function OnboardingWelcome({ name }: OnboardingWelcomeProps) {
  const firstName = name.trim().split(/\s+/)[0] ?? name;

  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-ember-soft blur-[90px]"
      />
      <div className="relative">
        <DisplayTitle className="text-balance">
          Welcome to <span className="text-ember">Zero</span>, {firstName}.
        </DisplayTitle>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-muted text-balance">
          You&apos;re not just here to watch. You&apos;re here to inspire and to be inspired.
        </p>
      </div>
    </div>
  );
}
