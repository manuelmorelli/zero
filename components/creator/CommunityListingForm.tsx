"use client";

import Image from "next/image";
import { useActionState, useRef, useState } from "react";
import { FileUp, ImagePlus, Trash2 } from "lucide-react";
import {
  createCommunityListing,
  createCommunityListingCoverUploadUrl,
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
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from "@/lib/constants/image";
import { uploadFileWithProgress } from "@/lib/upload";
import { ImageCropper } from "@/components/common/ImageCropper";
import { aiImageUrl } from "@/components/creator/CommunityAiChatImage";
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
import { Button } from "@/components/ui/button";
import { PANEL } from "@/components/ui/panel";

export type CommunityListingDraft = {
  title: string;
  description: string;
  isFree: boolean;
  price: number | null;
  startsAt: string | null;
  location?: string | null;
  /** Immagine creata dall'AI nella chat e scelta con "Use as cover" (chiave R2 "ai-images/..."). */
  coverKey?: string | null;
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
    location: string | null;
    fileUrl: string | null;
    coverUrl: string | null;
  };
  initialDraft?: CommunityListingDraft;
  /** Chiamata all'invio del modulo: la chat AI la usa per non riproporre una bozza già usata. */
  onSubmitted?: () => void;
};

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  // Ora locale, non UTC: con toISOString() le 18:00 in Italia comparivano come 17:00 nel campo.
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatMB(bytes: number): string {
  return `${Math.round(bytes / (1024 * 1024))}MB`;
}

export function CommunityListingForm({ type, listing, initialDraft, onSubmitted }: CommunityListingFormProps) {
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
  )
  const [location, setLocation] = useState(listing?.location ?? initialDraft?.location ?? "");

  const [fileKey, setFileKey] = useState("");
  const [fileName, setFileName] = useState<string | null>(listing?.fileUrl ? "Current file" : null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileProgress, setFileProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [coverKey, setCoverKey] = useState(initialDraft?.coverKey ?? "");
  const [coverPreview, setCoverPreview] = useState(
    listing?.coverUrl ?? (initialDraft?.coverKey ? aiImageUrl(initialDraft.coverKey) : null)
  );
  const [coverError, setCoverError] = useState<string | null>(null);
  const [coverProgress, setCoverProgress] = useState<number | null>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

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
    if (!listing) return;

    setCoverError(null);
    setCoverProgress(0);
    try {
      const result = await createCommunityListingCoverUploadUrl(type, listing.id, blob.type);
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
          if (hasFile) formData.set("fileKey", fileKey);
          formData.set("coverKey", coverKey);
          onSubmitted?.();
          formAction(formData);
        }}
        className="space-y-4"
      >
        {(listing || coverPreview) && (
          <div>
            <span className="text-sm font-medium text-ink-muted">Cover</span>
            <div className="relative mt-1.5 aspect-video w-full max-w-xs overflow-hidden rounded-xl border border-border bg-surface-2">
              {coverPreview ? (
                <Image
                  src={coverPreview}
                  alt=""
                  fill
                  sizes="320px"
                  unoptimized={coverPreview.startsWith("/api/")}
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 cover-placeholder" />
              )}
              {listing && (
                <>
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    aria-label="Change cover photo"
                    className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-transparent text-sm font-semibold text-transparent transition-colors hover:bg-bg hover:text-on-photo"
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
                </>
              )}
            </div>
            {coverError && <p className="mt-1.5 text-sm text-danger">{coverError}</p>}
          </div>
        )}
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
            className={cn(FIELD, "mt-1.5")}
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
            className={cn(FIELD, "mt-1.5 resize-none")}
          />
        </div>

        {hasDate && (
          <>
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
                className={cn(FIELD, "mt-1.5")}
              />
            </div>
            <div>
              <label htmlFor="location" className="text-sm font-medium text-ink-muted">
                Location or link <span className="text-ink-faint">(optional)</span>
              </label>
              <input
                id="location"
                name="location"
                type="text"
                placeholder="e.g. Via Roma 12, Milan  or  zoom.us/j/123456"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className={cn(FIELD, "mt-1.5")}
              />
            </div>
          </>
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
              type="text"
              inputMode="decimal"
              pattern="[0-9]+([.][0-9]{1,2})?"
              title="A price like 25 or 19.99"
              required={!isFree}
              value={price}
              onChange={(event) => setPrice(event.target.value.replace(",", "."))}
              className={cn(FIELD, "mt-1.5")}
            />
          </div>
        )}

        {hasFile && (
          <div>
            <span className="text-sm font-medium text-ink-muted">File to sell</span>
            {listing ? (
              <div className={cn(PANEL, "mt-1.5 flex items-center gap-3")}>
                <FileUp className="h-4 w-4 shrink-0 text-ink-faint" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate text-sm text-ink-muted">
                  {fileProgress !== null ? `Uploading… ${fileProgress}%` : fileName ?? "No file uploaded yet"}
                </span>
                <Button variant="secondary" onClick={() => fileInputRef.current?.click()} className="shrink-0">
                  {fileName ? "Replace" : "Upload"}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.zip,.epub"
                  onChange={handleFileChosen}
                  className="hidden"
                />
              </div>
            ) : (
              <p className="mt-1.5 text-sm text-ink-faint">
                You&apos;ll be able to upload the file right after creating this Draft.
              </p>
            )}
            {fileError && <p className="mt-1.5 text-sm text-danger">{fileError}</p>}
          </div>
        )}

        {state.error && <p className="text-sm text-danger">{state.error}</p>}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          {listing ? (
            <Button variant="danger" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Delete
            </Button>
          ) : (
            <span />
          )}
          <Button variant="primary" type="submit" disabled={pending || fileProgress !== null || coverProgress !== null}>
            {pending ? "Saving…" : listing ? "Save changes" : `Create ${COMMUNITY_LISTING_LABELS[type]}`}
          </Button>
        </div>
      </form>

      {cropImageSrc && (
        <ImageCropper
          imageSrc={cropImageSrc}
          title={`${COMMUNITY_LISTING_LABELS[type]} cover`}
          aspect={16 / 9}
          cropShape="rect"
          onCancel={() => setCropImageSrc(null)}
          onConfirm={handleCropConfirm}
        />
      )}

      {listing && (
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Delete {COMMUNITY_LISTING_LABELS[type]}</DialogTitle>
              <DialogDescription>
                {`"${listing.title}" will be removed for good, including from your public Community page. This can't be undone.`}
              </DialogDescription>
            </DialogHeader>
            <form action={deleteCommunityListing}>
              <input type="hidden" name="listingId" value={listing.id} />
              <input type="hidden" name="listingType" value={type} />
              <DialogFooter>
                <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
                  Cancel
                </Button>
                <Button variant="danger" type="submit">
                  Delete
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
