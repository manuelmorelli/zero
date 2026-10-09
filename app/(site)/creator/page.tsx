import { ButtonPrimary } from "@/components/ui/button";
import { PageTitle, SectionTitle } from "@/components/ui/heading";
import { PANEL } from "@/components/ui/panel";
import { PAGE_SPACING, PAGE_WIDTH } from "@/components/ui/page-container";

export const metadata = {
  title: "Creator mode | Zero",
  description: "How Creator mode works on Zero: who can publish, how to start, and what happens if you take a break.",
};

// Esportati per Ember (lib/ai/siteAssistant.ts): stesso testo di questa pagina, nessuna copia a parte.
export const STEPS = [
  "Turn on Creator mode in Settings, or when you create your account.",
  "Complete your profile, add your presentation video and accept the Community Guidelines.",
  "Publish your first Journey.",
];

export const CREATOR_MODE_INTRO =
  "On Zero, every account can watch, follow and like. Creator mode is the choice to publish Journeys, episodes and Updates. It is never switched on for you: you choose it, and you can change it at any time in Settings.";

export const VISITOR_DESCRIPTION = "watch Journeys, follow people, like, comment and send messages. You cannot publish.";
export const CREATOR_DESCRIPTION = "everything a visitor can do, plus publish Journeys, episodes and Updates.";

export const INACTIVITY_POLICY_INTRO =
  "We look at when you last published, meaning a new Journey, episode or Update. Publishing anything at any time starts the count again.";
export const INACTIVITY_MILESTONES = [
  "After 6 months: we send you an email.",
  "After 9 months: we send a second email, with one month left.",
  "After 10 months: Creator mode closes. Your Journeys are hidden, and deleted 30 days later unless you turn Creator mode back on.",
];
export const PAUSE_POLICY =
  "Between Journeys? Turn on \"Take a break\" in Settings. Your Journeys stay online, and the first email only comes 10 months after you start the break. Turn it off, or publish, to restart the count.";

export const TURN_OFF_POLICY =
  "Your Journeys are hidden straight away and deleted after 30 days. Turn Creator mode back on within those 30 days to restore them. Your account stays, and you can keep watching.";

export const EARNINGS_STATUS =
  "Creator earnings are not active yet. We will publish the rules on this page before any payment starts.";

export default function CreatorInfoPage() {
  return (
    <main>
      <div className={`${PAGE_WIDTH.narrow} ${PAGE_SPACING}`}>
        <PageTitle>Creator mode</PageTitle>
        <p className="mt-2 text-sm text-ink-muted">{CREATOR_MODE_INTRO}</p>

        <SectionTitle className="mt-8">Visitor or Creator</SectionTitle>
        <div className={`mt-3 space-y-3 ${PANEL}`}>
          <p className="text-sm text-ink-muted">
            <span className="font-semibold text-ink">Visitor:</span> {VISITOR_DESCRIPTION}
          </p>
          <p className="text-sm text-ink-muted">
            <span className="font-semibold text-ink">Creator:</span> {CREATOR_DESCRIPTION}
          </p>
        </div>

        <SectionTitle className="mt-8">How to start</SectionTitle>
        <ol className={`mt-3 list-decimal space-y-2 pl-10 text-sm text-ink-muted ${PANEL}`}>
          {STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>

        <SectionTitle className="mt-8">If you take a break</SectionTitle>
        <div className={`mt-3 space-y-3 ${PANEL}`}>
          <p className="text-sm text-ink-muted">{INACTIVITY_POLICY_INTRO}</p>
          <ul className="space-y-2 text-sm text-ink-muted">
            {INACTIVITY_MILESTONES.map((item) => (
              <li key={item.slice(0, 20)}>{item}</li>
            ))}
          </ul>
          <p className="text-sm text-ink-muted">
            Between Journeys? Turn on <span className="font-semibold text-ink">Take a break</span> in Settings. Your
            Journeys stay online, and the first email only comes 10 months after you start the break. Turn it off, or
            publish, to restart the count.
          </p>
        </div>

        <SectionTitle className="mt-8">If you turn Creator mode off</SectionTitle>
        <p className={`mt-3 text-sm text-ink-muted ${PANEL}`}>{TURN_OFF_POLICY}</p>

        <SectionTitle className="mt-8">Earnings</SectionTitle>
        <p className={`mt-3 text-sm text-ink-muted ${PANEL}`}>{EARNINGS_STATUS}</p>

        <ButtonPrimary href="/settings/creator" className="mt-8">
          Go to Creator settings
        </ButtonPrimary>
      </div>
    </main>
  );
}
