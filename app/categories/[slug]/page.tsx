import { notFound, redirect } from "next/navigation";
import { categoryFromSlug } from "@/lib/constants/categories";

// Sostituita dall'ancora di categoria dentro /journeys. Redirect mantenuto per eventuali link
// vecchi salvati o condivisi (vedi app/categories/page.tsx).
export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!categoryFromSlug(slug)) notFound();

  redirect(`/journeys#${slug}`);
}
