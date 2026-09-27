"use client";

import { useState } from "react";
import { ArrowLeft, Pencil, Sparkles } from "lucide-react";
import { CommunityAiChat } from "@/components/creator/CommunityAiChat";
import { CommunityListingForm, type CommunityListingDraft } from "@/components/creator/CommunityListingForm";
import { COMMUNITY_LISTING_LABELS, COMMUNITY_LISTING_TYPES, type CommunityListingType } from "@/lib/constants/communityListing";
import { markCommunityAiDraftUsed } from "@/lib/communityAiChatStorage";

type Mode = "choose" | "manual-pick-type" | "manual-form" | "ai-chat" | "ai-form";

export function NewCommunityListingClient({
  userId,
  creatorFirstName,
}: {
  userId: string;
  creatorFirstName: string | null;
}) {
  const [mode, setMode] = useState<Mode>("choose");
  const [type, setType] = useState<CommunityListingType | null>(null);
  const [draft, setDraft] = useState<CommunityListingDraft | null>(null);

  if (mode === "choose") {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setMode("manual-pick-type")}
          className="flex flex-col items-start gap-2 rounded-2xl border border-border bg-surface p-6 text-left transition-colors hover:border-ink-muted"
        >
          <Pencil className="h-5 w-5 text-ink-muted" aria-hidden="true" />
          <span className="text-sm font-semibold text-ink">Write it yourself</span>
          <span className="text-xs text-ink-muted">Fill in a simple empty form.</span>
        </button>
        <button
          type="button"
          onClick={() => setMode("ai-chat")}
          className="flex flex-col items-start gap-2 rounded-2xl border border-ember/20 bg-gradient-to-b from-ember/8 to-white/[0.02] p-6 text-left backdrop-blur-md transition-colors hover:from-ember/15"
        >
          <Sparkles className="h-5 w-5 text-ember" aria-hidden="true" />
          <span className="text-sm font-semibold text-ink">Describe it to the AI</span>
          <span className="text-xs text-ink-muted">Chat in your own words, then review the draft.</span>
        </button>
      </div>
    );
  }

  if (mode === "manual-pick-type") {
    return (
      <div>
        <BackButton onClick={() => setMode("choose")} />
        <p className="mb-4 text-sm text-ink-muted">What do you want to create?</p>
        <div className="grid grid-cols-2 gap-3">
          {COMMUNITY_LISTING_TYPES.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setType(option);
                setMode("manual-form");
              }}
              className="rounded-xl border border-border bg-surface px-4 py-3.5 text-sm font-semibold text-ink transition-colors hover:border-ink-muted"
            >
              {COMMUNITY_LISTING_LABELS[option]}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (mode === "manual-form" && type) {
    return (
      <div>
        <BackButton onClick={() => setMode("manual-pick-type")} />
        <h2 className="mb-4 text-base font-semibold text-ink">New {COMMUNITY_LISTING_LABELS[type]}</h2>
        <CommunityListingForm type={type} />
      </div>
    );
  }

  if (mode === "ai-chat") {
    return (
      <div>
        <BackButton onClick={() => setMode("choose")} />
        <CommunityAiChat
          userId={userId}
          creatorFirstName={creatorFirstName}
          onDraftReady={(pending) => {
            setType(pending.type);
            setDraft(pending.draft);
            setMode("ai-form");
          }}
        />
      </div>
    );
  }

  if (mode === "ai-form" && type && draft) {
    return (
      <div>
        <BackButton onClick={() => setMode("ai-chat")} />
        <p className="mb-4 rounded-lg border border-ember/20 bg-ember/5 px-3.5 py-2.5 text-xs text-ink-muted">
          Review what the AI drafted below, change anything you like, then create it. Nothing is saved yet.
        </p>
        <h2 className="mb-4 text-base font-semibold text-ink">New {COMMUNITY_LISTING_LABELS[type]}</h2>
        <CommunityListingForm
          type={type}
          initialDraft={draft}
          onSubmitted={() => markCommunityAiDraftUsed(userId)}
        />
      </div>
    );
  }

  return null;
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted transition-colors hover:text-ink"
    >
      <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
      Back
    </button>
  );
}
