"use client";

import { useActionState, useId, useRef, useState } from "react";
import { Video as VideoIcon, X as CloseIcon } from "lucide-react";
import { createEpisode, createQuickPosterUploadUrl, createQuickVideoUploadUrl } from "@/lib/actions/episode";
import { ALLOWED_VIDEO_TYPES, MAX_VIDEO_SIZE_BYTES } from "@/lib/constants/video";
import { uploadFileWithProgress } from "@/lib/upload";
import { readVideoDuration } from "@/lib/media/readVideoDuration";
import { captureVideoFrame } from "@/lib/media/captureVideoFrame";
import { FIELD } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PANEL_DASHED, PANEL } from "@/components/ui/panel";

type Chapter = { id: string; title: string };

type AddEpisodeCardProps = {
  journeyId: string;
  chapters: Chapter[];
  defaultChapterId?: string | null;
};

function formatMB(bytes: number): string {
  return `${Math.round(bytes / (1024 * 1024))}MB`;
}

function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Stessa esperienza in due gesti della card "+" (video -> Publish), applicata dentro un Journey
 * già scelto (niente selettore Journey, non serve): usata dal bottone "Add Episode" della
 * dashboard al posto del vecchio form più macchinoso (vedi AddEpisodeButton.tsx). A differenza
 * del "+" globale, qui resta l'interruttore Bozza/Pubblicato — richiesto esplicitamente da
 * Manuel, unica vera differenza funzionale rimasta tra i due flussi. */
