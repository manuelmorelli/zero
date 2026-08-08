"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { quickStartJourney } from "@/lib/actions/journey";
import { createEpisodeVideoUploadUrl, quickCreateEpisode } from "@/lib/actions/episode";
import { uploadFileWithProgress } from "@/lib/upload";
import { ALLOWED_VIDEO_TYPES, MAX_VIDEO_SIZE_BYTES } from "@/lib/constants/video";

type Chapter = { id: string; title: string };

type QuickUploadButtonProps = {
  /** null = l'utente non ha ancora un Journey attivo: il primo passo lo crea al volo. */
  journeyId: string | null;
  chapters: Chapter[];
};

type Step = "journey" | "video" | "details";

function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatMB(bytes: number): string {
  return `${Math.round(bytes / (1024 * 1024))}MB`;
}

export function QuickUploadButton({ journeyId: initialJourneyId, chapters }: QuickUploadButtonProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>(initialJourneyId ? "video" : "journey");
  const [journeyId, setJourneyId] = useState(initialJourneyId);

  function openFlow() {
    setStep(journeyId ? "video" : "journey");
    setOpen(true);
  }

  function close() {
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={openFlow}
        aria-label="Upload a video"
        style={{ bottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
        className="fixed right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-ink text-bg shadow-2xl shadow-black/40 transition-transform hover:scale-105 active:scale-95"
      >
        <PlusIcon className="h-6 w-6" />
      </button>

      {open && (
        <QuickUploadModal
          step={step}
          setStep={setStep}
          journeyId={journeyId}
          setJourneyId={setJourneyId}
          chapters={chapters}
          onClose={close}
        />
      )}
    </>
  );
}

function QuickUploadModal({
  step,
  setStep,
  journeyId,
  setJourneyId,
  chapters,
  onClose,
}: {
  step: Step;
  setStep: (step: Step) => void;
  journeyId: string | null;
  setJourneyId: (id: string) => void;
  chapters: Chapter[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [videoKey, setVideoKey] = useState<string | null>(null);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="flex max-h-full w-full max-w-sm flex-col overflow-hidden rounded-xl border border-border bg-surface"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
            {step === "journey" && "Step 1 of 2 — Your Journey"}
            {step === "video" && "New video"}
            {step === "details" && "Step 2 of 2 — Add details"}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-ink-muted transition-colors hover:text-ink"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-5">
          {step === "journey" && (
            <JourneyStep
              onCreated={(id) => {
                setJourneyId(id);
                setStep("video");
              }}
            />
          )}
          {step === "video" && journeyId && (
            <VideoStep
              journeyId={journeyId}
              onUploaded={(key) => {
                setVideoKey(key);
                setStep("details");
              }}
            />
          )}
          {step === "details" && journeyId && videoKey && (
            <DetailsStep
              journeyId={journeyId}
              videoKey={videoKey}
              chapters={chapters}
              onDone={() => {
                onClose();
                router.refresh();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function JourneyStep({ onCreated }: { onCreated: (journeyId: string) => void }) {
  const uid = useId();
  const [state, formAction, pending] = useActionState(quickStartJourney, {
    error: null,
    journeyId: null,
  });

  useEffect(() => {
    if (state.journeyId) onCreated(state.journeyId);
    // Chiamato solo quando lo stato dell'azione cambia, non a ogni render di `onCreated`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.journeyId]);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-ink">Give your Journey a title</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Every video belongs to a Journey — your story over time. Let&apos;s start it.
        </p>
      </div>

      <div>
        <label htmlFor={`${uid}-title`} className="sr-only">
          Journey title
        </label>
        <input
          id={`${uid}-title`}
          name="title"
          type="text"
          required
          minLength={2}
          maxLength={100}
          autoFocus
          placeholder="e.g. My road to running a marathon"
          className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
        />
      </div>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-ink px-6 py-3 text-sm font-semibold text-bg transition-colors hover:bg-ink-muted disabled:opacity-50"
      >
        {pending ? "Creating…" : "Continue"}
      </button>
    </form>
  );
}

function VideoStep({ journeyId, onUploaded }: { journeyId: string; onUploaded: (videoKey: string) => void }) {
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError(null);

    if (!ALLOWED_VIDEO_TYPES.has(file.type)) {
      setError("Unsupported video format.");
      return;
    }
    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      setError(`Video is too large (max ${formatMB(MAX_VIDEO_SIZE_BYTES)}).`);
      return;
    }

    setProgress(0);
    try {
      const result = await createEpisodeVideoUploadUrl(journeyId, "journey", file.type);
      if ("error" in result) {
        setError(result.error);
        setProgress(null);
        return;
      }
      await uploadFileWithProgress(result.uploadUrl, file, setProgress);
      onUploaded(result.key);
    } catch {
      setError("Upload failed. Please try again.");
      setProgress(null);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {progress === null ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border py-12 transition-colors hover:border-ink-muted"
        >
          <VideoIcon className="h-9 w-9 text-ink-muted" />
          <span className="text-sm font-semibold text-ink">Select a video from your device</span>
          <span className="text-xs text-ink-faint">Max {formatMB(MAX_VIDEO_SIZE_BYTES)}</span>
        </button>
      ) : (
        <div className="flex w-full flex-col items-center gap-3 rounded-xl border border-border py-12">
          <span className="text-2xl font-extrabold tracking-tight text-ink">{progress}%</span>
          <span className="text-xs text-ink-muted">Uploading…</span>
        </div>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}

function DetailsStep({
  journeyId,
  chapters,
  videoKey,
  onDone,
}: {
  journeyId: string;
  chapters: Chapter[];
  videoKey: string;
  onDone: () => void;
}) {
  const uid = useId();
  const [state, formAction, pending] = useActionState(quickCreateEpisode, {
    error: null,
    done: false,
  });
  const [advanced, setAdvanced] = useState(false);

  useEffect(() => {
    if (state.done) onDone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.done]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="journeyId" value={journeyId} />
      <input type="hidden" name="videoKey" value={videoKey} />

      <div>
        <label htmlFor={`${uid}-title`} className="text-sm font-medium text-ink-muted">
          Title
        </label>
        <input
          id={`${uid}-title`}
          name="title"
          type="text"
          required
          minLength={2}
          maxLength={100}
          autoFocus
          placeholder="Give this episode a title"
          className="mt-1.5 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
        />
      </div>

      <button
        type="button"
        onClick={() => setAdvanced((value) => !value)}
        className="text-xs font-semibold text-ink-muted underline underline-offset-2 hover:text-ink"
      >
        {advanced ? "Hide options" : "More options (caption, chapter, date)"}
      </button>

      {/* I campi restano nel DOM anche nascosti (invece di smontarli), così il loro valore
          di default viene comunque inviato quando "Altre opzioni" resta chiuso. */}
      <div className={advanced ? "space-y-4" : "hidden"}>
        <div>
          <label htmlFor={`${uid}-caption`} className="text-sm font-medium text-ink-muted">
            Caption
          </label>
          <textarea
            id={`${uid}-caption`}
            name="caption"
            rows={3}
            maxLength={10000}
            placeholder="Tell what happened in this episode."
            className="mt-1.5 w-full resize-none rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
          />
        </div>

        {chapters.length > 0 && (
          <div>
            <label htmlFor={`${uid}-chapter`} className="text-sm font-medium text-ink-muted">
              Chapter
            </label>
            <select
              id={`${uid}-chapter`}
              name="chapterId"
              defaultValue=""
              className="mt-1.5 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
            >
              <option value="">No chapter</option>
              {chapters.map((chapter) => (
                <option key={chapter.id} value={chapter.id}>
                  {chapter.title}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor={`${uid}-occurredAt`} className="text-sm font-medium text-ink-muted">
            When it actually happened
          </label>
          <input
            id={`${uid}-occurredAt`}
            name="occurredAt"
            type="date"
            defaultValue={todayInputValue()}
            className="mt-1.5 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
          />
        </div>
      </div>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-ink px-6 py-3 text-sm font-semibold text-bg transition-colors hover:bg-ink-muted disabled:opacity-50"
      >
        {pending ? "Publishing…" : "Publish"}
      </button>
    </form>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <path d="M10 4v12M4 10h12" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} className={className} aria-hidden="true">
      <path d="M5 5l10 10M15 5 5 15" strokeLinecap="round" />
    </svg>
  );
}

function VideoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={className} aria-hidden="true">
      <rect x="3" y="6" width="13" height="12" rx="2" />
      <path d="M16 10.5 21 7v10l-5-3.5Z" strokeLinejoin="round" />
    </svg>
  );
}
