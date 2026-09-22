import { HighlightedText } from "@/components/common/HighlightedText";

export const metadata = {
  title: "Cookie Policy",
  description: "What cookies Zero uses, and why there's no cookie banner.",
};

type Section = { title: string; body: string[] };

const sections: Section[] = [
  {
    title: "The short version",
    body: [
      "**Zero only uses the small number of cookies needed to keep you logged in.** We don't use advertising cookies, analytics trackers, or any third-party tool that follows you around the web. That's also why **you don't see a cookie consent banner here**: the law only requires one for cookies that aren't strictly necessary to run the service, and we don't set any.",
    ],
  },
  {
    title: "Cookies we use",
    body: [
      "**better-auth.session_token**: keeps you signed in after you log in, for about 7 days. Without it you'd have to log in again on every visit.",
      "A couple of small, short-lived technical cookies (a few minutes) used by the login system to avoid repeated database lookups. Neither carries advertising or tracking data.",
      "All of these are managed by Better Auth, the authentication system Zero runs on, and are essential to the service: they exist only so you can log in and stay logged in.",
    ],
  },
  {
    title: "Local storage",
    body: [
      "One setting is saved directly in your browser (not a cookie): whether you've closed the \"complete your profile\" banner. **It holds no personal data and isn't read by anyone but your own browser.**",
    ],
  },
  {
    title: "Changes to this policy",
    body: [
      "If Zero adds analytics or advertising in the future, **this page will be updated first, and a cookie consent banner will be added before any non-essential cookie is set, not after.**",
    ],
  },
];

export default function CookiesPage() {
  return (
    <main>
      <div className="mx-auto max-w-2xl px-6 pb-16 pt-24">
        <h1 className="text-2xl font-extrabold tracking-tight">Cookie Policy</h1>
        <p className="mt-2 text-sm text-ink-muted">
          What cookies Zero uses, and why that list is short.
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
