import { HighlightedText } from "@/components/common/HighlightedText";
import { PAGE_SPACING, PAGE_WIDTH } from "@/components/ui/page-container";
import { DisplayTitle, ReadingTitle } from "@/components/ui/heading";

export const metadata = {
  title: "Copyright & Report Content",
  description: "How copyright works on Zero, and how to report content that shouldn't be here.",
};

type Section = { title: string; body: string[] };

const sections: Section[] = [
  {
    title: "Your content, your rights",
    body: [
      "Only upload video, photos, or other material you own or have the rights to use. That includes footage of other people appearing in your Journey. **Get their consent before you publish.**",
    ],
  },
  {
    title: "Reporting a copyright issue",
    body: [
      "If a Journey, Episode, or Update uses your work without permission, use the Report button on that content and choose \"Copyright violation\" as the reason. Include as much detail as you can (a link to the original work, and how the use infringes it) so it can be reviewed quickly.",
      "We review every report and remove infringing content once confirmed. **Repeated confirmed violations lead to account suspension.**",
    ],
  },
  {
    title: "Reporting anything else",
    body: [
      "The same Report button works for any content that breaks our Community Guidelines, like spam, inappropriate content, harassment, or anything else that doesn't belong here. You'll find it on Journey pages and on profiles.",
      "Reports go directly to our team, not to a public queue. **Every report is looked at by a person.**",
    ],
  },
  {
    title: "Automatic screening",
    body: [
      "Newly uploaded text and photos are also checked automatically for content that clearly breaks our guidelines, before they're published. This is a first layer, not a replacement for reporting. **It doesn't cover video**, and it can miss things, so please still report anything you come across.",
    ],
  },
];

export default function CopyrightPage() {
  return (
    <main>
      <div className={`${PAGE_WIDTH.narrow} ${PAGE_SPACING}`}>
        <DisplayTitle>Copyright & Report Content</DisplayTitle>
        <p className="mt-3 text-sm text-ink-muted">
          What you can upload, and how to flag something that shouldn&apos;t be on Zero.
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
