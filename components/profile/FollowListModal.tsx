"use client";

import { createPortal } from "react-dom";
import Link from "next/link";
import { FollowButton } from "@/components/profile/FollowButton";
import type { FollowListPerson } from "@/lib/profile/followList";

type FollowListModalProps = {
  title: string;
  people: FollowListPerson[];
  loading: boolean;
  viewerId: string | null;
  isLoggedIn: boolean;
  onClose: () => void;
};

// Portale su document.body: stesso motivo di components/home/StoryViewer.tsx, la sezione della
// foto profilo ha isolation: isolate e intrappolerebbe altrimenti l'overlay al suo interno.
export function FollowListModal({ title, people, loading, viewerId, isLoggedIn, onClose }: FollowListModalProps) {
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-scrim px-4 py-8"
      onClick={onClose}
    >
      <div
        className="flex max-h-[80vh] w-full max-w-sm flex-col overflow-hidden rounded-xl border border-border bg-surface"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <p className="text-sm font-semibold text-ink">{title}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-ink-muted transition-colors hover:text-ink"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto">
          {loading ? (
            <p className="p-5 text-sm text-ink-muted">Loading…</p>
          ) : people.length === 0 ? (
            <p className="p-5 text-sm text-ink-muted">Nobody here yet.</p>
          ) : (
            people.map((person) => (
              <PersonRow key={person.id} person={person} viewerId={viewerId} isLoggedIn={isLoggedIn} />
            ))
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

function PersonRow({
  person,
  viewerId,
  isLoggedIn,
}: {
  person: FollowListPerson;
  viewerId: string | null;
  isLoggedIn: boolean;
}) {
  const isSelf = viewerId === person.id;

  return (
    <div className="flex items-center gap-3 border-b border-border px-5 py-3 last:border-0">
      <Link href={`/profile/${person.username ?? person.id}`} className="flex min-w-0 flex-1 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-2 text-sm font-semibold text-ink-muted">
          {person.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={person.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            person.name.charAt(0).toUpperCase()
          )}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-ink">{person.name}</span>
          {person.username && <span className="block truncate text-sm text-ink-muted">@{person.username}</span>}
        </span>
      </Link>

      {isLoggedIn && !isSelf && (
        <FollowButton userId={person.id} initialIsFollowing={person.isFollowedByViewer} isLoggedIn={isLoggedIn} />
      )}
    </div>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} className={className} aria-hidden="true">
      <path d="M5 5l10 10M15 5 5 15" strokeLinecap="round" />
    </svg>
  );
}
