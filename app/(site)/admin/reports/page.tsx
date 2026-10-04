import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { isAdminEmail } from "@/lib/admin";
import { listReports } from "@/lib/actions/adminReports";
import { ReportsList } from "@/components/admin/ReportsList";
import { PAGE_SPACING, PAGE_WIDTH } from "@/components/ui/page-container";
import { PageTitle } from "@/components/ui/heading";

export default async function AdminReportsPage() {
  const session = await requireSession();
  // Chi non è amministratore vede una pagina inesistente, come se la rotta non ci fosse.
  if (!isAdminEmail(session.user.email)) notFound();

  const reports = await listReports();

  return (
    <main>
      <div className={`${PAGE_WIDTH.narrow} ${PAGE_SPACING}`}>
        <PageTitle>Segnalazioni</PageTitle>
        <p className="mt-2 text-sm text-ink-muted">Pannello visibile solo agli amministratori.</p>

        <div className="mt-8">
          <ReportsList reports={reports} />
        </div>
      </div>
    </main>
  );
}
