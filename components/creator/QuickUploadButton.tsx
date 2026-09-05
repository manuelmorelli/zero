"use client";

import { createContext, useActionState, useContext, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createQuickPosterUploadUrl, createQuickVideoUploadUrl, quickComposeEpisode } from "@/lib/actions/episode";
import { createUpdateMediaUploadUrl, publishUpdate } from "@/lib/actions/update";
import { uploadFileWithProgress } from "@/lib/upload";
import { readVideoDuration } from "@/lib/media/readVideoDuration";
import { captureVideoFrame } from "@/lib/media/captureVideoFrame";
import { ALLOWED_VIDEO_TYPES, MAX_UPDATE_VIDEO_DURATION_SEC, MAX_UPDATE_VIDEO_SIZE_BYTES, MAX_VIDEO_SIZE_BYTES } from "@/lib/constants/video";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from "@/lib/constants/image";
import { POLL_MAX_OPTIONS, POLL_MIN_OPTIONS, POLL_OPTION_MAX_LENGTH, UPDATE_TEXT_MAX_LENGTH } from "@/lib/constants/updates";

type Chapter = { id: string; title: string };
type Journey = { id: string; title: string; chapters: Chapter[] };
type LinkableJourney = { id: string; title: string; episodes: { id: string; title: string }[] };
type UpdateKind = "TEXT" | "IMAGE" | "VIDEO" | "POLL" | "QUESTION";

type QuickUploadProviderProps = {
  /** Journey attivi (non archiviati) del creator: mostrati come scelta "aggiungi a" nella
   * schermata di composizione, con "+ Start a new Journey" sempre disponibile in coda. */
  journeys: Journey[];
  /** Journey "live" (Pubblicato o in Discovery) del creator, con i loro Episodi: usati solo per il
   * "Link to…" facoltativo di un Update — un Journey ancora in Bozza non ha una pagina pubblica a
   * cui puntare. */
  linkableJourneys: LinkableJourney[];
  children: React.ReactNode;
};

type Step = "choice" | "compose" | "updateType" | "updateForm";

function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatMB(bytes: number): string {
  return `${Math.round(bytes / (1024 * 1024))}MB`;
}

/** Apre la finestra di pubblicazione: `openChoice` parte dalla domanda "Journey o Update?" (il
 * pulsante "+" flottante), `openPostUpdate` salta dritto alla scelta del tipo di Update — usato
 * dal "+" sulla foto profilo, dove l'intento è già inequivocabile. */
type QuickUploadContextValue = {
  openChoice: () => void;
  openPostUpdate: () => void;
};

const QuickUploadContext = createContext<QuickUploadContextValue | null>(null);

/** `null` per chi non è loggato (QuickUpload.tsx non monta il Provider per gli ospiti): i
 * consumatori fuori dal pulsante "+" flottante — es. il "+" sulla foto profilo, mostrato solo al
 * proprietario e quindi sempre dentro il Provider — possono ignorare questo caso, ma il tipo
 * resta nullable per non nascondere l'assunzione. */
export function useQuickUpload(): QuickUploadContextValue | null {
  return useContext(QuickUploadContext);
}

/** Stato condiviso della finestra di pubblicazione (Journey o Update), così più punti
 * dell'interfaccia — il "+" flottante globale, il "+" sulla foto profilo — possono aprire la
 * stessa finestra invece di duplicarne una copia ciascuno. */
export function QuickUploadProvider({ journeys, linkableJourneys, children }: QuickUploadProviderProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("choice");
  const [updateKind, setUpdateKind] = useState<UpdateKind | null>(null);

  function openChoice() {
    setStep("choice");
    setUpdateKind(null);
    setOpen(true);
  }

  function openPostUpdate() {
    setStep("updateType");
    setUpdateKind(null);
    setOpen(true);
  }

  function close() {
    setOpen(false);
  }

  return (
    <QuickUploadContext.Provider value={{ openChoice, openPostUpdate }}>
      {children}

      {open && (
        <QuickUploadModal
          step={step}
          setStep={setStep}
          journeys={journeys}
          updateKind={updateKind}
          setUpdateKind={setUpdateKind}
          linkableJourneys={linkableJourneys}
          onClose={close}
        />
      )}
    </QuickUploadContext.Provider>
  );
}

