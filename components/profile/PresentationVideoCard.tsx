"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Video as VideoIcon } from "lucide-react";
import { toast } from "sonner";
import { createPresentationVideoUploadUrl, updatePresentationVideo } from "@/lib/actions/creatorPresentation";
import { uploadFileWithProgress } from "@/lib/upload";
import { ALLOWED_VIDEO_TYPES } from "@/lib/constants/video";

type PresentationVideoCardProps = {
  /** Link temporaneo già risolto (chiave R2 -> URL), o null se non è mai stato caricato nulla. */
  videoUrl: string | null;
  isOwnProfile: boolean;
};

/**
 * Video di presentazione del creator: attiva il Trust Score alla prima valorizzazione (vedi
 * lib/profile/trustScore.ts, "hasPresentation"). Stesso stile visivo della card Bio
 * (components/profile/AboutCard.tsx) per coerenza — il titolo "Who I am" è il "tab" richiesto da
 * Manuel per far capire subito che si tratta di una presentazione, non di un episodio qualsiasi.
 * Un visitatore che non ha ancora caricato nulla non vede la card (niente riquadri vuoti su un
 * profilo altrui); il proprietario la vede sempre, anche vuota, per poter caricare il video.
 */
export function PresentationVideoCard({ videoUrl, isOwnProfile }: PresentationVideoCardProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChosen(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError(null);
    if (!ALLOWED_VIDEO_TYPES.has(file.type)) {
      setError("Unsupported video format.");
      return;
    }

    setProgress(0);
    try {
      const result = await createPresentationVideoUploadUrl(file.type);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      await uploadFileWithProgress(result.uploadUrl, file, setProgress);
      const saveResult = await updatePresentationVideo(result.key);
      if (saveResult.error) {
        setError(saveResult.error);
      } else {
        toast.success("Introduction video updated");
        router.refresh();
      }
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setProgress(null);
    }
  }

  if (!videoUrl && !isOwnProfile) return null;

  return (
    <div className="rounded-2xl border border-ember/20 bg-gradient-to-b from-ember/8 to-white/[0.02] p-4">
      <h2 className="inline-flex items-center gap-1.5 text-base font-semibold text-ember">
        <VideoIcon className="h-3.5 w-3.5" aria-hidden="true" />
        Who I am
      </h2>

      {videoUrl ? (
        <div className="relative mt-3 overflow-hidden rounded-xl border border-border bg-surface-2">
          <video src={videoUrl} controls className="aspect-9/16 w-full object-cover" />
        </div>
      ) : (
        <p className="mt-3 text-sm text-ink-faint">
          {isOwnProfile ? "Add a short video so people know who you are." : "No introduction video yet."}
        </p>
      )}

      {isOwnProfile && (
        <>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={progress !== null}
            className="mt-3 w-full rounded-full border border-ember/20 bg-gradient-to-b from-ember/8 to-white/[0.02] px-4 py-2 text-sm font-semibold text-ember backdrop-blur-md transition-colors hover:from-ember/15 disabled:opacity-50"
          >
            {progress !== null ? `Uploading… ${progress}%` : videoUrl ? "Change video" : "Upload video"}
          </button>
          <input ref={inputRef} type="file" accept="video/*" onChange={handleFileChosen} className="hidden" />
          {error && <p className="mt-2 text-xs text-danger">{error}</p>}
        </>
      )}
    </div>
  );
}
