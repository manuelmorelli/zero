"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, PenLine, Play, Video as VideoIcon } from "lucide-react";
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
import { CardTitle } from "@/components/ui/heading";
import { CoverTitle } from "@/components/ui/cover-card";
import { PANEL_ACCENT } from "@/components/ui/panel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type PresentationVideoCardProps = {
  /** Id della persona del profilo: serve al link verso la pagina dedicata Bio & presentation
   * (su mobile la card porta lì invece di riprodurre sul posto, vedi handlePosterClick). */
  profileUserId: string;
  /** Link temporaneo già risolto (chiave R2 -> URL), o null se non è mai stato caricato nulla. */
  videoUrl: string | null;
  /** Copertina mostrata come fotogramma iniziale prima del play, indipendente dal video (può
   * mancare anche a video già caricato). Null = nessuna, il video resta nero finché non parte. */
  coverUrl: string | null;
  isOwnProfile: boolean;
  /** Bio incorporata nella stessa card (richiesto da Manuel, 2026-09-22): unica card invece di
   * due separate, stesso contenuto/stile prima mostrato da AboutCard. AboutCard resta usata da
   * sola quando questa card non compare affatto (visitatore su un profilo senza ancora un video
   * di presentazione, vedi app/(site)/profile/[username]/page.tsx). */
  name: string;
  bio: string | null;
  interests?: string[];
};

/**
 * Card unica Bio + Video di presentazione. Il video attiva il Trust Score alla prima
 * valorizzazione (vedi lib/profile/trustScore.ts, "hasPresentation"). Un visitatore che non ha
 * ancora caricato nulla non vede la card (niente riquadri vuoti su un profilo altrui): in quel
 * caso resta solo AboutCard, vedi sopra. Il proprietario la vede sempre, anche con video vuoto,
 * per poter caricarlo.
 */
