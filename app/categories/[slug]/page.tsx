import { notFound } from "next/navigation";
import { categoryFromSlug } from "@/lib/constants/categories";
import { getJourneysInCategory } from "@/lib/discovery/journeysByCategory";
import { promoteExpiredDiscoveryJourneys } from "@/lib/constants/journeyStatus";
import { PAGE_SPACING, PAGE_WIDTH } from "@/components/ui/page-container";
import { PageTitle } from "@/components/ui/heading";
import { NOTICE } from "@/components/ui/panel";
import { CARD_GRID } from "@/components/ui/cover-card";
import { JourneyCard } from "@/components/journey/JourneyCard";
import { Reveal } from "@/components/common/Reveal";

// Pagina dedicata di una categoria, raggiunta cliccando il titolo di una riga su /journeys:
// tutti i Journey della categoria, senza il limite di 12 della riga scorrevole.
export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = categoryFromSlug(slug);
  if (!category) notFound();

  await promoteExpiredDiscoveryJourneys();
  const journeys = await getJourneysInCategory(category);

  return (
    <main>
      <div className={`${PAGE_WIDTH.wide} ${PAGE_SPACING}`}>
        <PageTitle>{category}</PageTitle>
        <p className="mt-2 text-sm text-ink-muted">
          {journeys.length} {journeys.length === 1 ? "Journey" : "Journeys"} in this category.
        </p>

        <div className="mt-8">
          {journeys.length === 0 ? (
            <p className={NOTICE}>No Journeys in this category yet.</p>
          ) : (
            <ul className={CARD_GRID.journey}>
              {journeys.map((journey, index) => (
                <Reveal key={journey.id} as="li" delayMs={Math.min(index, 10) * 70}>
                  <JourneyCard journey={journey} />
                </Reveal>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
