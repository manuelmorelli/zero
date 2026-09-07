"use client";

import { useState } from "react";
import Image from "next/image";
import { FadeImage } from "@/components/common/FadeImage";
import { Plus } from "lucide-react";
import { StoryViewer } from "@/components/home/StoryViewer";
import { useQuickUpload } from "@/components/creator/QuickUploadButton";
import type { CreatorStory } from "@/lib/discovery/stories";

type ProfileAvatarStoryProps = {
  avatarUrl: string | null;
  name: string;
  isOwnProfile: boolean;
  /** null quando questo profilo non ha un Creator (mai stato Update attivo possibile). */
  activeStory: CreatorStory | null;
};

/** Foto profilo tonda con anello arancione quando il creator ha un Update attivo (su qualunque
 * profilo, non solo il proprio — un tocco lo apre, come le Stories di Instagram) e, solo sul
 * proprio profilo, un pulsante "+" per pubblicarne uno nuovo. */
export function ProfileAvatarStory({ avatarUrl, name, isOwnProfile, activeStory }: ProfileAvatarStoryProps) {
  const [storyOpen, setStoryOpen] = useState(false);
  const quickUpload = useQuickUpload();
  const hasActiveUpdate = Boolean(activeStory && activeStory.updates.length > 0);

  return (
    <div className="relative shrink-0">
      <div
        className={`relative h-28 w-28 rounded-full md:h-32 md:w-32 ${
          hasActiveUpdate ? "ring-2 ring-ember ring-offset-2 ring-offset-bg" : ""
        }`}
      >
        <AvatarPhoto
          avatarUrl={avatarUrl}
          name={name}
          asButton={hasActiveUpdate}
          onClick={() => setStoryOpen(true)}
        />
      </div>

      {isOwnProfile && (
        <button
          type="button"
          onClick={() => quickUpload?.openPostUpdate()}
          aria-label="Post an Update"
          className="absolute bottom-0.5 right-0.5 z-20 flex h-8 w-8 items-center justify-center rounded-full border-2 border-bg bg-ember text-bg shadow-md transition-transform hover:scale-105 active:scale-95"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
        </button>
      )}

      {storyOpen && activeStory && (
        <StoryViewer
          stories={[activeStory]}
          initialCreatorIndex={0}
          isOwner={isOwnProfile}
          onClose={() => setStoryOpen(false)}
        />
      )}
    </div>
  );
}

function AvatarPhoto({
  avatarUrl,
  name,
  asButton,
  onClick,
}: {
  avatarUrl: string | null;
  name: string;
  asButton: boolean;
  onClick: () => void;
}) {
  const content = (
    <div className="relative h-full w-full overflow-hidden rounded-full">
      {avatarUrl ? (
        <FadeImage src={avatarUrl} alt={name} fill sizes="128px" className="object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-surface-2 text-2xl font-bold text-ink-muted">
          {name.charAt(0).toUpperCase()}
        </div>
      )}
      <Image
        src="/images/zero-o-ring.png"
        alt=""
        fill
        sizes="154px"
        className="pointer-events-none absolute inset-0 z-10 scale-[1.2] object-cover"
      />
    </div>
  );

  if (!asButton) return content;

  return (
    <button type="button" onClick={onClick} aria-label={`View ${name}'s Update`} className="h-full w-full rounded-full">
      {content}
    </button>
  );
}
