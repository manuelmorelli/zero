import { HighlightedText } from "@/components/common/HighlightedText";

export const metadata = {
  title: "Terms of Service",
  description: "The terms that govern using Zero.",
};

type Section = { title: string; body: string[] };

const sections: Section[] = [
  {
    title: "Agreeing to these terms",
    body: [
      "By creating an account on Zero, you agree to these terms, our Community Guidelines, our Copyright & Report Content page, and our Privacy Policy. **Zero is currently a project in active development, not yet operated by a registered company or launched publicly.** These terms will be updated to name the operating entity and the governing jurisdiction before public launch.",
    ],
  },
  {
    title: "Who can use Zero",
    body: [
      "**You must be at least 16 years old to create an account.** You must provide accurate information when you sign up, and you're responsible for keeping your login credentials secure. One account per person.",
    ],
  },
  {
    title: "Your content",
    body: [
      "You own what you create and post on Zero. By posting it, you give Zero the right to host, store, and display it to other users so the app can work the way it's designed to, nothing more.",
      "Everything you post must follow our Community Guidelines. **If a Journey or Episode is sponsored, or you were paid or given something of value to feature a product or brand, you must disclose it clearly**, as required by the Community Guidelines.",
    ],
  },
  {
    title: "How Zero ranks content",
    body: [
      "**Paying doesn't get you seen more on Zero.** Visibility is driven by the Journey Score, based on real signals like completion and engagement, never by payment. See the Algorithm section of How It Works for the full explanation.",
    ],
  },
  {
    title: "Payments and creator earnings",
    body: [
      "Zero doesn't process real payments yet. Once payment features launch, they'll be covered by their own terms describing fees, payout schedules, and how creator earnings work, and you'll be asked to accept those before using them.",
    ],
  },
  {
    title: "Suspension and termination",
    body: [
      "You can delete your account at any time from Settings. **Deletion has a 10-day grace period** during which you can reverse it by logging back in; after that, it's permanent.",
      "We can remove content, suspend, or **permanently ban an account** that breaks our Community Guidelines or these terms, depending on severity, as described in the Community Guidelines.",
    ],
  },
  {
    title: "No guarantees",
    body: [
      "**Zero is provided as is, without guarantees about uninterrupted availability, results, reach, or earnings.** We work to keep the service reliable and safe, but we can't promise it will always be error-free.",
      "You're responsible for the content you post. Zero isn't responsible for content posted by other users, though we do act on confirmed reports as described in the Community Guidelines.",
    ],
  },
  {
    title: "Changes to these terms",
    body: [
      "If we make a material change to these terms, we'll update this page. Significant changes will also be reflected in the roadmap we keep as we prepare Zero for public launch.",
    ],
  },
];

export default function TermsPage() {
  return (
    <main>
      <div className="mx-auto max-w-2xl px-6 pb-16 pt-24">
        <h1 className="text-2xl font-extrabold tracking-tight">Terms of Service</h1>
        <p className="mt-2 text-sm text-ink-muted">
          The terms that govern using Zero.
        </p>

        <div className="mt-8 space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-[1.15rem] font-bold tracking-tight text-ember">{section.title}</h2>
              <div className="mt-2 space-y-2">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-relaxed text-ink">
                    <HighlightedText text={paragraph} />
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
