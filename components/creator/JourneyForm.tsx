"use client";

import Image from "next/image";
import { useActionState, useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import {
  createJourney,
  createJourneyCoverUploadUrl,
  deleteJourney,
  updateJourney,
} from "@/lib/actions/journey";
import { JOURNEY_CATEGORIES } from "@/lib/constants/categories";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from "@/lib/constants/image";
import { uploadFileWithProgress } from "@/lib/upload";
import { ImageCropper } from "@/components/common/ImageCropper";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type JourneyFormProps = {
  journey?: {
    id: string;
    title: string;
    description: string | null;
    category: string | null;
    tags: string[];
    coverUrl: string | null;
  };
};

function formatMB(bytes: number): string {
  return `${Math.round(bytes / (1024 * 1024))}MB`;
}

const INITIAL_DRAFT = { title: "", description: "", category: "", tags: "" };

export function JourneyForm({ journey }: JourneyFormProps) {
  const [state, formAction, pending] = useActionState(
    journey ? updateJourney : createJourney,
    { error: null }
  );

  const initialDraft = journey
    ? {
        title: journey.title,
        description: journey.description ?? "",
        category: journey.category ?? "",
        tags: journey.tags.join(", "),
      }
    : INITIAL_DRAFT;
  const [draft, setDraft] = useState(initialDraft);
  const dirty =
    draft.title !== initialDraft.title ||
    draft.description !== initialDraft.description ||
    draft.category !== initialDraft.category ||
    draft.tags !== initialDraft.tags;

  const [coverKey, setCoverKey] = useState("");
  const [coverPreview, setCoverPreview] = useState(journey?.coverUrl ?? null);
  const [coverError, setCoverError] = useState<string | null>(null);
  const [coverProgress, setCoverProgress] = useState<number | null>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  function handleCoverChosen(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setCoverError(null);
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      setCoverError("Unsupported image format (use JPG, PNG or WebP).");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setCoverError(`Image is too large (max ${formatMB(MAX_IMAGE_SIZE_BYTES)}).`);
      return;
    }
    setCropImageSrc(URL.createObjectURL(file));
  }

  async function handleCropConfirm(blob: Blob) {
    setCropImageSrc(null);
    if (!journey) return;

    setCoverError(null);
    setCoverProgress(0);
    try {
      const result = await createJourneyCoverUploadUrl(journey.id, blob.type);
      if ("error" in result) {
        setCoverError(result.error);
        setCoverProgress(null);
        return;
      }
      await uploadFileWithProgress(result.uploadUrl, blob, setCoverProgress);
      setCoverKey(result.key);
      setCoverPreview(URL.createObjectURL(blob));
    } catch {
      setCoverError("Upload failed. Please try again.");
    } finally {
      setCoverProgress(null);
    }
  }

  return (
    <>
      <form
        action={(formData) => {
          formData.set("coverKey", coverKey);
          formAction(formData);
        }}
        className="space-y-4"
      >
        {journey && <input type="hidden" name="journeyId" value={journey.id} />}

        {journey && (
          <div>
            <span className="text-sm font-medium text-ink-muted">Cover</span>
            <div className="relative mt-1.5 aspect-4/5 w-32 overflow-hidden rounded-xl border border-border bg-surface-2">
              {coverPreview ? (
                <Image src={coverPreview} alt="" fill sizes="128px" className="object-cover" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-surface-2 via-surface-2 to-black" />
              )}
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/0 text-[0.65rem] font-semibold text-transparent transition-colors hover:bg-black/50 hover:text-white"
              >
                <ImagePlus className="h-4 w-4" aria-hidden="true" />
                {coverProgress !== null ? `${coverProgress}%` : "Change"}
              </button>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverChosen}
                className="hidden"
              />
            </div>
            {coverError && <p className="mt-1.5 text-xs text-danger">{coverError}</p>}
          </div>
        )}

        <div>
          <label htmlFor="title" className="text-sm font-medium text-ink-muted">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            minLength={2}
            maxLength={100}
            value={draft.title}
            onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
            className="mt-1.5 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
          />
        </div>

        <div>
          <label htmlFor="description" className="text-sm font-medium text-ink-muted">
            Presentation <span className="text-ink-faint">(optional)</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            maxLength={2000}
            placeholder="Goal, context, motivations, what followers can expect."
            value={draft.description}
            onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
            className="mt-1.5 w-full resize-none rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
          />
        </div>

        <div>
          <span className="text-sm font-medium text-ink-muted">
            Category <span className="text-ink-faint">(optional)</span>
          </span>
          <input type="hidden" name="category" value={draft.category} />
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {JOURNEY_CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() =>
                  setDraft((prev) => ({ ...prev, category: prev.category === category ? "" : category }))
                }
                className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                  draft.category === category
                    ? "border-ember/50 bg-ember/15 text-ember"
                    : "border-border text-ink-muted hover:border-ink-muted hover:text-ink"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="tags" className="text-sm font-medium text-ink-muted">
            Tags <span className="text-ink-faint">(comma-separated)</span>
          </label>
          <input
            id="tags"
            name="tags"
            type="text"
            maxLength={200}
            placeholder="fitness, running"
            value={draft.tags}
            onChange={(event) => setDraft((prev) => ({ ...prev, tags: event.target.value }))}
            className="mt-1.5 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
          />
        </div>

        {state.error && <p className="text-sm text-danger">{state.error}</p>}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {journey ? (
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold text-danger transition-colors hover:border-danger"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Delete Journey
            </button>
          ) : (
            <span />
          )}
          <div className="flex flex-wrap items-center gap-2.5">
            {journey && (
              <span className="text-xs text-ink-muted">
                {dirty ? "Unsaved changes" : "All changes saved"}
              </span>
            )}
            {journey && dirty && (
              <button
                type="button"
                onClick={() => setDraft(initialDraft)}
                className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-ink-muted transition-colors hover:border-ink-muted"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={pending || coverProgress !== null || (journey ? !dirty : false)}
              className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-bg transition-colors hover:bg-ink-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending ? "Saving…" : journey ? "Save changes" : "Create Journey"}
            </button>
          </div>
        </div>
      </form>

      {cropImageSrc && (
        <ImageCropper
          imageSrc={cropImageSrc}
          title="Journey cover"
          aspect={4 / 5}
          cropShape="rect"
          onCancel={() => setCropImageSrc(null)}
          onConfirm={handleCropConfirm}
        />
      )}

      {journey && (
        <DeleteJourneyFormDialog
          journeyId={journey.id}
          title={journey.title}
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
        />
      )}
    </>
  );
}

function DeleteJourneyFormDialog({
  journeyId,
  title,
  open,
  onOpenChange,
}: {
  journeyId: string;
  title: string;
  open: boolean;
  onOpenChange: (next: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Journey</DialogTitle>
          <DialogDescription>
            {`"${title}" will be deleted for good, including its Chapters and Episodes — it will also disappear from your public profile. This can't be undone.`}
          </DialogDescription>
        </DialogHeader>
        <form action={deleteJourney}>
          <input type="hidden" name="journeyId" value={journeyId} />
          <DialogFooter>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-full border border-border px-4 py-2 text-[0.8rem] font-semibold text-ink-muted transition-colors hover:border-ink-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full bg-danger px-4 py-2 text-[0.8rem] font-semibold text-white transition-colors hover:bg-danger/90"
            >
              Delete
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
