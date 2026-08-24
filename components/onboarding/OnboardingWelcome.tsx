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
        className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-ember/20 blur-[90px]"
      />
      <div className="relative">
        <h1 className="text-4xl leading-tight font-extrabold tracking-tight text-balance sm:text-5xl">
          Welcome to <span className="text-ember">Zero</span>, {firstName}.
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-muted text-balance">
          You&apos;re not just here to watch. You&apos;re here to inspire and to be inspired.
        </p>
      </div>
    </div>
  );
}