/** Pulsante "+" flottante globale, visibile su tutto il sito per chi è loggato. */
export function QuickUploadFab() {
  const quickUpload = useQuickUpload();

  return (
    <button
      type="button"
      onClick={() => quickUpload?.openChoice()}
      aria-label="Add to your Journey or post an Update"
      style={{ bottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
      className="fixed right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-ink text-bg shadow-2xl shadow-black/40 transition-transform hover:scale-105 active:scale-95"
    >
      <PlusIcon className="h-6 w-6" />
    </button>
  );
}

function QuickUploadModal({
  step,
  setStep,
  journeys,
  updateKind,
  setUpdateKind,
  linkableJourneys,
  onClose,
}: {
  step: Step;
  setStep: (step: Step) => void;
  journeys: Journey[];
  updateKind: UpdateKind | null;
  setUpdateKind: (kind: UpdateKind) => void;
  linkableJourneys: LinkableJourney[];
  onClose: () => void;
}) {
  const router = useRouter();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8"
      onClick={onClose}
    >
      <div
        className={`flex max-h-full w-full flex-col overflow-hidden rounded-xl border border-border bg-surface ${
          step === "compose" ? "max-w-2xl" : "max-w-sm"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
            {step === "choice" && "What do you want to share?"}
            {step === "compose" && "New episode"}
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
              onPickJourney={() => setStep("compose")}
              onPickUpdate={() => setStep("updateType")}
            />
          )}
          {step === "compose" && (
            <ComposeStep
              journeys={journeys}
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

// Un'unica schermata per video, copertina, a quale Journey (esistente o nuovo) e didascalia:
// prima erano quattro passaggi separati (scegli Journey / crea Journey / carica video / dettagli),
// qui restano solo due gesti reali — scegli il video, poi Publish — come chiesto esplicitamente
// da Manuel ("deve avvenire in due click come su Instagram"). Non usa useActionState perché tra un
// click e l'altro servono passaggi asincroni intermedi lato client (estrarre il fotogramma di
// copertina dal video, caricare la copertina scelta) prima di chiamare l'azione server finale.
function ComposeStep({ journeys, onDone }: { journeys: Journey[]; onDone: () => void }) {
  const uid = useId();

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoKey, setVideoKey] = useState<string | null>(null);
  const [durationSec, setDurationSec] = useState<number | null>(null);
  const [videoProgress, setVideoProgress] = useState<number | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

  const [posterPreviewUrl, setPosterPreviewUrl] = useState<string | null>(null);
  const [posterBlob, setPosterBlob] = useState<Blob | null>(null);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [scrubTime, setScrubTime] = useState(0);

  const [journeyChoice, setJourneyChoice] = useState(journeys.length > 0 ? journeys[0].id : "");
  const [newJourneyTitle, setNewJourneyTitle] = useState("");

  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [advanced, setAdvanced] = useState(false);
  const [chapterId, setChapterId] = useState("");
  const [occurredAt, setOccurredAt] = useState(todayInputValue());

  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const posterInputRef = useRef<HTMLInputElement>(null);

  const chapters = journeys.find((journey) => journey.id === journeyChoice)?.chapters ?? [];
  const isNewJourney = journeyChoice === "";
  const stillUploadingVideo = videoProgress !== null && videoProgress < 100;

  function setPosterFromBlob(blob: Blob) {
    setPosterBlob(blob);
    setPosterFile(null);
    setPosterPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(blob);
    });
  }

  async function handleVideoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setVideoError(null);

    if (!ALLOWED_VIDEO_TYPES.has(file.type)) {
      setVideoError("Unsupported video format.");
      return;
    }
    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      setVideoError(`Video is too large (max ${formatMB(MAX_VIDEO_SIZE_BYTES)}).`);
      return;
    }

    setVideoFile(file);
    setVideoProgress(0);

    const [result, duration] = await Promise.all([
      createQuickVideoUploadUrl(file.type),
      readVideoDuration(file),
    ]);
    setDurationSec(duration);

    if ("error" in result) {
      setVideoError(result.error);
      setVideoProgress(null);
      return;
    }

    try {
      await uploadFileWithProgress(result.uploadUrl, file, setVideoProgress);
      setVideoKey(result.key);
    } catch {
      setVideoError("Upload failed. Please try again.");
      setVideoProgress(null);
      return;
    }

    // Copertina proposta in automatico da un fotogramma del video, come su Instagram: l'utente
    // può comunque scorrere per sceglierne un altro momento, o caricare una sua foto.
    const initialTime = duration ? Math.min(1, duration / 2) : 0;
    setScrubTime(initialTime);
    const frame = await captureVideoFrame(file, initialTime);
    if (frame) setPosterFromBlob(frame);
  }

  function handleRemoveVideo() {
    setVideoFile(null);
    setVideoKey(null);
    setDurationSec(null);
    setVideoProgress(null);
    setVideoError(null);
    setScrubTime(0);
    setPosterBlob(null);
    setPosterFile(null);
    setPosterPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
  }

  async function handleScrub(event: React.ChangeEvent<HTMLInputElement>) {
    const time = Number(event.target.value);
    setScrubTime(time);
    if (!videoFile) return;
    const frame = await captureVideoFrame(videoFile, time);
    if (frame) setPosterFromBlob(frame);
  }

  function handlePosterFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      setError("Unsupported image format.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setError(`Image is too large (max ${formatMB(MAX_IMAGE_SIZE_BYTES)}).`);
      return;
    }

    setError(null);
    setPosterFile(file);
    setPosterBlob(null);
    setPosterPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
  }

  // Il bottone diventa cliccabile appena il video è pronto (caricato, non più in upload): titolo
  // ed eventuale nome del nuovo Journey restano comunque obbligatori, ma vengono controllati al
  // click (vedi handlePublish/quickComposeEpisode) invece di tenere il bottone grigio finché non
  // sono compilati — più intuitivo per chi non capisce subito perché è disattivato.
  const canPublish = Boolean(videoKey) && !stillUploadingVideo && !publishing;

  async function handlePublish() {
    if (!videoKey) return;

    if (title.trim().length < 2) {
      setError("Give this episode a title before publishing.");
      return;
    }
    if (isNewJourney && newJourneyTitle.trim().length < 2) {
      setError("Give your Journey a title before publishing.");
      return;
    }

    setPublishing(true);
    setError(null);

    try {
      let posterKey: string | undefined;
      const posterSource = posterFile ?? posterBlob;
      if (posterSource) {
        const posterResult = await createQuickPosterUploadUrl(posterSource.type || "image/jpeg");
        if ("error" in posterResult) {
          setError(posterResult.error);
          setPublishing(false);
          return;
        }
        await uploadFileWithProgress(posterResult.uploadUrl, posterSource, () => {});
        posterKey = posterResult.key;
      }

      const formData = new FormData();
      if (isNewJourney) {
        formData.set("newJourneyTitle", newJourneyTitle);
      } else {
        formData.set("journeyId", journeyChoice);
      }
      formData.set("title", title);
      if (caption) formData.set("caption", caption);
      formData.set("videoKey", videoKey);
      if (posterKey) formData.set("posterKey", posterKey);
      if (durationSec) formData.set("durationSec", String(durationSec));
      if (chapterId) formData.set("chapterId", chapterId);
      formData.set("occurredAt", occurredAt);

      const result = await quickComposeEpisode({ error: null, done: false }, formData);
      if (result.error) {
        setError(result.error);
        setPublishing(false);
        return;
      }
      onDone();
    } catch {
      setError("Something went wrong. Please try again.");
      setPublishing(false);
    }
  }

  return (
    <div className="sm:grid sm:grid-cols-[260px_1fr] sm:gap-6">
      <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoChange} className="hidden" />
      <input ref={posterInputRef} type="file" accept="image/*" onChange={handlePosterFileChange} className="hidden" />

      {/* Colonna sinistra: video e copertina. Su schermi stretti (telefono) torna a impilarsi
          sopra la colonna destra — lì un po' di scroll resta comunque inevitabile. */}
      <div className="space-y-3">
        {!videoFile ? (
          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            className="flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border py-12 transition-colors hover:border-ink-muted sm:h-full sm:justify-center sm:py-0"
          >
            <VideoIcon className="h-9 w-9 text-ink-muted" />
            <span className="text-sm font-semibold text-ink">Select a video from your device</span>
            <span className="text-xs text-ink-faint">Max {formatMB(MAX_VIDEO_SIZE_BYTES)}</span>
          </button>
        ) : stillUploadingVideo ? (
          <div className="flex w-full flex-col items-center gap-3 rounded-xl border border-border py-10 sm:h-full sm:justify-center sm:py-0">
            <span className="text-2xl font-extrabold tracking-tight text-ink">{videoProgress}%</span>
            <span className="text-xs text-ink-muted">Uploading video…</span>
          </div>
        ) : (
          <>
            <div className="relative w-56">
              {posterPreviewUrl ? (
                // Anteprima locale (blob: URL), non ancora su R2: caricata solo al momento del Publish.
                // Stessa proporzione 4:5 delle card episodio del profilo (ContentCard), solo più
                // piccola, per restare compatti senza scroll.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={posterPreviewUrl} alt="" className="aspect-4/5 w-56 rounded-lg object-cover" />
              ) : (
                <div className="flex aspect-4/5 w-56 items-center justify-center rounded-lg bg-surface-2">
                  <VideoIcon className="h-6 w-6 text-ink-muted" />
                </div>
              )}
              <button
                type="button"
                onClick={handleRemoveVideo}
                aria-label="Remove video"
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
              >
                <CloseIcon className="h-3.5 w-3.5" />
              </button>
            </div>

            {durationSec !== null && durationSec > 0.2 && (
              <div>
                <label htmlFor={`${uid}-scrub`} className="text-xs font-medium text-ink-muted">
                  Cover: drag to pick a moment
                </label>
                <input
                  id={`${uid}-scrub`}
                  type="range"
                  min={0}
                  max={Math.max(durationSec - 0.1, 0.1)}
                  step={0.1}
                  value={scrubTime}
                  onChange={handleScrub}
                  className="mt-1.5 w-full"
                />
              </div>
            )}

            <button
              type="button"
              onClick={() => posterInputRef.current?.click()}
              className="block text-xs font-semibold text-ink-muted underline underline-offset-2 hover:text-ink"
            >
              Or upload your own cover photo
            </button>
          </>
        )}

        {videoError && <p className="text-sm text-danger">{videoError}</p>}
      </div>

      {/* Colonna destra: a quale Journey, titolo, didascalia, opzioni avanzate, Publish. */}
      <div className="mt-4 space-y-4 sm:mt-0">
        {journeys.length > 0 && (
          <div>
            <label htmlFor={`${uid}-journey`} className="text-sm font-medium text-ink-muted">
              Add to
            </label>
            <select
              id={`${uid}-journey`}
              value={journeyChoice}
              onChange={(event) => setJourneyChoice(event.target.value)}
              className="mt-1.5 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
            >
              {journeys.map((journey) => (
                <option key={journey.id} value={journey.id}>
                  {journey.title}
                </option>
              ))}
              <option value="">+ Start a new Journey</option>
            </select>
          </div>
        )}

        {isNewJourney && (
          <div>
            <label htmlFor={`${uid}-new-journey`} className="text-sm font-medium text-ink-muted">
              {journeys.length > 0 ? "New Journey title" : "Give your Journey a title"}
            </label>
            <input
              id={`${uid}-new-journey`}
              type="text"
              required
              minLength={2}
              maxLength={100}
              value={newJourneyTitle}
              onChange={(event) => setNewJourneyTitle(event.target.value)}
              placeholder="e.g. My road to running a marathon"
              className="mt-1.5 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
            />
          </div>
        )}

        <div>
          <label htmlFor={`${uid}-title`} className="text-sm font-medium text-ink-muted">
            Episode title
          </label>
          <input
            id={`${uid}-title`}
            type="text"
            required
            minLength={2}
            maxLength={100}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Give this episode a title"
            className="mt-1.5 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
          />
        </div>

        <div>
          <label htmlFor={`${uid}-caption`} className="text-sm font-medium text-ink-muted">
            Caption
          </label>
          <textarea
            id={`${uid}-caption`}
            rows={3}
            maxLength={10000}
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            placeholder="Tell what happened in this episode."
            className="mt-1.5 w-full resize-none rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
          />
        </div>

        <button
          type="button"
          onClick={() => setAdvanced((value) => !value)}
          className="text-xs font-semibold text-ink-muted underline underline-offset-2 hover:text-ink"
        >
          {advanced ? "Hide options" : "More options (chapter, date)"}
        </button>

        <div className={advanced ? "space-y-4" : "hidden"}>
          {chapters.length > 0 && (
            <div>
              <label htmlFor={`${uid}-chapter`} className="text-sm font-medium text-ink-muted">
                Chapter
              </label>
              <select
                id={`${uid}-chapter`}
                value={chapterId}
                onChange={(event) => setChapterId(event.target.value)}
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
              type="date"
              value={occurredAt}
              onChange={(event) => setOccurredAt(event.target.value)}
              className="mt-1.5 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
            />
          </div>
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <button
          type="button"
          onClick={handlePublish}
          disabled={!canPublish}
          className="w-full rounded-full bg-ink px-6 py-3 text-sm font-semibold text-bg transition-colors hover:bg-ink-muted disabled:opacity-50"
        >
          {publishing ? "Publishing…" : "Publish"}
        </button>
      </div>
    </div>
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

function CharCount({ value, max }: { value: string; max: number }) {
  const remaining = max - value.length;
  return (
    <p
      className={`mt-1 text-right text-xs ${remaining <= 20 ? "text-danger" : "text-ink-faint"}`}
    >
      {value.length}/{max}
    </p>
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
  const [content, setContent] = useState("");
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
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder={
              kind === "POLL"
                ? "Ask a question…"
                : kind === "QUESTION"
                  ? "What do you want to ask your followers?"
                  : "Share a quick update with your followers… it disappears after 24 hours."
            }
            className="w-full resize-none rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
          />
          <CharCount value={content} max={UPDATE_TEXT_MAX_LENGTH} />
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
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder={
              extra === "POLL"
                ? "Ask a question…"
                : extra === "QUESTION"
                  ? "What do you want to ask your followers?"
                  : "Add a caption (optional)"
            }
            className="w-full resize-none rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
          />
          <CharCount value={content} max={UPDATE_TEXT_MAX_LENGTH} />
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
