"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Video as VideoIcon, X as CloseIcon } from "lucide-react";
import { createQuickPosterUploadUrl, createQuickVideoUploadUrl } from "@/lib/actions/episode";
import { ALLOWED_VIDEO_TYPES, MAX_EPISODE_DURATION_SEC, MAX_VIDEO_SIZE_BYTES } from "@/lib/constants/video";
import { uploadFileWithProgress } from "@/lib/upload";
import { readVideoDuration } from "@/lib/media/readVideoDuration";
import { captureVideoFrame } from "@/lib/media/captureVideoFrame";
import { cn } from "@/lib/utils";
import { PANEL_DASHED, PANEL } from "@/components/ui/panel";

export type EpisodeVideoStatus = {
  hasVideo: boolean;
  /** Vero mentre video o copertina stanno ancora salendo: il salvataggio va bloccato. */
  busy: boolean;
};

function formatMB(bytes: number): string {
  return `${Math.round(bytes / (1024 * 1024))}MB`;
}

/** Scelta del video di un episodio con copertina proposta da un fotogramma (trascinabile), come il
 * "+": condivisa tra "Add Episode" (AddEpisodeCard.tsx) e la pagina di creazione del Journey
 * (JourneyForm.tsx), così il caricamento si comporta allo stesso modo ovunque. Scrive da sé i
 * campi nascosti videoKey, durationSec e posterKey del form che la contiene. */
export function EpisodeVideoField({
  onChange,
  pickerClassName,
}: {
  onChange?: (status: EpisodeVideoStatus) => void;
  pickerClassName?: string;
}) {
  const uid = useId();

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoKey, setVideoKey] = useState<string | null>(null);
  const [durationSec, setDurationSec] = useState<number | null>(null);
  const [videoProgress, setVideoProgress] = useState<number | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

  const [posterPreviewUrl, setPosterPreviewUrl] = useState<string | null>(null);
  const [posterKey, setPosterKey] = useState("");
  const [posterUploading, setPosterUploading] = useState(false);
  const [scrubTime, setScrubTime] = useState(0);

  const videoInputRef = useRef<HTMLInputElement>(null);

  const stillUploadingVideo = videoProgress !== null && videoProgress < 100;

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });
  const hasVideo = videoKey !== null;
  const busy = stillUploadingVideo || posterUploading;
  useEffect(() => {
    onChangeRef.current?.({ hasVideo, busy });
  }, [hasVideo, busy]);

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
    if (duration !== null && duration > MAX_EPISODE_DURATION_SEC) {
      setVideoError(`Video is too long (max ${MAX_EPISODE_DURATION_SEC / 60} min).`);
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
    <div className="space-y-3">
      <input type="hidden" name="videoKey" value={videoKey ?? ""} />
      <input type="hidden" name="durationSec" value={durationSec ?? ""} />
      <input type="hidden" name="posterKey" value={posterKey} />
      <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoChange} className="hidden" />

      {!videoFile ? (
        <button
          type="button"
          onClick={() => videoInputRef.current?.click()}
          className={cn(PANEL_DASHED, "flex w-full flex-col items-center gap-3 py-12", pickerClassName)}
        >
          <VideoIcon className="h-9 w-9 text-ink-muted" aria-hidden="true" />
          <span className="text-sm font-semibold text-ink">Select a Video from Your Device</span>
          <span className="text-sm text-ink-faint">
            Max {MAX_EPISODE_DURATION_SEC / 60} min, {formatMB(MAX_VIDEO_SIZE_BYTES)}
          </span>
        </button>
      ) : stillUploadingVideo ? (
        <div className={cn(PANEL, "flex w-full flex-col items-center gap-3", pickerClassName)}>
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
  );
}
