import { requireCreator } from "@/lib/creator";
import { JourneyForm } from "@/components/creator/JourneyForm";
import { PageTitle } from "@/components/ui/heading";

export default async function NewJourneyPage() {
  await requireCreator();

  return (
    <main>
      <div className="flex min-h-screen items-center justify-center px-6 pb-16 pt-24">
        <div className="w-full max-w-lg">
          <PageTitle>
            Create Your Journey
          </PageTitle>
          <p className="mt-2 text-sm text-ink-muted">
            Tell us about the path you&apos;re about to document. You&apos;ll be able to add Chapters and Episodes right after.
          </p>

          <div className="mt-8">
            <JourneyForm />
          </div>
        </div>
      </div>
    </main>
  );
}
