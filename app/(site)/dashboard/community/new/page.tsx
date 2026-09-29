import { requireCreator } from "@/lib/creator";
import { firstNameOf } from "@/lib/format/firstName";
import { NewCommunityListingClient } from "@/components/creator/NewCommunityListingClient";

export default async function NewCommunityListingPage() {
  const { user } = await requireCreator();

  // Titolo e margini li decide NewCommunityListingClient: i passaggi normali hanno la pagina
  // classica, la chat AI occupa tutto lo schermo come Gemini.
  return (
    <main>
      <NewCommunityListingClient userId={user.id} creatorFirstName={firstNameOf(user.name)} />
    </main>
  );
}
