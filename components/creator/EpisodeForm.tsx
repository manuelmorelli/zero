"use client";

import Image from "next/image";
import { useActionState, useId, useRef, useState } from "react";
import { ImagePlus } from "lucide-react";
import {
  createEpisode,
  createEpisodePosterUploadUrl,
  createEpisodeVideoUploadUrl,
  updateEpisode,
} from "@/lib/actions/episode";
import { ALLOWED_VIDEO_TYPES, MAX_VIDEO_SIZE_BYTES } from "@/lib/constants/video";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from "@/lib/constants/image";
import { uploadFileWithProgress } from "@/lib/upload";
import { readVideoDuration } from "@/lib/media/readVideoDuration";
import { formatDuration } from "@/lib/format/duration";

type EpisodeFormProps = {
  journeyId: string;
  chapters: { id: string; title: string }[];
  /** Preseleziona un capitolo quando il form è mostrato dentro la pagina di quel capitolo. */
  defaultChapterId?: string | null;
  episode?: {
    id: string;
    title: string;
    caption: string | null;
    videoKey: string | null;
    /** Link temporaneo già risolto della copertina propria dell'Episodio (se impostata). */
    posterUrl?: string | null;
    durationSec: number | null;
    occurredAt: Date;
    chapterId: string | null;
    publishedAt: Date | null;
  };
};

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatMB(bytes: number): string {
  return `${Math.round(bytes / (1024 * 1024))}MB`;
}

