"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { quickStartJourney } from "@/lib/actions/journey";
import { createEpisodeVideoUploadUrl, quickCreateEpisode } from "@/lib/actions/episode";
import { createUpdateMediaUploadUrl, publishUpdate } from "@/lib/actions/update";
import { uploadFileWithProgress } from "@/lib/upload";
import { readVideoDuration } from "@/lib/media/readVideoDuration";
import { ALLOWED_VIDEO_TYPES, MAX_UPDATE_VIDEO_DURATION_SEC, MAX_UPDATE_VIDEO_SIZE_BYTES, MAX_VIDEO_SIZE_BYTES } from "@/lib/constants/video";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from "@/lib/constants/image";
import { POLL_MAX_OPTIONS, POLL_MIN_OPTIONS, POLL_OPTION_MAX_LENGTH, UPDATE_TEXT_MAX_LENGTH } from "@/lib/constants/updates";

type Chapter = { id: string; title: string };
type Journey = { id: string; title: string; chapters: Chapter[] };
type LinkableJourney = { id: string; title: string; episodes: { id: string; title: string }[] };
type UpdateKind = "TEXT" | "IMAGE" | "VIDEO" | "POLL" | "QUESTION";

type QuickUploadButtonProps = {
  /** Journey attivi (non archiviati) del creator. Un creator può averne più di uno in parallelo
   * (vedi 00-project-context.md, sezione "Archiviazione del Journey"): con zero se ne crea uno al
   * volo, con uno solo si salta dritti al video (nessuna frizione in più), con due o più si chiede
   * prima a quale aggiungere il video. */
  journeys: Journey[];
  /** Journey "live" (Pubblicato o in Discovery) del creator, con i loro Episodi: usati solo per il
   * "Link to…" facoltativo di un Update — un Journey ancora in Bozza non ha una pagina pubblica a
   * cui puntare. */
  linkableJourneys: LinkableJourney[];
};

type Step = "choice" | "journey" | "picker" | "video" | "details" | "updateType" | "updateForm";

function initialJourneyStepFor(journeys: Journey[]): Step {
  if (journeys.length === 0) return "journey";
  if (journeys.length === 1) return "video";
  return "picker";
}

function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatMB(bytes: number): string {
  return `${Math.round(bytes / (1024 * 1024))}MB`;
}

