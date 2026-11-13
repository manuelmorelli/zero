"use client";

import { useId, useState } from "react";
import { Music } from "lucide-react";
import type { MusicTrackItem } from "@/lib/actions/music";
import { MUSIC_DEFAULT_VOLUME } from "@/lib/music/constants";
import { MusicLibraryDialog } from "@/components/creator/MusicLibraryDialog";
import { TextButton } from "@/components/ui/button";
import { Notice } from "@/components/ui/panel";
import { Switch } from "@/components/ui/switch";

export type MusicPickerInitial = {
  trackId: string;
  title: string;
  artist: string;
  volume: number;
  fade: boolean;
};

type MusicPickerProps = {
  initial?: MusicPickerInitial | null;
  /** Avviso "meglio la musica di Zero": utile subito dopo un nuovo caricamento, non quando si
   * modifica un episodio già pubblicato. */
  showCopyrightNotice?: boolean;
  /** Per i flussi che non usano un <form> vero (il "+" veloce): avvisa a ogni cambio di scelta. */
  onChange?: (value: { trackId: string | null; volume: number; fade: boolean }) => void;
};

/** Scelta della musica di sottofondo di un episodio dalla Libreria Zero, con volume e dissolvenza.
 * Scrive da sé i campi nascosti musicTrackId, musicVolume e musicFade del form che la contiene. */
export function MusicPicker({ initial = null, showCopyrightNotice = false, onChange }: MusicPickerProps) {
  const uid = useId();
  const [track, setTrack] = useState<{ id: string; title: string; artist: string } | null>(
    initial ? { id: initial.trackId, title: initial.title, artist: initial.artist } : null
  );
  const [volume, setVolume] = useState(initial?.volume ?? MUSIC_DEFAULT_VOLUME);
  const [fade, setFade] = useState(initial?.fade ?? true);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [noticeDismissed, setNoticeDismissed] = useState(false);

  function commit(next: { track: typeof track; volume: number; fade: boolean }) {
    setTrack(next.track);
    setVolume(next.volume);
    setFade(next.fade);
    onChange?.({ trackId: next.track?.id ?? null, volume: next.volume, fade: next.fade });
  }

  function handlePick(picked: MusicTrackItem) {
    commit({ track: { id: picked.id, title: picked.title, artist: picked.artist }, volume, fade });
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name="musicTrackId" value={track?.id ?? ""} />
      <input type="hidden" name="musicVolume" value={volume} />
      <input type="hidden" name="musicFade" value={fade ? "1" : "0"} />

      {showCopyrightNotice && !track && !noticeDismissed && (
        <Notice className="space-y-2">
          <span className="block">
            Does your video use copyrighted music? Use Zero&apos;s free music instead. It is cleared for use, so your
            video can&apos;t be flagged for copyright.
          </span>
          <span className="flex items-center gap-4">
            <TextButton onClick={() => setLibraryOpen(true)}>Browse the Music Library</TextButton>
            <TextButton onClick={() => setNoticeDismissed(true)}>Not now</TextButton>
          </span>
        </Notice>
      )}

      {!track ? (
        <TextButton onClick={() => setLibraryOpen(true)}>
          <Music className="h-4 w-4" aria-hidden="true" />
          Add music from the Zero Library
        </TextButton>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Music className="h-4 w-4 shrink-0 text-ember" aria-hidden="true" />
            <p className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">
              {track.title} <span className="font-normal text-ink-faint">· {track.artist}</span>
            </p>
            <TextButton onClick={() => setLibraryOpen(true)}>Change</TextButton>
            <TextButton onClick={() => commit({ track: null, volume, fade })}>Remove</TextButton>
          </div>

          <div>
            <label htmlFor={`${uid}-volume`} className="text-sm font-medium text-ink-muted">
              Music volume: {volume}%
            </label>
            <input
              id={`${uid}-volume`}
              type="range"
              min={0}
              max={100}
              step={5}
              value={volume}
              onChange={(event) => commit({ track, volume: Number(event.target.value), fade })}
              className="mt-1.5 w-full"
            />
          </div>

          <Switch label="Fade in and out" description="Music starts and ends gently." checked={fade} onChange={(next) => commit({ track, volume, fade: next })} />
        </div>
      )}

      <MusicLibraryDialog open={libraryOpen} onOpenChange={setLibraryOpen} onPick={handlePick} />
    </div>
  );
}