export function EpisodeForm({ journeyId, chapters, defaultChapterId, episode }: EpisodeFormProps) {
  const uid = useId();
  const [state, formAction, pending] = useActionState(
    episode ? updateEpisode : createEpisode,
    { error: null }
  );

  const [videoKey, setVideoKey] = useState<string | null>(episode?.videoKey ?? null);
  const [durationSec, setDurationSec] = useState<number | null>(episode?.durationSec ?? null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [published, setPublished] = useState(Boolean(episode?.publishedAt));

  const [posterKey, setPosterKey] = useState("");
  const [posterPreview, setPosterPreview] = useState<string | null>(episode?.posterUrl ?? null);
  const [posterError, setPosterError] = useState<string | null>(null);
  const [posterProgress, setPosterProgress] = useState<number | null>(null);
  const posterInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  async function handlePosterChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setPosterError(null);

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      setPosterError("Unsupported image format.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setPosterError(`Image is too large (max ${formatMB(MAX_IMAGE_SIZE_BYTES)}).`);
      return;
    }

    setPosterProgress(0);
    try {
      const result = await createEpisodePosterUploadUrl(
        episode ? episode.id : journeyId,
        episode ? "episode" : "journey",
        file.type
      );
      if ("error" in result) {
        setPosterError(result.error);
        setPosterProgress(null);
        return;
      }
      await uploadFileWithProgress(result.uploadUrl, file, setPosterProgress);
      setPosterKey(result.key);
      setPosterPreview(URL.createObjectURL(file));
    } catch {
      setPosterError("Upload failed. Please try again.");
    } finally {
      setPosterProgress(null);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploadError(null);

    if (!ALLOWED_VIDEO_TYPES.has(file.type)) {
      setUploadError("Unsupported video format.");
      return;
    }
    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      setUploadError(`Video is too large (max ${formatMB(MAX_VIDEO_SIZE_BYTES)}).`);
      return;
    }

    setUploadProgress(0);
    try {
      const [result, duration] = await Promise.all([
        createEpisodeVideoUploadUrl(episode ? episode.id : journeyId, episode ? "episode" : "journey", file.type),
        readVideoDuration(file),
      ]);
      if ("error" in result) {
        setUploadError(result.error);
        setUploadProgress(null);
        return;
      }
      await uploadFileWithProgress(result.uploadUrl, file, setUploadProgress);
      setVideoKey(result.key);
      setDurationSec(duration);
      setPublished(true);
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploadProgress(null);
    }
  }

  return (
    <form action={formAction} className="space-y-2.5">
      <input type="hidden" name={episode ? "episodeId" : "journeyId"} value={episode ? episode.id : journeyId} />
      <input type="hidden" name="videoKey" value={videoKey ?? ""} />
      <input type="hidden" name="durationSec" value={durationSec ?? ""} />
      <input type="hidden" name="posterKey" value={posterKey} />

      <div className="flex gap-3">
        <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-2">
          {posterPreview ? (
            <Image src={posterPreview} alt="" fill sizes="96px" className="object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-surface-2 via-surface-2 to-black" />
          )}
          <button
            type="button"
            onClick={() => posterInputRef.current?.click()}
            aria-label="Change episode cover"
            className="absolute inset-0 flex items-center justify-center bg-black/0 text-[0.6rem] font-semibold text-transparent transition-colors hover:bg-black/50 hover:text-white"
          >
            {posterProgress !== null ? `${posterProgress}%` : "Change"}
          </button>
          <span className="pointer-events-none absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-white">
            <ImagePlus className="h-3 w-3" aria-hidden="true" />
          </span>
          <input
            ref={posterInputRef}
            type="file"
            accept="image/*"
            onChange={handlePosterChange}
            className="hidden"
          />
        </div>

        <div className="flex-1">
          <label htmlFor={`${uid}-title`} className="text-xs font-medium text-ink-muted">
            Episode title
          </label>
          <input
            id={`${uid}-title`}
            name="title"
            type="text"
            required
            minLength={2}
            maxLength={100}
            defaultValue={episode?.title}
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
          />
          {posterError && <p className="mt-1 text-xs text-danger">{posterError}</p>}
          {!posterPreview && <p className="mt-1 text-[0.65rem] text-ink-faint">Cover optional — uses the Journey cover if not set.</p>}
        </div>
      </div>

      <div>
        <label htmlFor={`${uid}-caption`} className="text-xs font-medium text-ink-muted">
          Caption <span className="text-ink-faint">(optional)</span>
        </label>
        <textarea
          id={`${uid}-caption`}
          name="caption"
          rows={2}
          maxLength={10000}
          placeholder="Tell what happened in this episode."
          defaultValue={episode?.caption ?? undefined}
          className="mt-1 w-full resize-none rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
        />
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label htmlFor={`${uid}-chapter`} className="text-xs font-medium text-ink-muted">
            Chapter
          </label>
          <select
            id={`${uid}-chapter`}
            name="chapterId"
            defaultValue={episode?.chapterId ?? defaultChapterId ?? ""}
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
          >
            <option value="">No chapter</option>
            {chapters.map((chapter) => (
              <option key={chapter.id} value={chapter.id}>
                {chapter.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`${uid}-occurredAt`} className="text-xs font-medium text-ink-muted">
            When it happened
          </label>
          <input
            id={`${uid}-occurredAt`}
            name="occurredAt"
            type="date"
            required
            defaultValue={toDateInputValue(episode?.occurredAt ?? new Date())}
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
          />
        </div>
      </div>

      <div>
        <label htmlFor={`${uid}-video`} className="text-xs font-medium text-ink-muted">
          Video <span className="text-ink-faint">(required to publish, max {formatMB(MAX_VIDEO_SIZE_BYTES)})</span>
        </label>
        <div className="mt-1 flex items-center gap-3">
          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            className="shrink-0 rounded-full bg-ink px-3.5 py-1.5 text-xs font-semibold text-bg transition-colors hover:bg-ink-muted"
          >
            {videoKey ? "Replace video" : "Choose video"}
          </button>
          {uploadProgress !== null && <p className="text-xs text-ink-muted">Uploading… {uploadProgress}%</p>}
          {uploadProgress === null && uploadError && <p className="text-xs text-danger">{uploadError}</p>}
          {uploadProgress === null && !uploadError && videoKey && (
            <p className="text-xs font-medium text-ink">
              ✓ Video ready{durationSec !== null ? ` · ${formatDuration(durationSec)}` : ""}
            </p>
          )}
          {uploadProgress === null && !uploadError && !videoKey && (
            <p className="text-xs text-ink-faint">No video selected yet.</p>
          )}
        </div>
        <input
          ref={videoInputRef}
          id={`${uid}-video`}
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

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
        <span className="text-xs font-medium text-ink">
          {published ? "Published" : "Draft"}
          <span className="ml-1 font-normal text-ink-faint">
            {videoKey ? (published ? "— visible to everyone" : "— only visible to you") : "— add a video to publish"}
          </span>
        </span>
      </label>

      {state.error && <p className="text-xs text-danger">{state.error}</p>}

      <button
        type="submit"
        disabled={pending || uploadProgress !== null}
        className="w-full rounded-full bg-ink px-5 py-2 text-sm font-semibold text-bg transition-colors hover:bg-ink-muted disabled:opacity-50"
      >
        {pending ? "Saving…" : episode ? "Save changes" : "Add episode"}
      </button>
    </form>
  );
}
