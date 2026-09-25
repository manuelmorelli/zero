"use client";

import { useActionState, useRef, useState } from "react";
import { FileUp, Trash2 } from "lucide-react";
import {
  createCommunityListing,
  createCommunityListingFileUploadUrl,
  deleteCommunityListing,
  updateCommunityListing,
} from "@/lib/actions/communityListing";
import {
  COMMUNITY_LISTING_LABELS,
  listingHasDate,
  listingHasFile,
  listingSupportsFree,
  type CommunityListingType,
} from "@/lib/constants/communityListing";
import { ALLOWED_DIGITAL_PRODUCT_TYPES, MAX_DIGITAL_PRODUCT_SIZE_BYTES } from "@/lib/constants/file";
import { uploadFileWithProgress } from "@/lib/upload";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type CommunityListingDraft = {
  title: string;
  description: string;
  isFree: boolean;
  price: number | null;
  startsAt: string | null;
};

type CommunityListingFormProps = {
  type: CommunityListingType;
  listing?: {
    id: string;
    title: string;
    description: string | null;
    isFree: boolean;
    price: number | null;
    startsAt: string | null;
    fileUrl: string | null;
  };
  initialDraft?: CommunityListingDraft;
};

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

function formatMB(bytes: number): string {
  return `${Math.round(bytes / (1024 * 1024))}MB`;
}

export function CommunityListingForm({ type, listing, initialDraft }: CommunityListingFormProps) {
  const [state, formAction, pending] = useActionState(
    listing ? updateCommunityListing : createCommunityListing,
    { error: null }
  );

  const [title, setTitle] = useState(listing?.title ?? initialDraft?.title ?? "");
  const [description, setDescription] = useState(listing?.description ?? initialDraft?.description ?? "");
  const [isFree, setIsFree] = useState(listing?.isFree ?? initialDraft?.isFree ?? false);
  const [price, setPrice] = useState(
    listing?.price?.toString() ?? initialDraft?.price?.toString() ?? ""
  );
  const [startsAt, setStartsAt] = useState(
    toDatetimeLocal(listing?.startsAt ?? initialDraft?.startsAt ?? null)
  );

  const [fileKey, setFileKey] = useState("");
  const [fileName, setFileName] = useState<string | null>(listing?.fileUrl ? "Current file" : null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileProgress, setFileProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const supportsFree = listingSupportsFree(type);
  const hasDate = listingHasDate(type);
  const hasFile = listingHasFile(type);

  async function handleFileChosen(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !listing) return;

    setFileError(null);
    if (!ALLOWED_DIGITAL_PRODUCT_TYPES.has(file.type)) {
      setFileError("Unsupported format (use PDF, ZIP or EPUB).");
      return;
    }
    if (file.size > MAX_DIGITAL_PRODUCT_SIZE_BYTES) {
      setFileError(`File is too large (max ${formatMB(MAX_DIGITAL_PRODUCT_SIZE_BYTES)}).`);
      return;
    }

    setFileProgress(0);
    try {
      const result = await createCommunityListingFileUploadUrl(listing.id, file.type);
      if ("error" in result) {
        setFileError(result.error);
        setFileProgress(null);
        return;
      }
      await uploadFileWithProgress(result.uploadUrl, file, setFileProgress);
      setFileKey(result.key);
      setFileName(file.name);
    } catch {
      setFileError("Upload failed. Please try again.");
    } finally {
      setFileProgress(null);
    }
  }

  return (
    <>
      <form
        action={(formData) => {
          if (hasFile) formData.set("fileKey", fileKey);
          formAction(formData);
        }}
        className="space-y-4"
      >
        {listing ? (
          <>
            <input type="hidden" name="listingId" value={listing.id} />
            <input type="hidden" name="listingType" value={type} />
          </>
        ) : (
          <input type="hidden" name="type" value={type} />
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
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-1.5 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
          />
        </div>

        <div>
          <label htmlFor="description" className="text-sm font-medium text-ink-muted">
            Description <span className="text-ink-faint">(optional)</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            maxLength={2000}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="mt-1.5 w-full resize-none rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
          />
        </div>

        {hasDate && (
          <div>
            <label htmlFor="startsAt" className="text-sm font-medium text-ink-muted">
              Date {COMMUNITY_LISTING_LABELS[type] === "Event" ? "and time" : ""}
            </label>
            <input
              id="startsAt"
              name="startsAt"
              type="datetime-local"
              value={startsAt}
              onChange={(event) => setStartsAt(event.target.value)}
              className="mt-1.5 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
            />
          </div>
        )}

        {supportsFree && (
          <label className="flex items-center gap-2.5 text-sm text-ink">
            <input
              type="checkbox"
              name="isFree"
              checked={isFree}
              onChange={(event) => setIsFree(event.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            This is free (no payment, people can RSVP directly)
          </label>
        )}

        {!isFree && (
          <div>
            <label htmlFor="price" className="text-sm font-medium text-ink-muted">
              Price
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min="0.01"
              step="0.01"
              required={!isFree}
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              className="mt-1.5 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
            />
          </div>
        )}

        {hasFile && (
          <div>
            <span className="text-sm font-medium text-ink-muted">File to sell</span>
            {listing ? (
              <div className="mt-1.5 flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3">
                <FileUp className="h-4 w-4 shrink-0 text-ink-faint" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate text-sm text-ink-muted">
                  {fileProgress !== null ? `Uploading… ${fileProgress}%` : fileName ?? "No file uploaded yet"}
                </span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="shrink-0 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-ink-muted transition-colors hover:border-ink-muted"
                >
                  {fileName ? "Replace" : "Upload"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.zip,.epub"
                  onChange={handleFileChosen}
                  className="hidden"
                />
              </div>
            ) : (
              <p className="mt-1.5 text-xs text-ink-faint">
                You&apos;ll be able to upload the file right after creating this Draft.
              </p>
            )}
            {fileError && <p className="mt-1.5 text-xs text-danger">{fileError}</p>}
          </div>
        )}

        {state.error && <p className="text-sm text-danger">{state.error}</p>}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          {listing ? (
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold text-danger transition-colors hover:border-danger"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Delete
            </button>
          ) : (
            <span />
          )}
          <button
            type="submit"
            disabled={pending || fileProgress !== null}
            className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-bg transition-colors hover:bg-ink-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Saving…" : listing ? "Save changes" : `Create ${COMMUNITY_LISTING_LABELS[type]}`}
          </button>
        </div>
      </form>

      {listing && (
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Delete {COMMUNITY_LISTING_LABELS[type]}</DialogTitle>
              <DialogDescription>
                {`"${listing.title}" will be removed for good, including from your public Subscribe page. This can't be undone.`}
              </DialogDescription>
            </DialogHeader>
            <form action={deleteCommunityListing}>
              <input type="hidden" name="listingId" value={listing.id} />
              <input type="hidden" name="listingType" value={type} />
              <DialogFooter>
                <button
                  type="button"
                  onClick={() => setDeleteOpen(false)}
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
      )}
    </>
  );
}
