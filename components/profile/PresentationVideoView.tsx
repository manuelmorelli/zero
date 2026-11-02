"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Pause, Play, Video as VideoIcon, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import {
  createPresentationCoverUploadUrl,
  createPresentationVideoUploadUrl,
  updatePresentationCover,
  updatePresentationVideo,
} from "@/lib/actions/creatorPresentation";
import { uploadFileWithProgress } from "@/lib/upload";
import { ALLOWED_VIDEO_TYPES } from "@/lib/constants/video";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from "@/lib/constants/image";
import { ImageCropper } from "@/components/common/ImageCropper";
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/heading";

type PresentationVideoViewProps = {
  videoUrl: string | null;
  coverUrl: string | null;
  isOwnProfile: boolean;
};

function formatMB(bytes: number): string {
  return `${Math.round(bytes / (1024 * 1024))}MB`;
}

/** Video di presentazione nella pagina dedicata "Bio & presentation": sola visualizzazione per un
 * visitatore, ma per il proprietario è anche l'unico posto da cui caricarlo/cambiarlo (prima
 * viveva solo nella card compatta del profilo, tolto da lì su mobile insieme alla bio). */
export function PresentationVideoView({ videoUrl, coverUrl, isOwnProfile }: PresentationVideoViewProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const [coverProgress, setCoverProgress] = useState<number | null>(null);
  const [coverError, setCoverError] = useState<string | null>(null);
  const [coverCropSrc, setCoverCropSrc] = useState<string | null>(null);

  function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play();
    else video.pause();
  }

  function toggleMute() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }

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

  function handleCoverFileChosen(event: ChangeEvent<HTMLInputElement>) {
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
    setCoverCropSrc(URL.createObjectURL(file));
  }

  async function handleCoverCropConfirm(blob: Blob) {
    setCoverCropSrc(null);
    setCoverError(null);
    setCoverProgress(0);
    try {
      const result = await createPresentationCoverUploadUrl(blob.type);
      if ("error" in result) {
        setCoverError(result.error);
        return;
      }
      await uploadFileWithProgress(result.uploadUrl, blob, setCoverProgress);
      const saveResult = await updatePresentationCover(result.key);
      if (saveResult.error) {
        setCoverError(saveResult.error);
      } else {
        toast.success("Cover updated");
        router.refresh();
      }
    } catch {
      setCoverError("Upload failed. Please try again.");
    } finally {
      setCoverProgress(null);
    }
  }

  return (
    <div>
      {videoUrl ? (
        <div
          className="group relative aspect-4/3 w-full cursor-pointer overflow-hidden rounded-xl border border-border bg-surface-2"
          onClick={togglePlay}
        >
          <video
            ref={videoRef}
            src={videoUrl}
            poster={coverUrl ?? undefined}
            playsInline
            className="h-full w-full object-cover"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
          {!isPlaying && (
            <span className="pointer-events-none absolute inset-0 grid place-items-center text-on-photo">
              <Play className="h-10 w-10" fill="currentColor" aria-hidden="true" />
            </span>
          )}
        </div>
      ) : (
        <CardTitle as="h2" className="inline-flex items-center gap-1.5 text-ember">
          <VideoIcon className="h-3.5 w-3.5" aria-hidden="true" />
          That&apos;s me
        </CardTitle>
      )}

      {videoUrl ? (
        <div className="mt-2 flex items-center gap-1.5">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="grid h-8 w-8 place-items-center rounded-full border border-border text-ink-muted transition-colors hover:border-ember-line hover:text-ember"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" fill="currentColor" aria-hidden="true" />
            ) : (
              <Play className="h-4 w-4" fill="currentColor" aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute" : "Mute"}
            className="grid h-8 w-8 place-items-center rounded-full border border-border text-ink-muted transition-colors hover:border-ember-line hover:text-ember"
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Volume2 className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      ) : (
        <p className="mt-3 text-sm text-ink-faint">
          {isOwnProfile ? "Add a short video so people know who you are." : "No introduction video yet."}
        </p>
      )}

      {isOwnProfile && (
        <>
          <div className="mt-3 flex gap-2">
            <Button variant="secondary" onClick={() => inputRef.current?.click()} disabled={progress !== null} className="flex-1">
              {progress !== null ? `Uploading… ${progress}%` : videoUrl ? "Change video" : "Upload video"}
            </Button>
            {videoUrl && (
              <Button variant="secondary" onClick={() => coverInputRef.current?.click()} disabled={coverProgress !== null} className="flex-1">
                {coverProgress !== null ? `Uploading… ${coverProgress}%` : "Change cover"}
              </Button>
            )}
          </div>
          <input ref={inputRef} type="file" accept="video/*" onChange={handleFileChosen} className="hidden" />
          <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverFileChosen} className="hidden" />
          {error && <p className="mt-2 text-sm text-danger">{error}</p>}
          {coverError && <p className="mt-2 text-sm text-danger">{coverError}</p>}
        </>
      )}

      {coverCropSrc && (
        <ImageCropper
          imageSrc={coverCropSrc}
          title="Adjust your cover photo"
          aspect={4 / 3}
          cropShape="rect"
          onCancel={() => setCoverCropSrc(null)}
          onConfirm={handleCoverCropConfirm}
        />
      )}
    </div>
  );
}
