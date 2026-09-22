import { HighlightedText } from "@/components/common/HighlightedText";

export const metadata = {
  title: "Community Guidelines",
  description: "The rules that keep Zero a place people can trust: real Journeys, respectful community, no shortcuts.",
};

type Group = { title: string; body: string };

const noEngagementBaitNote =
  "Zero has no comments and no ordinary like button (Trusty unlocks only at the end of an episode), and **the algorithm isn't built to reward engagement bait**, so rules built around gaming those mechanics don't apply here.";

const zeroTolerance: string[] = [
  "Sexual content involving minors, in any form, including content generated or manipulated with AI.",
  "Incitement to violence: calls to kill, assault, torture, or hurt someone, credible threats, recruitment to violence, instructions for committing violence, or glorification of attacks and violent groups.",
  "Promotion, glorification, or instructions for self-harm or suicide.",
];

const simpleSections: Group[] = [
  {
    title: "Real People. Real Journeys. Real Experience.",
    body: "Don't fabricate a story, misrepresent who you are, or pass off someone else's Journey as your own. A video doesn't need to show a face every time, but **the author must be a real person or project**, tied to an actual experience, skill, or creation.",
  },
  {
    title: "Disclose sponsorships",
    body: "If a Journey or Episode is sponsored, or you've been paid or given something of value to feature a product or brand, **say so clearly and visibly.** It's the one rule tied directly to how Zero makes money. See the Monetization section of How It Works.",
  },
  {
    title: "Copyright and legal content",
    body: "Don't upload content that's illegal where you or your audience live, that infringes someone else's copyright, or that violates someone's privacy without their consent. See the Copyright & Report Content page for how to report a rights violation.",
  },
  {
    title: "Minimum age",
    body: "**You must be at least 16 years old to create an account on Zero.** We ask for your date of birth when you sign up and won't create an account below that age.",
  },
  {
    title: "Reporting something",
    body: "If you see a Journey, a profile, or anything else that breaks these guidelines, **use the Report button** where you found it. It goes straight to our team for review, no public callout needed.",
  },
  {
    title: "What happens when guidelines are broken",
    body: "Depending on severity: a warning, removal of the specific content, or **suspension of the account.** Confirmed reports against a creator also reduce their Trust Score, on top of any other action taken.",
  },
];

const notAllowedGroups: Group[] = [
  {
    title: "Sexual content and nudity",
    body: "Pornography and sexually explicit content, nudity used to sexualize the body (lingerie, topless, deliberately sexualized poses or framing, fetish content), and thirst traps built mainly to generate sexual attention aren't allowed. **Sexual deepfakes and non-consensual intimate images are never allowed.**",
  },
  {
    title: "Political content",
    body: "Zero isn't built for political campaigns, party activism, or content designed to polarize or mobilize people politically. **Journalism, news, geopolitics, history, and analysis are welcome** when the goal is to inform and document, not to push propaganda.",
  },
  {
    title: "Violence, hate, and dangerous behavior",
    body: "Graphic gore and gratuitous violence, hate speech, discrimination, or dehumanization against people or groups, promotion of drugs or substance abuse, and challenges or content that encourage significant physical risk aren't allowed.",
  },
  {
    title: "Eating disorders and body obsession",
    body: "Pro-ana/pro-mia content, extreme body-checking, and content promoting dangerous weight-loss practices aren't allowed.",
  },
  {
    title: "Deception, scams, and manipulation",
    body: "Deliberate disinformation, misleading deepfakes, phishing, financial scams, promotion of illegal or seriously risky behavior, and content that deliberately exploits people's fears, insecurities, or vulnerabilities for attention or money aren't allowed.",
  },
  {
    title: "Harassment and harmful drama",
    body: "Cyberbullying, public humiliation, revenge content, and targeted harassment of a person aren't allowed. Gossip and drama built mainly to create conflict, humiliation, or toxic entertainment don't belong on Zero either.",
  },
  {
    title: "Misleading advice and empty status",
    body: "Pseudo-experts presenting potentially dangerous advice as real expertise, especially about health, finance, or psychology, don't belong here. Neither do unrealistic promises like guaranteed transformations or get-rich-quick claims, or the ostentation of luxury and status with no other value beyond social comparison.",
  },
  {
    title: "Authenticity",
    body: "Zero is built around real people, real identities, and real accountability. Anonymous accounts or fake identities as a creator's whole model, an AI pretending to be a real person or telling experiences it never lived, reposting someone else's content without adding your own transformation or experience, and spam or automated, duplicated content aren't allowed. A single video without a face isn't automatically against the rules if it belongs to an authentic, valuable project.",
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
          <section>
            <h2 className="text-[1.15rem] font-bold tracking-tight text-ember">Not allowed on Zero</h2>

            <div className="mt-3 rounded-xl border border-danger/30 bg-danger/10 p-4">
              <p className="text-sm font-bold text-danger">Zero tolerance, immediate action</p>
              <p className="mt-1 text-sm leading-relaxed text-ink">
                These are never allowed, with no exceptions. We remove the content immediately, suspend or
                permanently ban the account on the first confirmed case, and report it to the relevant
                authorities when the law requires it.
              </p>
              <ul className="mt-2 space-y-1.5">
                {zeroTolerance.map((item) => (
                  <li key={item} className="text-sm leading-relaxed text-ink">
                    • {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 space-y-5">
              {notAllowedGroups.map((group) => (
                <div key={group.title}>
                  <h3 className="text-[1.01rem] font-bold tracking-tight text-ember">{group.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink">
                    <HighlightedText text={group.body} />
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-6 text-sm leading-relaxed text-ink">
              <HighlightedText text={noEngagementBaitNote} />
            </p>
          </section>

          {simpleSections.map((section) => (
            <section key={section.title}>
              <h2 className="text-[1.15rem] font-bold tracking-tight text-ember">{section.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink">
                <HighlightedText text={section.body} />
              </p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