export function QuickUploadButton({ journeys, linkableJourneys }: QuickUploadButtonProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("choice");
  const [journeyId, setJourneyId] = useState<string | null>(journeys.length === 1 ? journeys[0].id : null);
  const [updateKind, setUpdateKind] = useState<UpdateKind | null>(null);

  function openFlow() {
    setStep("choice");
    setJourneyId(journeys.length === 1 ? journeys[0].id : null);
    setUpdateKind(null);
    setOpen(true);
  }

  function close() {
    setOpen(false);
  }

  // Un Journey appena creato al volo (step "journey") non ha ancora Capitoli: nessuna voce
  // corrispondente in `journeys` (snapshot caricato dal server all'apertura della pagina).
  const chapters = journeys.find((journey) => journey.id === journeyId)?.chapters ?? [];

  return (
    <>
      <button
        type="button"
        onClick={openFlow}
        aria-label="Add to your Journey or post an Update"
        style={{ bottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
        className="fixed right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-ink text-bg shadow-2xl shadow-black/40 transition-transform hover:scale-105 active:scale-95"
      >
        <PlusIcon className="h-6 w-6" />
      </button>

      {open && (
        <QuickUploadModal
          step={step}
          setStep={setStep}
          journeys={journeys}
          journeyId={journeyId}
          setJourneyId={setJourneyId}
          chapters={chapters}
          updateKind={updateKind}
          setUpdateKind={setUpdateKind}
          linkableJourneys={linkableJourneys}
          onClose={close}
        />
      )}
    </>
  );
}

function QuickUploadModal({
  step,
  setStep,
  journeys,
  journeyId,
  setJourneyId,
  chapters,
  updateKind,
  setUpdateKind,
  linkableJourneys,
  onClose,
}: {
  step: Step;
  setStep: (step: Step) => void;
  journeys: Journey[];
  journeyId: string | null;
  setJourneyId: (id: string) => void;
  chapters: Chapter[];
  updateKind: UpdateKind | null;
  setUpdateKind: (kind: UpdateKind) => void;
  linkableJourneys: LinkableJourney[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [videoKey, setVideoKey] = useState<string | null>(null);
  const [videoDurationSec, setVideoDurationSec] = useState<number | null>(null);

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
            {step === "choice" && "What do you want to share?"}
            {step === "picker" && "Which Journey?"}
            {step === "journey" && "New Journey"}
            {step === "video" && "New video"}
            {step === "details" && "Add details"}
            {step === "updateType" && "Post an Update"}
            {step === "updateForm" && UPDATE_FORM_TITLE[updateKind ?? "TEXT"]}
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
          {step === "choice" && (
            <ChoiceStep
              onPickJourney={() => setStep(initialJourneyStepFor(journeys))}
              onPickUpdate={() => setStep("updateType")}
            />
          )}
          {step === "picker" && (
            <PickerStep
              journeys={journeys}
              onPick={(id) => {
                setJourneyId(id);
                setStep("video");
              }}
              onStartNew={() => setStep("journey")}
            />
          )}
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
              onUploaded={(key, durationSec) => {
                setVideoKey(key);
                setVideoDurationSec(durationSec);
                setStep("details");
              }}
            />
          )}
          {step === "details" && journeyId && videoKey && (
            <DetailsStep
              journeyId={journeyId}
              videoKey={videoKey}
              durationSec={videoDurationSec}
              chapters={chapters}
              onDone={() => {
                onClose();
                router.refresh();
              }}
            />
          )}
          {step === "updateType" && (
            <UpdateTypeStep
              onPick={(kind) => {
                setUpdateKind(kind);
                setStep("updateForm");
              }}
            />
          )}
          {step === "updateForm" && updateKind && (
            <UpdateFormStep
              kind={updateKind}
              linkableJourneys={linkableJourneys}
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

/* ------------------------------------------------------------------ */
/* SCELTA INIZIALE — Aggiungi al Journey vs Pubblica un Update          */
/* ------------------------------------------------------------------ */

function ChoiceStep({
  onPickJourney,
  onPickUpdate,
}: {
  onPickJourney: () => void;
  onPickUpdate: () => void;
}) {
  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={onPickJourney}
        className="w-full rounded-lg border border-border bg-surface px-4 py-4 text-left transition-colors hover:border-ink-muted"
      >
        <span className="block text-sm font-semibold text-ink">Add to your Journey</span>
        <span className="mt-1 block text-xs text-ink-muted">Upload a new episode video.</span>
      </button>
      <button
        type="button"
        onClick={onPickUpdate}
        className="w-full rounded-lg border border-border bg-surface px-4 py-4 text-left transition-colors hover:border-ink-muted"
      >
        <span className="block text-sm font-semibold text-ink">Post an Update</span>
        <span className="mt-1 block text-xs text-ink-muted">
          Text, photo, video, poll or question — disappears after 24 hours.
        </span>
      </button>
    </div>
  );
}

function PickerStep({
  journeys,
  onPick,
  onStartNew,
}: {
  journeys: Journey[];
  onPick: (journeyId: string) => void;
  onStartNew: () => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-ink">Add this video to…</h2>
        <p className="mt-1 text-sm text-ink-muted">Pick which Journey this episode belongs to.</p>
      </div>

      <div className="space-y-2">
        {journeys.map((journey) => (
          <button
            key={journey.id}
            type="button"
            onClick={() => onPick(journey.id)}
            className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-left text-sm font-medium text-ink transition-colors hover:border-ink-muted"
          >
            {journey.title}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onStartNew}
        className="w-full rounded-full border border-border px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-ink-muted"
      >
        Start a new Journey
      </button>
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

function VideoStep({
  journeyId,
  onUploaded,
}: {
  journeyId: string;
  onUploaded: (videoKey: string, durationSec: number | null) => void;
}) {
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
      const [result, durationSec] = await Promise.all([
        createEpisodeVideoUploadUrl(journeyId, "journey", file.type),
        readVideoDuration(file),
      ]);
      if ("error" in result) {
        setError(result.error);
        setProgress(null);
        return;
      }
      await uploadFileWithProgress(result.uploadUrl, file, setProgress);
      onUploaded(result.key, durationSec);
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
  durationSec,
  onDone,
}: {
  journeyId: string;
  chapters: Chapter[];
  videoKey: string;
  durationSec: number | null;
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
      <input type="hidden" name="durationSec" value={durationSec ?? ""} />

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

/* ------------------------------------------------------------------ */
/* PUBBLICA UN UPDATE — testo / foto / video / sondaggio / domanda      */
/* ------------------------------------------------------------------ */

const UPDATE_FORM_TITLE: Record<UpdateKind, string> = {
  TEXT: "Text update",
  IMAGE: "Photo",
  VIDEO: "Video",
  POLL: "Poll",
  QUESTION: "Question",
};

const UPDATE_KINDS: { key: UpdateKind; label: string; hint: string }[] = [
  { key: "TEXT", label: "Text", hint: "A quick written update." },
  { key: "IMAGE", label: "Photo", hint: "Share a picture." },
  { key: "VIDEO", label: "Video", hint: `Up to ${MAX_UPDATE_VIDEO_DURATION_SEC} seconds.` },
  { key: "POLL", label: "Poll", hint: "Ask your followers to vote." },
  { key: "QUESTION", label: "Question", hint: "Get answers only you can see." },
];

function UpdateTypeStep({ onPick }: { onPick: (kind: UpdateKind) => void }) {
  return (
    <div className="space-y-2">
      {UPDATE_KINDS.map((kind) => (
        <button
          key={kind.key}
          type="button"
          onClick={() => onPick(kind.key)}
          className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-left transition-colors hover:border-ink-muted"
        >
          <span className="block text-sm font-semibold text-ink">{kind.label}</span>
          <span className="mt-0.5 block text-xs text-ink-muted">{kind.hint}</span>
        </button>
      ))}
    </div>
  );
}

function UpdateFormStep({
  kind,
  linkableJourneys,
  onDone,
}: {
  kind: UpdateKind;
  linkableJourneys: LinkableJourney[];
  onDone: () => void;
}) {
  const uid = useId();
  const [state, formAction, pending] = useActionState(publishUpdate, { error: null, done: false });
  const [mediaKey, setMediaKey] = useState<string | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [linkChoice, setLinkChoice] = useState("");
  // Solo per Foto/Video: si può abbinare al massimo un extra interattivo, non un tipo a parte
  // (scelta fatta con Manuel per non forzare a scegliere tra "foto" e "sondaggio/domanda").
  const [extra, setExtra] = useState<"" | "POLL" | "QUESTION">("");

  useEffect(() => {
    if (state.done) onDone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.done]);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploadError(null);

    if (kind === "IMAGE") {
      if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
        setUploadError("Unsupported image format.");
        return;
      }
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        setUploadError(`Image is too large (max ${formatMB(MAX_IMAGE_SIZE_BYTES)}).`);
        return;
      }
    } else {
      if (!ALLOWED_VIDEO_TYPES.has(file.type)) {
        setUploadError("Unsupported video format.");
        return;
      }
      if (file.size > MAX_UPDATE_VIDEO_SIZE_BYTES) {
        setUploadError(`Video is too large (max ${formatMB(MAX_UPDATE_VIDEO_SIZE_BYTES)}).`);
        return;
      }
      const duration = await readVideoDuration(file);
      if (duration !== null && duration > MAX_UPDATE_VIDEO_DURATION_SEC) {
        setUploadError(`Keep videos under ${MAX_UPDATE_VIDEO_DURATION_SEC} seconds.`);
        return;
      }
    }

    setUploadProgress(0);
    try {
      const result = await createUpdateMediaUploadUrl(kind === "IMAGE" ? "image" : "video", file.type);
      if ("error" in result) {
        setUploadError(result.error);
        setUploadProgress(null);
        return;
      }
      await uploadFileWithProgress(result.uploadUrl, file, setUploadProgress);
      setMediaKey(result.key);
      setMediaPreviewUrl(URL.createObjectURL(file));
    } catch {
      setUploadError("Upload failed. Please try again.");
      setUploadProgress(null);
    }
  }

  const [linkType, linkTargetId] = linkChoice
    ? (linkChoice.split(":") as ["journey" | "episode", string])
    : [null, null];

  const needsMedia = kind === "IMAGE" || kind === "VIDEO";
  const stillUploading = uploadProgress !== null && uploadProgress < 100;

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="type" value={kind} />
      {mediaKey && <input type="hidden" name="mediaKey" value={mediaKey} />}
      {needsMedia && extra && <input type="hidden" name="extra" value={extra} />}
      {linkType === "journey" && <input type="hidden" name="linkedJourneyId" value={linkTargetId} />}
      {linkType === "episode" && <input type="hidden" name="linkedEpisodeId" value={linkTargetId} />}

      {(kind === "TEXT" || kind === "QUESTION" || kind === "POLL") && (
        <div>
          <label htmlFor={`${uid}-content`} className="sr-only">
            {kind === "POLL" ? "Question" : kind === "QUESTION" ? "Your question" : "Update"}
          </label>
          <textarea
            id={`${uid}-content`}
            name="content"
            rows={3}
            required
            maxLength={UPDATE_TEXT_MAX_LENGTH}
            autoFocus
            placeholder={
              kind === "POLL"
                ? "Ask a question…"
                : kind === "QUESTION"
                  ? "What do you want to ask your followers?"
                  : "Share a quick update with your followers… it disappears after 24 hours."
            }
            className="w-full resize-none rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
          />
        </div>
      )}

      {needsMedia && (
        <MediaPickerField
          kind={kind}
          hasMedia={Boolean(mediaKey && mediaPreviewUrl)}
          previewUrl={mediaPreviewUrl}
          progress={uploadProgress}
          onFileChange={handleFileChange}
        />
      )}

      {needsMedia && (
        <div>
          <label htmlFor={`${uid}-caption`} className="sr-only">
            {extra === "POLL" ? "Question" : extra === "QUESTION" ? "Your question" : "Caption"}
          </label>
          <textarea
            id={`${uid}-caption`}
            name="content"
            rows={2}
            required={extra !== ""}
            maxLength={UPDATE_TEXT_MAX_LENGTH}
            placeholder={
              extra === "POLL"
                ? "Ask a question…"
                : extra === "QUESTION"
                  ? "What do you want to ask your followers?"
                  : "Add a caption (optional)"
            }
            className="w-full resize-none rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
          />
        </div>
      )}

      {needsMedia && <UpdateExtraField value={extra} onChange={setExtra} />}

      {(kind === "POLL" || (needsMedia && extra === "POLL")) && (
        <PollOptionsField options={pollOptions} setOptions={setPollOptions} />
      )}

      {linkableJourneys.length > 0 && (
        <LinkPickerField journeys={linkableJourneys} value={linkChoice} onChange={setLinkChoice} />
      )}

      {(uploadError || state.error) && <p className="text-sm text-danger">{uploadError ?? state.error}</p>}

      <button
        type="submit"
        disabled={pending || stillUploading || (needsMedia && !mediaKey)}
        className="w-full rounded-full bg-ink px-6 py-3 text-sm font-semibold text-bg transition-colors hover:bg-ink-muted disabled:opacity-50"
      >
        {pending ? "Publishing…" : "Publish"}
      </button>
    </form>
  );
}

function MediaPickerField({
  kind,
  hasMedia,
  previewUrl,
  progress,
  onFileChange,
}: {
  kind: "IMAGE" | "VIDEO";
  hasMedia: boolean;
  previewUrl: string | null;
  progress: number | null;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col items-center gap-3">
      <input
        ref={inputRef}
        type="file"
        accept={kind === "IMAGE" ? "image/*" : "video/*"}
        onChange={onFileChange}
        className="hidden"
      />

      {hasMedia && previewUrl ? (
        kind === "IMAGE" ? (
          // Anteprima locale (blob: URL), non un file su R2: next/image non serve qui.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="" className="max-h-64 w-full rounded-lg object-cover" />
        ) : (
          <video src={previewUrl} controls playsInline className="max-h-64 w-full rounded-lg" />
        )
      ) : progress !== null ? (
        <div className="flex w-full flex-col items-center gap-3 rounded-xl border border-border py-10">
          <span className="text-2xl font-extrabold tracking-tight text-ink">{progress}%</span>
          <span className="text-xs text-ink-muted">Uploading…</span>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border py-10 transition-colors hover:border-ink-muted"
        >
          {kind === "IMAGE" ? (
            <PhotoIcon className="h-8 w-8 text-ink-muted" />
          ) : (
            <VideoIcon className="h-8 w-8 text-ink-muted" />
          )}
          <span className="text-sm font-semibold text-ink">
            {kind === "IMAGE" ? "Select a photo" : "Select a video"}
          </span>
          <span className="text-xs text-ink-faint">
            {kind === "IMAGE"
              ? `Max ${formatMB(MAX_IMAGE_SIZE_BYTES)}`
              : `Max ${MAX_UPDATE_VIDEO_DURATION_SEC}s, ${formatMB(MAX_UPDATE_VIDEO_SIZE_BYTES)}`}
          </span>
        </button>
      )}

      {hasMedia && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-xs font-semibold text-ink-muted underline underline-offset-2 hover:text-ink"
        >
          Choose a different file
        </button>
      )}
    </div>
  );
}

const EXTRA_CHOICES: { key: "" | "POLL" | "QUESTION"; label: string }[] = [
  { key: "", label: "Just the photo/video" },
  { key: "POLL", label: "Add a poll" },
  { key: "QUESTION", label: "Add a question" },
];

function UpdateExtraField({
  value,
  onChange,
}: {
  value: "" | "POLL" | "QUESTION";
  onChange: (value: "" | "POLL" | "QUESTION") => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {EXTRA_CHOICES.map((choice) => (
        <button
          key={choice.key || "none"}
          type="button"
          onClick={() => onChange(choice.key)}
          className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            value === choice.key
              ? "border-ink bg-ink text-bg"
              : "border-border text-ink-muted hover:border-ink-muted"
          }`}
        >
          {choice.label}
        </button>
      ))}
    </div>
  );
}

function PollOptionsField({
  options,
  setOptions,
}: {
  options: string[];
  setOptions: (options: string[]) => void;
}) {
  function updateOption(index: number, value: string) {
    setOptions(options.map((option, i) => (i === index ? value : option)));
  }
  function addOption() {
    if (options.length >= POLL_MAX_OPTIONS) return;
    setOptions([...options, ""]);
  }
  function removeOption(index: number) {
    if (options.length <= POLL_MIN_OPTIONS) return;
    setOptions(options.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-ink-muted">Options</p>
      {options.map((option, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            name="pollOption"
            type="text"
            required
            maxLength={POLL_OPTION_MAX_LENGTH}
            value={option}
            onChange={(event) => updateOption(index, event.target.value)}
            placeholder={`Option ${index + 1}`}
            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
          />
          {options.length > POLL_MIN_OPTIONS && (
            <button
              type="button"
              onClick={() => removeOption(index)}
              aria-label="Remove option"
              className="shrink-0 text-ink-faint transition-colors hover:text-ink"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}
      {options.length < POLL_MAX_OPTIONS && (
        <button
          type="button"
          onClick={addOption}
          className="text-xs font-semibold text-ink-muted underline underline-offset-2 hover:text-ink"
        >
          + Add option
        </button>
      )}
    </div>
  );
}

function LinkPickerField({
  journeys,
  value,
  onChange,
}: {
  journeys: LinkableJourney[];
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(value !== "");

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="text-xs font-semibold text-ink-muted underline underline-offset-2 hover:text-ink"
      >
        {open ? "Hide link option" : "Link to a Journey or Episode (optional)"}
      </button>
      <div className={open ? "mt-3" : "hidden"}>
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
        >
          <option value="">No link</option>
          {journeys.map((journey) => (
            <optgroup key={journey.id} label={journey.title}>
              <option value={`journey:${journey.id}`}>View the Journey</option>
              {journey.episodes.map((episode) => (
                <option key={episode.id} value={`episode:${episode.id}`}>
                  Episode: {episode.title}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
    </div>
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

function PhotoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={className} aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="1.8" />
      <path d="m4 18 5.5-5.5a2 2 0 0 1 2.8 0L20 20" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
