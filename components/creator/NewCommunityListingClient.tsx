"use client";

import { useState, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import { Pencil, Sparkles } from "lucide-react";
import { CommunityAiChat } from "@/components/creator/CommunityAiChat";
import { CommunityListingForm, type CommunityListingDraft } from "@/components/creator/CommunityListingForm";
import { COMMUNITY_LISTING_LABELS, COMMUNITY_LISTING_TYPES, type CommunityListingType } from "@/lib/constants/communityListing";
import { markCommunityAiDraftUsed } from "@/lib/communityAiChatStorage";

// Il passaggio della pagina sta nell'indirizzo (?step=...), non solo in memoria: così la freccia
// arancione "Back" dell'header (che fa come il tasto indietro del browser) torna al passaggio
// precedente, e non serve più una seconda freccia dentro la pagina (tolta su richiesta di Manuel
// il 2026-09-29: "ne abbiamo già una, basta e avanza").
const STEP_WRITE = "write";
const STEP_AI = "ai";
const STEP_AI_FORM = "ai-form";

function goToStep(params: Record<string, string>) {
  window.history.pushState(null, "", `?${new URLSearchParams(params).toString()}`);
}

function isListingType(value: string | null): value is CommunityListingType {
  return COMMUNITY_LISTING_TYPES.some((option) => option === value);
}

const noopSubscribe = () => () => {};

/** La chat legge la conversazione salvata nel browser: va mostrata solo lato browser, altrimenti
 * la versione preparata dal server (senza conversazione) non coincide con quella vera. */
function useIsClient(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

export function NewCommunityListingClient({
  userId,
  creatorFirstName,
}: {
  userId: string;
  creatorFirstName: string | null;
}) {
  const searchParams = useSearchParams();
  const step = searchParams.get("step");
  const typeParam = searchParams.get("type");
  const [aiDraft, setAiDraft] = useState<{ type: CommunityListingType; draft: CommunityListingDraft } | null>(null);
  const isClient = useIsClient();

  if (step === STEP_AI || (step === STEP_AI_FORM && !aiDraft)) {
    if (!isClient) return null;
    return (
      <CommunityAiChat
        userId={userId}
        creatorFirstName={creatorFirstName}
        onDraftReady={(pending) => {
          setAiDraft(pending);
          goToStep({ step: STEP_AI_FORM });
        }}
      />
    );
  }

  if (step === STEP_AI_FORM && aiDraft) {
    return (
      <PageShell>
        <p className="mb-4 rounded-lg border border-ember/20 bg-ember/5 px-3.5 py-2.5 text-xs text-ink-muted">
          Review what the AI drafted below, change anything you like, then create it. Nothing is saved yet.
        </p>
        <h2 className="mb-4 text-base font-semibold text-ink">New {COMMUNITY_LISTING_LABELS[aiDraft.type]}</h2>
        <CommunityListingForm
          type={aiDraft.type}
          initialDraft={aiDraft.draft}
          onSubmitted={() => markCommunityAiDraftUsed(userId)}
        />
      </PageShell>
    );
  }

  if (step === STEP_WRITE && isListingType(typeParam)) {
    return (
      <PageShell>
        <h2 className="mb-4 text-base font-semibold text-ink">New {COMMUNITY_LISTING_LABELS[typeParam]}</h2>
        <CommunityListingForm type={typeParam} />
      </PageShell>
    );
  }

  if (step === STEP_WRITE) {
    return (
      <PageShell>
        <p className="mb-4 text-sm text-ink-muted">What do you want to create?</p>
        <div className="grid grid-cols-2 gap-3">
          {COMMUNITY_LISTING_TYPES.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => goToStep({ step: STEP_WRITE, type: option })}
              className="rounded-xl border border-border bg-surface px-4 py-3.5 text-sm font-semibold text-ink transition-colors hover:border-ink-muted"
            >
              {COMMUNITY_LISTING_LABELS[option]}
            </button>
          ))}
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => goToStep({ step: STEP_WRITE })}
          className="flex flex-col items-start gap-2 rounded-2xl border border-border bg-surface p-6 text-left transition-colors hover:border-ink-muted"
        >
          <Pencil className="h-5 w-5 text-ink-muted" aria-hidden="true" />
          <span className="text-sm font-semibold text-ink">Write it yourself</span>
          <span className="text-xs text-ink-muted">Fill in a simple empty form.</span>
        </button>
        <button
          type="button"
          onClick={() => goToStep({ step: STEP_AI })}
          className="flex flex-col items-start gap-2 rounded-2xl border border-ember/35 bg-ember/[0.08] p-6 text-left shadow-[0_0_20px_-10px_rgba(226,145,77,45%)] transition-all duration-300 hover:border-ember/70 hover:bg-ember/[0.15] hover:shadow-[0_0_28px_-8px_rgba(226,145,77,70%)]"
        >
          <Sparkles className="h-5 w-5 text-ember" aria-hidden="true" />
          <span className="text-sm font-semibold text-ink">Describe it to the AI</span>
          <span className="text-xs text-ink-muted">Chat in your own words, then review the draft.</span>
        </button>
      </div>
    </PageShell>
  );
}

/** Impaginazione dei passaggi "normali" (scelta, moduli): la chat AI invece occupa tutto lo schermo. */
function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-xl px-6 pb-16 pt-24">
      <h1 className="text-xl font-bold tracking-tight">Add to your Community</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Create a Workshop, Event, Digital Product or 1:1 Service. It starts as a Draft that only you can see.
      </p>
      <div className="mt-8">{children}</div>
    </div>
  );
}
