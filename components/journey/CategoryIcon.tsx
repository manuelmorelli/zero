import {
  Baby,
  BookOpen,
  Brain,
  Briefcase,
  Camera,
  Compass,
  Dumbbell,
  Film,
  Footprints,
  Globe,
  Guitar,
  Hammer,
  HandHeart,
  HeartHandshake,
  Leaf,
  MoreHorizontal,
  Mountain,
  Pencil,
  Smartphone,
  Sparkles,
  Sprout,
  UtensilsCrossed,
  Users,
  Wallet,
  Waves,
  type LucideIcon,
} from "lucide-react";
import type { JourneyCategory } from "@/lib/constants/categories";

// Un'icona per ciascuna delle 25 categorie ufficiali (lib/constants/categories.ts).
// Stessa libreria e stesso stile del design di riferimento: dove il riferimento
// aveva già un'icona per una categoria equivalente, è stata riusata identica
// (es. Fitness -> Dumbbell); per le categorie non coperte dal riferimento è stata
// scelta la più vicina per significato dallo stesso set di icone.
const CATEGORY_ICONS: Record<JourneyCategory, LucideIcon> = {
  Fitness: Dumbbell,
  Nutrition: UtensilsCrossed,
  "Mental Health": Brain,
  "Recovery & Sobriety": HeartHandshake,
  "Health & Illness Recovery": Waves,
  "Personal Growth": Compass,
  Spirituality: Sparkles,
  Career: Briefcase,
  Business: Hammer,
  Finance: Wallet,
  Learning: BookOpen,
  Relationships: Users,
  Parenting: Baby,
  Creativity: Film,
  Productivity: Pencil,
  Habits: Guitar,
  Sports: Mountain,
  Travel: Footprints,
  Lifestyle: Camera,
  "Sustainability & Environment": Globe,
  "Gardening & Plants": Sprout,
  "Minimalism & Slow Living": Leaf,
  "Digital Wellbeing": Smartphone,
  Volunteering: HandHeart,
  Other: MoreHorizontal,
};

export function CategoryIcon({
  category,
  className,
}: {
  category: JourneyCategory | string | null | undefined;
  className?: string;
}) {
  const Icon = (category && CATEGORY_ICONS[category as JourneyCategory]) || MoreHorizontal;

  return (
    <span
      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full bg-scrim backdrop-blur-md ${className ?? ""}`}
    >
      <Icon className="h-4 w-4 text-ember" aria-hidden="true" />
    </span>
  );
}
