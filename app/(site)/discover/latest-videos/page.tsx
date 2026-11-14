import { Video } from "lucide-react";
import { SectionHeading } from "@/components/common/SectionHeading";
import { VideoCard } from "@/components/journey/VideoCard";
import { getViewerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getLatestVideos } from "@/lib/discovery/latestVideos";
import { DEMO_LATEST_VIDEOS } from "@/lib/demo/demoContent";
import { PAGE_SPACING, PAGE_WIDTH } from "@/components/ui/page-container";
import { CARD_GRID } from "@/components/ui/cover-card";
import { LoadMoreLink } from "@/components/common/LoadMoreLink";
import { parseShown, splitPage } from "@/lib/discovery/pagination";

export const metadata = { title: "Latest Videos | Zero" };

export default async function LatestVideosPage({ searchParams }: { searchParams: Promise<{ shown?: string }> }) {
  const shown = parseShown((await searchParams).shown);
  const session = await getViewerSession();
  const userId = session?.user.id ?? null;
  const interests = userId
    ? (await prisma.user.findUnique({ where: { id: userId }, select: { interests: true } }))?.interests ?? []
    : [];

  const videos = await getLatestVideos({ limit: shown + 1, interests });
  const { visible: displayed, hasMore } = splitPage(videos.length > 0 ? videos : DEMO_LATEST_VIDEOS, shown);

  return (
    <main>
      <div className={`${PAGE_WIDTH.wide} ${PAGE_SPACING}`}>
        <SectionHeading
          page
          icon={<Video className="h-6 w-6" aria-hidden="true" />}
          title="Latest Videos"
          subtitle="New episodes just published across Zero."
        />

        <ul className={`mt-6 ${CARD_GRID.episode}`}>
          {displayed.map((video) => (
            <li key={video.episodeId}>
              <VideoCard video={video} />
            </li>
          ))}
        </ul>
        <LoadMoreLink href="/discover/latest-videos" shown={shown} hasMore={hasMore} />
      </div>
    </main>
  );
}
