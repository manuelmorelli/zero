"use client";

import Image from "next/image";
import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateAccount } from "@/lib/actions/account";
import { createProfileImageUploadUrl } from "@/lib/actions/profileMedia";
import { uploadFileWithProgress } from "@/lib/upload";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from "@/lib/constants/image";
import { JOURNEY_CATEGORIES, type JourneyCategory } from "@/lib/constants/categories";
import { ImageCropper } from "@/components/common/ImageCropper";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const BIO_MAX_LENGTH = 250;

type EditProfileButtonProps = {
  user: {
    name: string;
    username: string | null;
    bio: string | null;
    location: string | null;
    interests: string[];
  };
  /** Link temporanei già risolti (chiave R2 -> URL): vedi app/profile/[username]/page.tsx. */
  avatarUrl: string | null;
  coverUrl: string | null;
};

export function EditProfileButton({ user, avatarUrl, coverUrl }: EditProfileButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-bg transition-colors hover:bg-ink-muted"
      >
        Edit profile
      </button>

      {open && (
        <EditProfileModal
          user={user}
          avatarUrl={avatarUrl}
          coverUrl={coverUrl}
          onClose={() => setOpen(false)}
        />
      )}
    </Dialog>
  );
}

function formatMB(bytes: number): string {
  return `${Math.round(bytes / (1024 * 1024))}MB`;
}

