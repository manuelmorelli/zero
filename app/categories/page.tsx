import { redirect } from "next/navigation";

// La pagina Categories è stata sostituita da /journeys (righe per categoria scorrevoli
// orizzontalmente + card Wildcard). Redirect mantenuto per eventuali link vecchi salvati o
// condivisi.
export default function CategoriesPage() {
  redirect("/journeys");
}
