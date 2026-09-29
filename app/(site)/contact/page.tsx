import { PAGE_SPACING, PAGE_WIDTH } from "@/components/ui/page-container";
import { DisplayTitle } from "@/components/ui/heading";

export const metadata = {
  title: "Contact",
  description: "Get in touch with the Zero team.",
};

const CONTACT_EMAIL = "manuel_morelli81@yahoo.com";

export default function ContactPage() {
  return (
    <main>
      <div className={`${PAGE_WIDTH.narrow} ${PAGE_SPACING}`}>
        <DisplayTitle>Contact us</DisplayTitle>
        <p className="mt-3 text-sm text-ink-muted">
          Questions, feedback, or something not working? Write to us directly:
        </p>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="mt-4 inline-block text-lg font-medium text-ink underline underline-offset-2"
        >
          {CONTACT_EMAIL}
        </a>
      </div>
    </main>
  );
}
