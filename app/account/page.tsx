import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";

// Sostituita dal pannello "Edit profile" sul Profilo pubblico (components/profile/EditProfileButton.tsx):
// nessuna pagina Account separata, per non avere due punti scollegati per la stessa cosa.
export default async function AccountPage() {
  const { user } = await requireSession();
  redirect(`/profile/${user.id}`);
}
