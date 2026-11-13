"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { listMusicTracks, type MusicTrackItem } from "@/lib/actions/music";
import { formatDuration } from "@/lib/format/duration";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CHIP_EMBER, CHIP_EMBER_SELECTED, ROW } from "@/components/ui/panel";

type MusicLibraryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPick: (track: MusicTrackItem) => void;
};

/** La Libreria musicale di Zero: elenco dei brani con ascolto e filtro per mood. Stessa finestra
 * su telefono e computer. */
export function MusicLibraryDialog({ open, onOpenChange, onPick }: MusicLibraryDialogProps) {
  const [tracks, setTracks] = useState<MusicTrackItem[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [mood, setMood] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function stopPreview() {
    audioRef.current?.pause();
    audioRef.current = null;
    setPlayingId(null);
  }

  useEffect(() => {
    if (!open || tracks) return;
    listMusicTracks()
      .then(setTracks)
      .catch(() => setLoadError(true));
  }, [open, tracks]);

  useEffect(() => stopPreview, []);

  function togglePreview(id: string) {
    if (playingId === id) {
      stopPreview();
      return;
    }
    stopPreview();
    const audio = new Audio(`/api/music/${id}`);
    audio.onended = () => setPlayingId(null);
    audioRef.current = audio;
    setPlayingId(id);
    audio.play().catch(() => setPlayingId(null));
  }

  function handleOpenChange(next: boolean) {
    if (!next) stopPreview();
    onOpenChange(next);
  }

  const moods = tracks ? Array.from(new Set(tracks.map((track) => track.mood))) : [];
  const visible = tracks ? tracks.filter((track) => mood === null || track.mood === mood) : [];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent plainClose className="max-h-[85vh] max-w-lg grid-rows-[auto_1fr]">
        <DialogHeader className="px-5 py-4 pr-12">
          <DialogTitle className="text-sm font-semibold uppercase tracking-wider text-ink-faint">Zero Music Library</DialogTitle>
          <DialogDescription className="text-sm">Free to use in your episodes. No copyright claims.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 overflow-y-auto p-5">
          {moods.length > 1 && (
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setMood(null)} className={mood === null ? CHIP_EMBER_SELECTED : CHIP_EMBER}>
                All
              </button>
              {moods.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMood(item)}
                  className={mood === item ? CHIP_EMBER_SELECTED : CHIP_EMBER}
                >
                  {item}
                </button>
              ))}
            </div>
          )}

          {loadError && <p className="text-sm text-danger">Could not load the library. Please try again.</p>}
          {!tracks && !loadError && <p className="text-sm text-ink-muted">Loading…</p>}
          {tracks && tracks.length === 0 && <p className="text-sm text-ink-muted">The library is empty for now.</p>}

          <ul className="space-y-2">
            {visible.map((track) => (
              <li key={track.id} className={`${ROW} flex items-center gap-3`}>
                <Button
                  variant="icon"
                  aria-label={playingId === track.id ? `Pause ${track.title}` : `Play ${track.title}`}
                  onClick={() => togglePreview(track.id)}
                >
                  {playingId === track.id ? (
                    <Pause className="h-4 w-4 text-ember" aria-hidden="true" />
                  ) : (
                    <Play className="h-4 w-4 fill-current text-ember" aria-hidden="true" />
                  )}
                </Button>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{track.title}</p>
                  <p className="truncate text-sm text-ink-faint">
                    {track.artist} · {track.mood} · {formatDuration(track.durationSec)}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  className="shrink-0 px-4 py-1.5"
                  onClick={() => {
                    stopPreview();
                    onPick(track);
                    onOpenChange(false);
                  }}
                >
                  Use
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
