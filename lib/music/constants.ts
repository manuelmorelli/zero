/** Volume iniziale del brano rispetto al video (0-100): la voce resta in primo piano. */
export const MUSIC_DEFAULT_VOLUME = 30;
/** Durata della dissolvenza in entrata e in uscita, in secondi. */
export const MUSIC_FADE_IN_SEC = 2;
export const MUSIC_FADE_OUT_SEC = 3;

/** Campi musicali di un episodio così come arrivano dal database alle schermate di modifica. */
export type EpisodeMusicInfo = {
  musicTrackId?: string | null;
  musicVolume?: number;
  musicFade?: boolean;
  musicTrack?: { title: string; artist: string } | null;
};
