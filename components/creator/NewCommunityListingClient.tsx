"use client";

import { useState, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import { Pencil, Sparkles } from "lucide-react";
import { CommunityAiChat } from "@/components/creator/CommunityAiChat";
import { CommunityListingForm, type CommunityListingDraft } from "@/components/creator/CommunityListingForm";
import { COMMUNITY_LISTING_LABELS, COMMUNITY_LISTING_TYPES, type CommunityListingType } from "@/lib/constants/communityListing";
import { markCommunityAiDraftUsed } from "@/lib/communityAiChatStorage";
import { NOTICE, PANEL } from "@/components/ui/panel";
import { PageContainer } from "@/components/ui/page-container";
import { PageTitle, SectionTitle } from "@/components/ui/heading";
import { cn } from "@/lib/utils";

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
        <p className={cn(NOTICE, "mb-4")}>
          Review what the AI drafted below, change anything you like, then create it. Nothing is saved yet.
        </p>
        <SectionTitle className="mb-4">New {COMMUNITY_LISTING_LABELS[aiDraft.type]}</SectionTitle>
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
        <SectionTitle className="mb-4">New {COMMUNITY_LISTING_LABELS[typeParam]}</SectionTitle>
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
              className={cn(PANEL, "text-left text-sm font-semibold text-ink shadow-card transition-[border-color,box-shadow] duration-300 hover:border-ember-line hover:shadow-glow")}
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
          className={cn(PANEL, "flex flex-col items-start gap-2 text-left shadow-card transition-[border-color,box-shadow] duration-300 hover:border-ember-line hover:shadow-glow")}
        >
          <Pencil className="h-5 w-5 text-ink-muted" aria-hidden="true" />
          <span className="text-sm font-semibold text-ink">Write it yourself</span>
          <span className="text-sm text-ink-muted">Fill in a simple empty form.</span>
        </button>
        <button
          type="button"
          onClick={() => goToStep({ step: STEP_AI })}
          className={cn(PANEL, "flex flex-col items-start gap-2 text-left shadow-card transition-[border-color,box-shadow] duration-300 hover:border-ember-line hover:shadow-glow")}
        >
          <Sparkles className="h-5 w-5 text-ember" aria-hidden="true" />
          <span className="text-sm font-semibold text-ink">Describe it to the AI</span>
          <span className="text-sm text-ink-muted">Chat in your own words, then review the draft.</span>
        </button>
      </div>
    </PageShell>
  );
}

/** Impaginazione dei passaggi "normali" (scelta, moduli): la chat AI invece occupa tutto lo schermo. */
function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <PageContainer>
      <PageTitle>Add to your Community</PageTitle>
      <p className="mt-2 text-sm text-ink-muted">
        Create a Workshop, Event, Digital Product or 1:1 Service. It starts as a Draft that only you can see.
      </p>
      <div className="mt-8">{children}</div>
    </PageContainer>
  );
}
