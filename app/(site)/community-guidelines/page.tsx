export const metadata = {
  title: "Community Guidelines",
  description: "The rules that keep Zero a place people can trust: real Journeys, respectful community, no shortcuts.",
};

type Section = { title: string; body: string[] };

const sections: Section[] = [
  {
    title: "Be real",
    body: [
      "Zero is built around real Journeys: paths documented as they actually happen. Don't fabricate a story, misrepresent who you are, or pass off someone else's Journey as your own.",
    ],
  },
  {
    title: "Respect people",
    body: [
      "Harassment, hate speech, threats, bullying, and targeted abuse are never allowed, whether toward creators, viewers, or anyone mentioned in a Journey.",
      "Sexual content involving minors, non-consensual content, and content that exploits or endangers anyone is never allowed and will be removed on sight.",
    ],
  },
  {
    title: "Stay legal",
    body: [
      "Don't upload content that's illegal where you or your audience live, that infringes someone else's copyright, or that violates someone's privacy without their consent.",
      "See the Copyright & Report Content page for how to report a rights violation.",
    ],
  },
  {
    title: "Disclose sponsorships",
    body: [
      "If a Journey or Episode is sponsored, or you've been paid or given something of value to feature a product or brand, say so clearly and visibly. It's the one rule tied directly to how Zero makes money. See the Monetization section of How It Works.",
    ],
  },
  {
    title: "Minimum age",
    body: ["You must be at least 16 years old to create an account on Zero."],
  },
  {
    title: "Reporting something",
    body: [
      "If you see a Journey, a profile, or anything else that breaks these guidelines, use the Report button where you found it. It goes straight to our team for review (no public callout needed).",
    ],
  },
  {
    title: "What happens when guidelines are broken",
    body: [
      "Depending on severity: a warning, removal of the specific content, or suspension of the account. Confirmed reports against a creator also reduce their Trust Score, on top of any other action taken.",
    ],
  },
];

export default function CommunityGuidelinesPage() {
  return (
    <main>
      <div className="mx-auto max-w-2xl px-6 pb-16 pt-24">
        <h1 className="text-2xl font-extrabold tracking-tight">Community Guidelines</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Zero only works if people can trust what they see here. These are the rules that keep it that way.
        </p>

        <div className="mt-8 space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-base font-bold tracking-tight">{section.title}</h2>
              <div className="mt-2 space-y-2">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-relaxed text-ink-muted">
                    {paragraph}
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
