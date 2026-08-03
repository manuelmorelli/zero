"use client";

import { useActionState, useId, useState } from "react";
import { createEpisode, createEpisodeVideoUploadUrl, updateEpisode } from "@/lib/actions/episode";
import { ALLOWED_VIDEO_TYPES, MAX_VIDEO_SIZE_BYTES } from "@/lib/constants/video";

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
    occurredAt: Date;
    chapterId: string | null;
  };
};

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatMB(bytes: number): string {
  return `${Math.round(bytes / (1024 * 1024))}MB`;
}

function uploadWithProgress(url: string, file: File, onProgress: (percent: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error("Upload failed."));
    };
    xhr.onerror = () => reject(new Error("Upload failed."));
    xhr.send(file);
  });
}

export function EpisodeForm({ journeyId, chapters, defaultChapterId, episode }: EpisodeFormProps) {
  const uid = useId();
  const [state, formAction, pending] = useActionState(
    episode ? updateEpisode : createEpisode,
    { error: null }
  );

  const [videoKey, setVideoKey] = useState<string | null>(episode?.videoKey ?? null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

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
      const result = await createEpisodeVideoUploadUrl(
        episode ? episode.id : journeyId,
        episode ? "episode" : "journey",
        file.type
      );
      if ("error" in result) {
        setUploadError(result.error);
        setUploadProgress(null);
        return;
      }
      await uploadWithProgress(result.uploadUrl, file, setUploadProgress);
      setVideoKey(result.key);
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploadProgress(null);
    }
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name={episode ? "episodeId" : "journeyId"} value={episode ? episode.id : journeyId} />
      <input type="hidden" name="videoKey" value={videoKey ?? ""} />

      <div>
        <label htmlFor={`${uid}-title`} className="text-sm font-medium text-ink-muted">
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
          className="mt-1.5 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
        />
      </div>

      <div>
        <label htmlFor={`${uid}-caption`} className="text-sm font-medium text-ink-muted">
          Caption <span className="text-ink-faint">(optional)</span>
        </label>
        <textarea
          id={`${uid}-caption`}
          name="caption"
          rows={5}
          maxLength={10000}
          placeholder="Tell what happened in this episode."
          defaultValue={episode?.caption ?? undefined}
          className="mt-1.5 w-full resize-none rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
        />
      </div>

      <div>
        <label htmlFor={`${uid}-chapter`} className="text-sm font-medium text-ink-muted">
          Chapter
        </label>
        <select
          id={`${uid}-chapter`}
          name="chapterId"
          defaultValue={episode?.chapterId ?? defaultChapterId ?? ""}
          className="mt-1.5 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
        >
          <option value="">No chapter</option>
          {chapters.map((chapter) => (
            <option key={chapter.id} value={chapter.id}>
              {chapter.title}
            </option>
          ))}
        </select>
        <p className="mt-1.5 text-xs text-ink-faint">
          Use chapters only if you want to group related episodes — not required.
        </p>
      </div>

      <div>
        <label htmlFor={`${uid}-video`} className="text-sm font-medium text-ink-muted">
          Video <span className="text-ink-faint">(optional, max {formatMB(MAX_VIDEO_SIZE_BYTES)})</span>
        </label>
        <input
          id={`${uid}-video`}
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          className="mt-1.5 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors file:mr-3 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-1.5 file:text-sm file:font-semibold file:text-bg"
        />
        {uploadProgress !== null && (
          <p className="mt-1.5 text-sm text-ink-muted">Uploading… {uploadProgress}%</p>
        )}
        {uploadError && <p className="mt-1.5 text-sm text-danger">{uploadError}</p>}
        {uploadProgress === null && !uploadError && videoKey && (
          <p className="mt-1.5 text-sm text-ink-muted">Video ready.</p>
        )}
      </div>

      <div>
        <label htmlFor={`${uid}-occurredAt`} className="text-sm font-medium text-ink-muted">
          When it actually happened
        </label>
        <input
          id={`${uid}-occurredAt`}
          name="occurredAt"
          type="date"
          required
          defaultValue={toDateInputValue(episode?.occurredAt ?? new Date())}
          className="mt-1.5 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
        />
      </div>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <button
        type="submit"
        disabled={pending || uploadProgress !== null}
        className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-bg transition-colors hover:bg-ink-muted disabled:opacity-50"
      >
        {pending ? "Saving…" : episode ? "Save changes" : "Add episode"}
      </button>
    </form>
  );
}
