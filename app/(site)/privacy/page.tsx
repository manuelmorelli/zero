import { HighlightedText } from "@/components/common/HighlightedText";
import { PAGE_SPACING, PAGE_WIDTH } from "@/components/ui/page-container";
import { DisplayTitle, ReadingTitle } from "@/components/ui/heading";

export const metadata = {
  title: "Privacy Policy",
  description: "What data Zero collects, why, and the rights you have over it.",
};

type Section = { title: string; body: string[] };

// Esportato così Ember (l'assistente del sito, lib/ai/siteAssistant.ts) legge lo stesso testo
// mostrato qui, invece di una copia separata che rischierebbe di disallinearsi.
export const sections: Section[] = [
  {
    title: "What this covers",
    body: [
      "This policy explains what personal data Zero collects when you use the app, why, who it's shared with, and the rights you have over it. Zero is currently a project in active development and hasn't been through a public launch yet, but **this policy already reflects exactly what the running app does today, not a future promise.**",
    ],
  },
  {
    title: "Information we collect",
    body: [
      "Account information: your name, email address, a securely hashed password (**we never store or see your actual password**), and your date of birth, collected to confirm you meet the minimum age to use Zero.",
      "Profile information you choose to share: username, bio, profile photo, cover photo, location, and the interest categories you pick. All of this is shown on your public profile.",
      "Content you create: your Journeys, Episodes, Updates, and any messages you send to other users.",
      "Community content: the workshops, events, digital products, and 1:1 services you create, and the free events you sign up for with \"I'm going\".",
      "Conversations with Zero's AI assistant: the messages you write and any photos or PDFs you attach while using it to prepare a Community listing.",
      "Technical information tied to your login sessions: IP address and browser/device information, used to keep your account secure.",
    ],
  },
  {
    title: "How we use it",
    body: [
      "To run your account and show your public content to other users the way you've set it up.",
      "To send you account-related emails: confirming your email address, and resetting your password if you ask to. **We don't send marketing email.**",
      "To keep the platform secure and to review reports made about content, including yours if it's reported.",
    ],
  },
  {
    title: "Who we share it with",
    body: [
      "Zero runs on a small set of infrastructure providers who process data on our behalf, under their own security commitments: Neon (our database, which stores the information above), Cloudflare R2 (stores the photos and videos you upload), and Resend (sends the account emails described above).",
      "Google (Gemini) powers two features: the automatic check that screens new text and images for content that breaks our Community Guidelines, and the AI assistant that helps creators prepare Community listings. For these, Google receives the text and images being checked, and your conversations with the assistant, including any attachments. **Zero currently uses Google's free tier, under which Google may use this data to improve its own products.**",
      "**We don't sell personal data to anyone, and we don't use advertising or analytics trackers.** See the Cookie Policy for the full, short list of cookies we use.",
      "Zero doesn't process payments yet. When payments launch, Stripe will handle that data directly, and this policy will be updated to reflect it before that happens.",
    ],
  },
  {
    title: "How long we keep it",
    body: [
      "We keep your data while your account is active. If you delete your account, it's hidden from everyone immediately and enters a **10-day grace period**, during which logging back in cancels the deletion. **After 10 days, everything is permanently and automatically erased**: your Journeys, Episodes, Updates, messages, and uploaded media, with no residue left behind in other people's content either.",
    ],
  },
  {
    title: "Your rights",
    body: [
      "You can access and correct most of your information directly in Settings. You can request a copy of your data or ask us to delete it by using the Report feature to reach our team (a dedicated contact channel is coming before public launch).",
      "If you're in the EU or UK, this includes the rights guaranteed by the **GDPR**: access, correction, deletion, and data portability. If you're a California resident, this includes the rights guaranteed by the **CCPA**: the right to know what we collect and to have it deleted. **We don't sell personal information, so there's nothing to opt out of.**",
    ],
  },
  {
    title: "Minimum age",
    body: [
      "**You must be at least 16 years old to create an account on Zero.** We check your date of birth when you sign up.",
    ],
  },
  {
    title: "Changes to this policy",
    body: [
      "If something material changes in what data we collect or how we use it, we'll update this page. Significant changes will also be reflected in the roadmap we keep as we prepare Zero for public launch.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main>
      <div className={`${PAGE_WIDTH.narrow} ${PAGE_SPACING}`}>
        <DisplayTitle>Privacy Policy</DisplayTitle>
        <p className="mt-3 text-sm text-ink-muted">
          What we collect, why, and the rights you have over it.
        </p>

        <div className="mt-5 space-y-4">
          {sections.map((section) => (
            <section key={section.title}>
              <ReadingTitle>{section.title}</ReadingTitle>
              <div className="mt-1 space-y-1.5">
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
