"use client";

import Image from "next/image";
import { useActionState, useRef, useState } from "react";
import { ChevronDown, ImagePlus, Trash2 } from "lucide-react";
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
import { FIELD } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CHIP } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";

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

  const [categoryOpen, setCategoryOpen] = useState(false);

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
      >
        {journey && <input type="hidden" name="journeyId" value={journey.id} />}

        <div className="grid gap-4 md:grid-cols-[1fr_minmax(0,220px)]">
          <div className="space-y-4">
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
                className={cn(FIELD, "mt-1.5")}
              />
            </div>

            <div>
              <label htmlFor="description" className="text-sm font-medium text-ink-muted">
                Description <span className="text-ink-faint">(required to publish)</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                maxLength={2000}
                placeholder="Tell the story behind this Journey: what it's really about, and why it matters to you."
                value={draft.description}
                onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
                className={cn(FIELD, "mt-1.5 resize-none")}
              />
              <p className="mt-1.5 text-sm text-ink-faint">
                This is the line people will see first if your journey gets featured on Zero's homepage.
              </p>
            </div>

            <div>
              <input type="hidden" name="category" value={draft.category} />
              <button
                type="button"
                onClick={() => setCategoryOpen((value) => !value)}
                aria-expanded={categoryOpen}
                className="flex w-full items-center justify-between text-left"
              >
                <span className="text-sm font-medium text-ink-muted">
                  Category <span className="text-ink-faint">(optional)</span>
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-ink-muted transition-transform ${categoryOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </button>

              {!categoryOpen && (
                <div className="mt-1.5">
                  {draft.category ? (
                    <span className="inline-flex rounded-full border border-ember-line bg-ember-soft px-2.5 py-1 text-sm text-ember">
                      {draft.category}
                    </span>
                  ) : (
                    <span className="text-sm text-ink-faint">No Category Selected</span>
                  )}
                </div>
              )}

              <div
                className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                  categoryOpen ? "mt-1.5 grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="flex flex-wrap gap-1.5 pb-0.5">
                    {JOURNEY_CATEGORIES.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() =>
                          setDraft((prev) => ({ ...prev, category: prev.category === category ? "" : category }))
                        }
                        className={cn(CHIP, draft.category === category && "border-ember-line bg-ember-soft text-ember")}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
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
                className={cn(FIELD, "mt-1.5")}
              />
            </div>
          </div>

          {journey && (
            <div>
              <span className="text-sm font-medium text-ink-muted">Cover</span>
              <div className="relative mt-1.5 aspect-4/3 w-full overflow-hidden rounded-xl border border-border bg-surface-2">
                {coverPreview ? (
                  <Image src={coverPreview} alt="" fill sizes="220px" className="object-cover" />
                ) : (
                  <div className="absolute inset-0 cover-placeholder" />
                )}
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  aria-label="Change cover photo"
                  className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-transparent text-sm font-semibold text-transparent transition-colors hover:bg-bg hover:text-on-photo"
                >
                  <ImagePlus className="h-4 w-4" aria-hidden="true" />
                  {coverProgress !== null ? `${coverProgress}%` : "Change"}
                </button>
                <span className="pointer-events-none absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-scrim text-on-photo">
                  <ImagePlus className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChosen}
                  className="hidden"
                />
              </div>
              {coverError && <p className="mt-1.5 text-sm text-danger">{coverError}</p>}
            </div>
          )}
        </div>

        {state.error && <p className="mt-4 text-sm text-danger">{state.error}</p>}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          {journey ? (
            <Button variant="danger" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Delete Journey
            </Button>
          ) : (
            <span />
          )}
          <div className="flex flex-wrap items-center gap-2.5">
            {journey && dirty && (
              <Button variant="secondary" onClick={() => setDraft(initialDraft)}>
                Cancel
              </Button>
            )}
            <Button variant="primary" type="submit" disabled={pending || coverProgress !== null || (journey ? !dirty : false)}>
              {pending ? "Saving…" : journey ? "Save changes" : "Create Journey"}
            </Button>
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
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="danger" type="submit">
              Delete
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
