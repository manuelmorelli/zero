import { CustomPathForm } from "@/components/moments/CustomPathForm";
import { VideoCard } from "@/components/journey/VideoCard";
import { composeCustomPath } from "@/lib/search/composeCustomPath";
import { isMomentsLibraryEnabled } from "@/lib/ai/episodeMoments";
import { PAGE_SPACING, PAGE_WIDTH } from "@/components/ui/page-container";
import { NOTICE } from "@/components/ui/panel";
import { PageTitle } from "@/components/ui/heading";

export default async function CustomPathPage({
  searchParams,
}: {
  searchParams: Promise<{ situation?: string | string[] }>;
}) {
  const { situation: situationParam } = await searchParams;
  const situation = (Array.isArray(situationParam) ? situationParam[0] : situationParam)?.trim() ?? "";

  if (!isMomentsLibraryEnabled()) {
    return (
      <main>
        <div className={`${PAGE_WIDTH.narrow} ${PAGE_SPACING}`}>
          <PageTitle>Your Path</PageTitle>
          <p className={`mt-6 ${NOTICE}`}>This feature isn&apos;t available yet.</p>
        </div>
      </main>
    );
  }

  const steps = situation ? await composeCustomPath(situation) : [];

  return (
    <main>
      <div className={`${PAGE_WIDTH.narrow} ${PAGE_SPACING}`}>
        <PageTitle>Your Path</PageTitle>
        <p className="mt-2 text-sm text-ink-muted">
          Describe what you&apos;re going through. We&apos;ll look for real moments from other creators who&apos;ve faced
          something similar.
        </p>
        <CustomPathForm defaultValue={situation} className="mt-6" />

        {situation && steps.length === 0 && (
          <p className={`mt-10 ${NOTICE}`}>
            We couldn&apos;t put together a path from this yet. Try describing your situation differently.
          </p>
        )}

        {steps.length > 0 && (
          <div className="mt-10 grid gap-6">
            {steps.map((step, index) => (
              <div key={step.episodeId} className="flex gap-4">
                <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-ember-line bg-ember-soft text-sm font-semibold text-ember">
                  {index + 1}
                </span>
                <VideoCard
                  video={step}
                  className="w-full max-w-sm"
                  footer={<p className="mt-2 text-sm text-ink-muted">{step.reason}</p>}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
