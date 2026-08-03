import { EpisodeVideoPlayer } from "@/components/journey/EpisodeVideoPlayer";

type EpisodeCardProps = {
  episode: {
    id: string;
    title: string;
    caption: string | null;
    videoKey: string | null;
    occurredAt: Date;
  };
  videoSrc?: string;
};

export function EpisodeCard({ episode, videoSrc }: EpisodeCardProps) {
  return (
    <div id={episode.id} className="rounded-xl border border-border bg-surface p-5 scroll-mt-16">
      <p className="text-xs text-ink-faint">
        {episode.occurredAt.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
      </p>
      <h3 className="mt-1 text-sm font-semibold text-ink">{episode.title}</h3>
      {episode.caption && <p className="mt-3 whitespace-pre-wrap text-sm text-ink">{episode.caption}</p>}
      {episode.videoKey && videoSrc && <EpisodeVideoPlayer episodeId={episode.id} src={videoSrc} />}
    </div>
  );
}
