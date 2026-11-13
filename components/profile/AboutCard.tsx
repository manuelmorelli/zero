import { BioPreviewCard } from "@/components/profile/BioPreviewCard";

type AboutCardProps = {
  /** Serve al link verso la pagina dedicata Bio & presentation. */
  profileUserId: string;
  name: string;
  bio: string | null;
  /** Interessi reali dichiarati dalla persona (User.interests, stessa lista di lib/constants/categories.ts). */
  interests?: string[];
};

/** Card Bio compatta (solo telefono, 112/156 come "In Progress"), usata da sola quando il video
 * di presentazione non compare. Da computer la bio vive accanto alla copertina (BioPanel, in
 * ProfileHero). */
export function AboutCard({ profileUserId, name, bio, interests }: AboutCardProps) {
  return (
    <BioPreviewCard
      profileUserId={profileUserId}
      name={name}
      bio={bio}
      interests={interests}
      className="max-md:w-[calc(50%-0.3125rem)] max-md:flex-none"
    />
  );
}
