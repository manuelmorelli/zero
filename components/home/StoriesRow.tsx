"use client";

import { useState } from "react";
import { Reveal } from "@/components/common/Reveal";
import { StoryViewer } from "@/components/home/StoryViewer";
import type { CreatorStory } from "@/lib/discovery/stories";

type StoriesRowProps = {
  stories: CreatorStory[];
};

/** Riga di cerchi cliccabili in stile Instagram Stories: solo i creator seguiti con almeno un
 * Update ancora attivo (decisione presa con Manuel), contorno colorato se c'è qualcosa di non
 * ancora visto. Sostituisce la precedente sezione a lista "Updates from creators you follow". */
export function StoriesRow({ stories }: StoriesRowProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (stories.length === 0) return null;

  return (
    <section id="updates" className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <Reveal>
          <h2 className="font-sans text-2xl font-extrabold tracking-tight">Updates</h2>
        </Reveal>

        <Reveal delayMs={60}>
          <div className="mt-6 flex gap-4 overflow-x-auto pb-1">
            {stories.map((story, index) => (
              <button
                key={story.creatorId}
                type="button"
                onClick={() => setOpenIndex(index)}
                className="flex shrink-0 flex-col items-center gap-2"
              >
                <span
                  className={`flex h-16 w-16 items-center justify-center rounded-full p-[2px] ${
                    story.hasUnseen ? "bg-gradient-to-br from-ember to-danger" : "bg-border"
                  }`}
                >
                  <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-bg bg-surface-2 text-sm font-semibold text-ink-muted">
                    {story.creatorAvatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={story.creatorAvatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      story.creatorName.charAt(0).toUpperCase()
                    )}
                  </span>
                </span>
                <span className="max-w-16 truncate text-xs text-ink-muted">{story.creatorName}</span>
              </button>
            ))}
          </div>
        </Reveal>
      </div>

      {openIndex !== null && (
        <StoryViewer stories={stories} initialCreatorIndex={openIndex} onClose={() => setOpenIndex(null)} />
      )}
    </section>
  );
}