function EditProfileModal({
  user,
  avatarUrl,
  coverUrl,
  onClose,
}: EditProfileButtonProps & { onClose: () => void }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(updateAccount, { error: null });

  const [avatarKey, setAvatarKey] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(avatarUrl);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarProgress, setAvatarProgress] = useState<number | null>(null);

  const [coverKey, setCoverKey] = useState("");
  const [coverPreview, setCoverPreview] = useState(coverUrl);
  const [coverError, setCoverError] = useState<string | null>(null);
  const [coverProgress, setCoverProgress] = useState<number | null>(null);

  const [selected, setSelected] = useState<JourneyCategory[]>(user.interests as JourneyCategory[]);

  const [bioValue, setBioValue] = useState(user.bio ?? "");
  const bioLength = bioValue.trim().length;

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const closedOnSuccess = useRef(false);

  // File appena scelto, in attesa di essere sistemato nel riquadro "sposta e zooma"
  // prima ancora di essere caricato: nessun upload finché non si conferma il ritaglio.
  const [cropTarget, setCropTarget] = useState<{ kind: "avatar" | "cover"; imageSrc: string } | null>(
    null
  );

  function toggle(category: JourneyCategory) {
    setSelected((current) =>
      current.includes(category) ? current.filter((item) => item !== category) : [...current, category]
    );
  }

  function handleFileChosen(kind: "avatar" | "cover", event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const setError = kind === "avatar" ? setAvatarError : setCoverError;
    setError(null);

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      setError("Unsupported image format (use JPG, PNG or WebP).");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setError(`Image is too large (max ${formatMB(MAX_IMAGE_SIZE_BYTES)}).`);
      return;
    }

    setCropTarget({ kind, imageSrc: URL.createObjectURL(file) });
  }

  async function handleCropConfirm(blob: Blob) {
    if (!cropTarget) return;
    const { kind } = cropTarget;
    setCropTarget(null);

    const setError = kind === "avatar" ? setAvatarError : setCoverError;
    const setProgress = kind === "avatar" ? setAvatarProgress : setCoverProgress;
    const setKey = kind === "avatar" ? setAvatarKey : setCoverKey;
    const setPreview = kind === "avatar" ? setAvatarPreview : setCoverPreview;

    setError(null);
    setProgress(0);
    try {
      const result = await createProfileImageUploadUrl(kind, blob.type);
      if ("error" in result) {
        setError(result.error);
        setProgress(null);
        return;
      }
      await uploadFileWithProgress(result.uploadUrl, blob, setProgress);
      setKey(result.key);
      setPreview(URL.createObjectURL(blob));
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setProgress(null);
    }
  }

  // useActionState non espone un modo diretto per "on success": lo stato resta {error: null}
  // sia prima dell'invio sia dopo un salvataggio riuscito, quindi il segnale di successo è
  // "non più pending, nessun errore, e l'utente ha effettivamente inviato il form".
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => {
    if (submitted && !pending && !state.error && !closedOnSuccess.current) {
      closedOnSuccess.current = true;
      toast.success("Profile updated");
      router.refresh();
      onClose();
    }
  }, [submitted, pending, state.error, router, onClose]);

  return (
    <DialogContent className="max-w-lg p-0">
      <DialogHeader className="sr-only">
        <DialogTitle>Edit profile</DialogTitle>
      </DialogHeader>

      <div className="flex max-h-[85vh] flex-col overflow-hidden">
        <form
          action={(formData) => {
            formData.set("avatarKey", avatarKey);
            formData.set("coverKey", coverKey);
            setSubmitted(true);
            formAction(formData);
          }}
          className="flex-1 overflow-y-auto"
        >
          <div className="relative">
            <div className="relative aspect-[3/1] w-full overflow-hidden bg-surface-2">
              {coverPreview ? (
                <Image src={coverPreview} alt="" fill sizes="512px" className="object-cover" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-surface-2 via-surface-2 to-black" />
              )}
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                aria-label="Change cover photo"
                className="absolute inset-0 flex items-center justify-center bg-black/0 text-sm font-semibold text-transparent transition-colors hover:bg-black/50 hover:text-white"
              >
                {coverProgress !== null ? `Uploading… ${coverProgress}%` : "Change cover photo"}
              </button>
              <span className="pointer-events-none absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white">
                <CameraIcon className="h-4 w-4" />
              </span>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={(event) => handleFileChosen("cover", event)}
                className="hidden"
              />
            </div>

            <div className="group absolute -bottom-10 left-5 h-20 w-20 overflow-hidden rounded-full border-4 border-surface bg-surface-2">
              {avatarPreview ? (
                <Image src={avatarPreview} alt="" fill sizes="80px" className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-lg font-bold text-ink-muted">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                aria-label="Change profile photo"
                className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition-all group-hover:bg-black/50 group-hover:opacity-100"
              >
                <CameraIcon className="h-4 w-4" />
                {avatarProgress !== null && <span className="ml-1 text-[10px] font-semibold">{avatarProgress}%</span>}
              </button>
              <span className="pointer-events-none absolute bottom-0.5 right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white">
                <CameraIcon className="h-3 w-3" />
              </span>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={(event) => handleFileChosen("avatar", event)}
                className="hidden"
              />
            </div>
          </div>

          <div className="space-y-5 px-5 pb-5 pt-14">
            {(avatarError || coverError) && (
              <p className="text-sm text-danger">{avatarError ?? coverError}</p>
            )}
            {(avatarProgress !== null || coverProgress !== null) && (
              <p className="text-sm text-ink-muted">Uploading photo…</p>
            )}

            <div>
              <label htmlFor="name" className="text-sm font-medium text-ink-muted">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                minLength={2}
                maxLength={100}
                defaultValue={user.name}
                className="mt-1.5 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
              />
            </div>

            <div>
              <label htmlFor="username" className="text-sm font-medium text-ink-muted">
                Username <span className="text-ink-faint">(optional)</span>
              </label>
              <input
                id="username"
                name="username"
                type="text"
                maxLength={30}
                placeholder="e.g. jane-doe"
                defaultValue={user.username ?? ""}
                className="mt-1.5 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
              />
            </div>

            <div>
              <label htmlFor="location" className="text-sm font-medium text-ink-muted">
                Location <span className="text-ink-faint">(optional)</span>
              </label>
              <input
                id="location"
                name="location"
                type="text"
                maxLength={100}
                placeholder="e.g. Lisbon, Portugal"
                defaultValue={user.location ?? ""}
                className="mt-1.5 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
              />
            </div>

            <div>
              <div className="flex items-baseline justify-between">
                <label htmlFor="bio" className="text-sm font-medium text-ink-muted">
                  Bio
                </label>
                <span className="text-xs text-ink-muted">
                  {bioLength}/{BIO_MAX_LENGTH}
                </span>
              </div>
              <textarea
                id="bio"
                name="bio"
                rows={5}
                maxLength={BIO_MAX_LENGTH}
                placeholder="Tell your story: who you are, what you're working on, why it matters."
                value={bioValue}
                onChange={(event) => setBioValue(event.target.value)}
                className="mt-1.5 w-full resize-none rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
              />
            </div>

            <div>
              <p className="text-sm font-medium text-ink-muted">Interests</p>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {JOURNEY_CATEGORIES.map((category) => {
                  const active = selected.includes(category);
                  return (
                    <label key={category}>
                      <input
                        type="checkbox"
                        name="interests"
                        value={category}
                        checked={active}
                        onChange={() => toggle(category)}
                        className="sr-only"
                      />
                      <span
                        className={`inline-block cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                          active
                            ? "border-ink bg-ink text-bg"
                            : "border-border bg-surface-2 text-ink hover:border-ink-muted"
                        }`}
                      >
                        {category}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {state.error && <p className="text-sm text-danger">{state.error}</p>}

            <button
              type="submit"
              disabled={
                pending ||
                selected.length === 0 ||
                avatarProgress !== null ||
                coverProgress !== null
              }
              className="w-full rounded-full bg-ink px-6 py-3 text-sm font-semibold text-bg transition-colors hover:bg-ink-muted disabled:opacity-50"
            >
              {pending ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>

      {cropTarget && (
        <ImageCropper
          imageSrc={cropTarget.imageSrc}
          title={cropTarget.kind === "avatar" ? "Adjust your profile photo" : "Adjust your cover photo"}
          aspect={cropTarget.kind === "avatar" ? 1 : 3}
          cropShape={cropTarget.kind === "avatar" ? "round" : "rect"}
          onCancel={() => setCropTarget(null)}
          onConfirm={handleCropConfirm}
        />
      )}
    </DialogContent>
  );
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} className={className} aria-hidden="true">
      <path d="M3 7h2.5L7 5h6l1.5 2H17a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z" />
      <circle cx="10" cy="11" r="2.6" />
    </svg>
  );
}
