import { Video } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { SectionHeading } from "@/components/common/SectionHeading";
import { VideoCard } from "@/components/journey/VideoCard";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getLatestVideos } from "@/lib/discovery/latestVideos";
import { DEMO_LATEST_VIDEOS } from "@/lib/demo/demoContent";

export const metadata = { title: "Latest Videos — Zero" };

export default async function LatestVideosPage() {
  const session = await getCurrentSession();
  const userId = session?.user.id ?? null;
  const interests = userId
    ? (await prisma.user.findUnique({ where: { id: userId }, select: { interests: true } }))?.interests ?? []
    : [];

  const videos = await getLatestVideos({ limit: 60, interests });
  const displayed = videos.length > 0 ? videos : DEMO_LATEST_VIDEOS;

  return (
    <main>
      <Header />
      <div className="mx-auto max-w-[1400px] px-5 pb-16 pt-24 md:px-8">
        <SectionHeading
          icon={<Video className="h-6 w-6" aria-hidden="true" />}
          title="Latest Videos"
          subtitle="New episodes just published across Zero."
        />

        <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {displayed.map((video) => (
            <li key={video.episodeId}>
              <VideoCard video={video} />
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
