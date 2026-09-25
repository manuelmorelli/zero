"use client";

import { useActionState } from "react";
import { publishCommunityListing, unpublishCommunityListing } from "@/lib/actions/communityListing";
import { NotifyFollowersButton } from "@/components/creator/NotifyFollowersButton";
import type { CommunityListingType } from "@/lib/constants/communityListing";

type Status = "DRAFT" | "ACTIVE" | "SUSPENDED" | "ARCHIVED";

/** Stessa idea di JourneyPublishControl: qui in più c'è "Notify your followers", che compare solo
 * dopo la pubblicazione e non parte mai da solo (vedi NotifyFollowersButton). */
export function CommunityListingStatusControl({
  listingId,
  listingType,
  title,
  status,
}: {
  listingId: string;
  listingType: CommunityListingType;
  title: string;
  status: Status;
}) {
  if (status === "DRAFT") {
    return <PublishForm listingId={listingId} listingType={listingType} />;
  }

  if (status === "ACTIVE") {
    return (
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="rounded-full bg-ember/15 px-3 py-1.5 text-xs font-semibold text-ember">Published</span>
        <NotifyFollowersButton listingId={listingId} listingType={listingType} title={title} />
        <UnpublishForm listingId={listingId} listingType={listingType} />
      </div>
    );
  }

  return null;
}

function PublishForm({ listingId, listingType }: { listingId: string; listingType: CommunityListingType }) {
  const [state, formAction, pending] = useActionState(publishCommunityListing, { error: null });

  return (
    <form action={formAction} className="flex flex-col items-start gap-2">
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="listingType" value={listingType} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-bg transition-colors hover:bg-ink-muted disabled:opacity-50"
      >
        {pending ? "Publishing…" : "Publish"}
      </button>
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
    </form>
  );
}

function UnpublishForm({ listingId, listingType }: { listingId: string; listingType: CommunityListingType }) {
  const [state, formAction, pending] = useActionState(unpublishCommunityListing, { error: null });

  return (
    <form action={formAction} className="flex flex-col items-start gap-2">
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="listingType" value={listingType} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-ink-muted transition-colors hover:border-ink-muted disabled:opacity-50"
      >
        {pending ? "…" : "Move back to Draft"}
      </button>
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
    </form>
  );
}
