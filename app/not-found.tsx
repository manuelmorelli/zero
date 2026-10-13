import { Header } from "@/components/layout/Header";
import { NotFoundState } from "@/components/ui/not-found-state";

// Gli indirizzi che non esistono in nessuna parte del sito cadono qui, fuori dal gruppo (site):
// l'header va quindi messo a mano, altrimenti la pagina resterebbe senza menu.
export default function RootNotFound() {
  return (
    <>
      <Header />
      <NotFoundState />
    </>
  );
}