export function AddEpisodeCard({ journeyId, chapters, defaultChapterId }: AddEpisodeCardProps) {
  const uid = useId();
  const [state, formAction, pending] = useActionState(createEpisode, { error: null });

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoKey, setVideoKey] = useState<string | null>(null);
  const [durationSec, setDurationSec] = useState<number | null>(null);
  const [videoProgress, setVideoProgress] = useState<number | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

  const [posterPreviewUrl, setPosterPreviewUrl] = useState<string | null>(null);
  const [posterKey, setPosterKey] = useState("");
  const [posterUploading, setPosterUploading] = useState(false);
  const [scrubTime, setScrubTime] = useState(0);

  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [advanced, setAdvanced] = useState(false);
  const [chapterId, setChapterId] = useState(defaultChapterId ?? "");
  const [occurredAt, setOccurredAt] = useState(todayInputValue());
  const [published, setPublished] = useState(false);
  const [isSponsored, setIsSponsored] = useState(false);

  const videoInputRef = useRef<HTMLInputElement>(null);

  const stillUploadingVideo = videoProgress !== null && videoProgress < 100;

  async function uploadPosterBlob(blob: Blob) {
    setPosterPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(blob);
    });
    setPosterUploading(true);
    try {
      const result = await createQuickPosterUploadUrl(blob.type || "image/jpeg");
      if ("error" in result) return;
      await uploadFileWithProgress(result.uploadUrl, blob, () => {});
      setPosterKey(result.key);
    } finally {
      setPosterUploading(false);
    }
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
      // Un episodio nuovo con un video pronto parte pubblicato di default (come il "+"): resta
      // comunque possibile riportarlo a Bozza con l'interruttore sotto, prima di salvare.
      setPublished(true);
    } catch {
      setVideoError("Upload failed. Please try again.");
      setVideoProgress(null);
      return;
    }

    // Copertina proposta in automatico da un fotogramma del video, come su Instagram e come il "+".
    const initialTime = duration ? Math.min(1, duration / 2) : 0;
    setScrubTime(initialTime);
    const frame = await captureVideoFrame(file, initialTime);
    if (frame) await uploadPosterBlob(frame);
  }

  function handleRemoveVideo() {
    setVideoFile(null);
    setVideoKey(null);
    setDurationSec(null);
    setVideoProgress(null);
    setVideoError(null);
    setScrubTime(0);
    setPosterKey("");
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
    if (frame) await uploadPosterBlob(frame);
  }

  return (
    <form action={formAction} className="sm:grid sm:grid-cols-[260px_1fr] sm:gap-6">
      <input type="hidden" name="journeyId" value={journeyId} />
      <input type="hidden" name="videoKey" value={videoKey ?? ""} />
      <input type="hidden" name="durationSec" value={durationSec ?? ""} />
      <input type="hidden" name="posterKey" value={posterKey} />
      <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoChange} className="hidden" />

      <div className="space-y-3">
        {!videoFile ? (
          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            className={cn(PANEL_DASHED, "flex w-full flex-col items-center gap-3 py-12 sm:h-full sm:justify-center sm:py-0")}
          >
            <VideoIcon className="h-9 w-9 text-ink-muted" aria-hidden="true" />
            <span className="text-sm font-semibold text-ink">Select a Video from Your Device</span>
            <span className="text-sm text-ink-faint">Max {formatMB(MAX_VIDEO_SIZE_BYTES)}</span>
          </button>
        ) : stillUploadingVideo ? (
          <div className={cn(PANEL, "flex w-full flex-col items-center gap-3 sm:h-full sm:justify-center sm:py-0")}>
            <span className="text-2xl font-extrabold tracking-tight text-ink">{videoProgress}%</span>
            <span className="text-sm text-ink-muted">Uploading Video…</span>
          </div>
        ) : (
          <>
            <div className="relative w-56">
              {posterPreviewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={posterPreviewUrl} alt="" className="aspect-4/3 w-56 rounded-lg object-cover" />
              ) : (
                <div className="flex aspect-4/3 w-56 items-center justify-center rounded-lg bg-surface-2">
                  <VideoIcon className="h-6 w-6 text-ink-muted" aria-hidden="true" />
                </div>
              )}
              <button
                type="button"
                onClick={handleRemoveVideo}
                aria-label="Remove video"
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-scrim text-on-photo transition-colors hover:bg-bg"
              >
                <CloseIcon className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>

            {durationSec !== null && durationSec > 0.2 && (
              <div>
                <label htmlFor={`${uid}-scrub`} className="text-sm font-medium text-ink-muted">
                  Cover: Drag to Pick a Moment
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
          </>
        )}

        {videoError && <p className="text-sm text-danger">{videoError}</p>}
      </div>

      <div className="mt-4 space-y-4 sm:mt-0">
        <div>
          <label htmlFor={`${uid}-title`} className="text-sm font-medium text-ink-muted">
            Episode Title
          </label>
          <input
            id={`${uid}-title`}
            name="title"
            type="text"
            required
            minLength={2}
            maxLength={100}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Give this episode a title"
            className={cn(FIELD, "mt-1.5")}
          />
        </div>

        <div>
          <label htmlFor={`${uid}-caption`} className="text-sm font-medium text-ink-muted">
            Caption
          </label>
          <textarea
            id={`${uid}-caption`}
            name="caption"
            rows={3}
            maxLength={10000}
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            placeholder="Tell what happened in this episode."
            className={cn(FIELD, "mt-1.5 resize-none")}
          />
        </div>

        <button
          type="button"
          onClick={() => setAdvanced((value) => !value)}
          className="text-sm font-semibold text-ink-muted underline underline-offset-2 hover:text-ink"
        >
          {advanced ? "Hide options" : chapters.length > 0 ? "More options (chapter, date)" : "More options (date)"}
        </button>

        <div className={advanced ? "space-y-4" : "hidden"}>
          {chapters.length > 0 && (
            <div>
              <label htmlFor={`${uid}-chapter`} className="text-sm font-medium text-ink-muted">
                Chapter
              </label>
              <select
                id={`${uid}-chapter`}
                name="chapterId"
                value={chapterId}
                onChange={(event) => setChapterId(event.target.value)}
                className={cn(FIELD, "mt-1.5")}
              >
                <option value="">No Chapter</option>
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
              When It Happened
            </label>
            <input
              id={`${uid}-occurredAt`}
              name="occurredAt"
              type="date"
              required
              value={occurredAt}
              onChange={(event) => setOccurredAt(event.target.value)}
              className={cn(FIELD, "mt-1.5")}
            />
          </div>
        </div>

        <Switch
          name="isSponsored"
          label="Sponsored content"
          description="Turn on if a brand paid you or gave you something to feature it."
          checked={isSponsored}
          onChange={setIsSponsored}
        />

        <label
          className={`flex items-center gap-2 rounded-lg border border-border bg-surface px-3.5 py-2 ${
            videoKey ? "" : "opacity-60"
          }`}
        >
          <input
            type="checkbox"
            name="published"
            checked={published}
            disabled={!videoKey}
            onChange={(event) => setPublished(event.target.checked)}
            className="h-4 w-4 accent-ink disabled:cursor-not-allowed"
          />
          <span className="text-sm font-medium text-ink">
            {published ? "Published" : "Draft"}
            <span className="ml-1 font-normal text-ink-faint">
              {videoKey ? (published ? "— visible to everyone" : "— only visible to you") : "— add a video first"}
            </span>
          </span>
        </label>

        {state.error && <p className="text-sm text-danger">{state.error}</p>}

        <Button variant="primary" type="submit" disabled={!videoKey || stillUploadingVideo || posterUploading || pending} className="w-full">
          {pending ? "Saving…" : "Add episode"}
        </Button>
      </div>
    </form>
  );
}