export function PresentationVideoCard({ profileUserId, videoUrl, coverUrl, isOwnProfile, name, bio, interests }: PresentationVideoCardProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const [coverProgress, setCoverProgress] = useState<number | null>(null);
  // File scelto per la copertina, in attesa del riquadro "sposta e zooma" prima dell'upload:
  // stesso pattern di EditProfileButton.tsx per avatar/cover.
  const [coverCropSrc, setCoverCropSrc] = useState<string | null>(null);

  function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play();
    else video.pause();
  }

  // Su mobile la card è un poster compatto (niente bio, niente controlli propri): toccarla porta
  // alla pagina dedicata Bio & presentation invece di riprodurre il video sul posto. Da desktop
  // in su resta il comportamento di sempre (play/pausa qui stesso).
  function handlePosterClick() {
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches) {
      router.push(`/profile/${profileUserId}/presentation`);
      return;
    }
    togglePlay();
  }

  async function handleFileChosen(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!ALLOWED_VIDEO_TYPES.has(file.type)) {
      toast.error("Unsupported video format.");
      return;
    }

    setProgress(0);
    try {
      const result = await createPresentationVideoUploadUrl(file.type);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      await uploadFileWithProgress(result.uploadUrl, file, setProgress);
      const saveResult = await updatePresentationVideo(result.key);
      if (saveResult.error) {
        toast.error(saveResult.error);
      } else {
        toast.success("Introduction video updated");
        router.refresh();
      }
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setProgress(null);
    }
  }

  function handleCoverFileChosen(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      toast.error("Unsupported image format (use JPG, PNG or WebP).");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error("Image is too large.");
      return;
    }
    setCoverCropSrc(URL.createObjectURL(file));
  }

  async function handleCoverCropConfirm(blob: Blob) {
    setCoverCropSrc(null);
    setCoverProgress(0);
    try {
      const result = await createPresentationCoverUploadUrl(blob.type);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      await uploadFileWithProgress(result.uploadUrl, blob, setCoverProgress);
      const saveResult = await updatePresentationCover(result.key);
      if (saveResult.error) {
        toast.error(saveResult.error);
      } else {
        toast.success("Cover updated");
        router.refresh();
      }
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setCoverProgress(null);
    }
  }

  if (!videoUrl && !isOwnProfile) return null;

  // Da tablet in su, Bio e Video sono due card separate, larghe come la copertina "In Progress"
  // (FeaturedJourneySection) — stessa formula di CARD_ROW_ITEM.episode, vedi
  // app/(site)/profile/[username]/page.tsx. Su mobile la Bio non compare qui (si legge dalla
  // pagina dedicata Bio & presentation): resta solo il poster del video, come prima.
  const cardWidth = "md:w-[calc((100%-2rem)/3)] md:shrink-0 lg:w-[calc((100%-4rem)/5)]";

  return (
    <>
      <div
        onClick={handlePosterClick}
        className={cn("relative aspect-[112/156] w-full cursor-pointer overflow-hidden rounded-xl border max-md:min-w-0 max-md:flex-1 max-md:border-ember-line md:left-[256px]", cardWidth, videoUrl ? "border-border bg-surface-2" : "border-ember-line cover-placeholder")}
      >
        {videoUrl ? (
          <>
            <video
              ref={videoRef}
              src={videoUrl}
              poster={coverUrl ?? undefined}
              playsInline
              className="h-full w-full object-cover"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            <div className="absolute inset-0 card-scrim pointer-events-none" />

            {!isPlaying && (
              <span className="pointer-events-none absolute inset-0 grid place-items-center text-on-photo">
                <Play className="h-10 w-10" fill="currentColor" aria-hidden="true" />
              </span>
            )}

            <div className="absolute inset-x-0 bottom-0 p-3 pointer-events-none">
              <CoverTitle className="truncate">That&apos;s me</CoverTitle>
            </div>
          </>
        ) : (
          <div className="absolute inset-x-0 bottom-0 p-2.5">
            <p className="text-sm text-on-photo-muted">
              {isOwnProfile ? "Add a short video so people know who you are." : `${name} hasn't added an introduction video yet.`}
            </p>
          </div>
        )}

        {isOwnProfile && (
          <div className="absolute right-2 top-2 max-md:hidden" onClick={(event) => event.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label="Edit introduction video"
                className="grid h-9 w-9 place-items-center rounded-full border border-border bg-scrim text-ember backdrop-blur-md transition-colors hover:bg-scrim"
              >
                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onSelect={() => inputRef.current?.click()} disabled={progress !== null}>
                  <VideoIcon className="h-4 w-4" aria-hidden="true" />
                  {progress !== null ? `Uploading… ${progress}%` : videoUrl ? "Change video" : "Upload video"}
                </DropdownMenuItem>
                {videoUrl && (
                  <DropdownMenuItem onSelect={() => coverInputRef.current?.click()} disabled={coverProgress !== null}>
                    <PenLine className="h-4 w-4" aria-hidden="true" />
                    {coverProgress !== null ? `Uploading… ${coverProgress}%` : "Change cover"}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <input ref={inputRef} type="file" accept="video/*" onChange={handleFileChosen} className="hidden" />
            <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverFileChosen} className="hidden" />
          </div>
        )}
      </div>

      <div
        className={cn(
          PANEL_ACCENT,
          "bio-card relative hidden md:flex md:aspect-[224/152] md:flex-col md:overflow-y-auto md:w-[calc((100%-2rem)/3*2)] md:shrink-0 md:left-[256px] lg:w-[calc((100%-4rem)/5*2)]"
        )}
      >
        <CardTitle as="h2" className="inline-flex items-center gap-1.5 text-ember">
          <PenLine className="h-3.5 w-3.5" aria-hidden="true" />
          Bio
        </CardTitle>
        {bio ? (
          <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-ink">{bio}</p>
        ) : (
          <p className="mt-3 text-sm text-ink-faint">{name} hasn&apos;t written a bio yet.</p>
        )}
        {interests && interests.length > 0 && (
          <div className="mt-4">
            <p className="text-sm uppercase tracking-wider text-ink-faint">Focus</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {interests.map((interest) => (
                <span
                  key={interest}
                  className="rounded-full border border-border px-2.5 py-1 text-sm text-ink-muted"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

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
    </>
  );
}
