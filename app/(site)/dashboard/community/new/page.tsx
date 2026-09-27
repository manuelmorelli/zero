import { requireCreator } from "@/lib/creator";
import { firstNameOf } from "@/lib/format/firstName";
import { NewCommunityListingClient } from "@/components/creator/NewCommunityListingClient";

export default async function NewCommunityListingPage() {
  const { user } = await requireCreator();

  return (
    <main>
      <div className="mx-auto w-full max-w-xl px-6 pb-16 pt-24">
        <h1 className="text-xl font-bold tracking-tight">Add to your Community</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Create a Workshop, Event, Digital Product or 1:1 Service — it starts as a Draft, only you can see it.
        </p>

        <div className="mt-8">
          <NewCommunityListingClient userId={user.id} creatorFirstName={firstNameOf(user.name)} />
        </div>
      </div>
    </main>
  );
}
