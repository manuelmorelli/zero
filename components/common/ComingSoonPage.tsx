import { PAGE_SPACING, PAGE_WIDTH } from "@/components/ui/page-container";
import { PageTitle } from "@/components/ui/heading";
export function ComingSoonPage({ title, description }: { title: string; description: string }) {
  return (
    <main className="flex min-h-screen flex-col justify-center">
      <div className={`${PAGE_WIDTH.narrow} ${PAGE_SPACING}`}>
        <PageTitle>{title}</PageTitle>
        <p className="mt-2 text-sm text-ink-muted">{description}</p>
      </div>
    </main>
  );
}
