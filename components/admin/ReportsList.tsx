"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Report } from "@/generated/prisma/client";
import { deleteReport, setReportStatus } from "@/lib/actions/adminReports";
import { formatRelativeDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge, CHIP, CHIP_SELECTED, Notice, Panel } from "@/components/ui/panel";
import { CardTitle } from "@/components/ui/heading";

type ReportWithUser = Report & { user: { name: string; email: string } };

const FILTERS = [
  { value: "ALL", label: "Tutte" },
  { value: "PENDING", label: "Da vedere" },
  { value: "REVIEWING", label: "In revisione" },
  { value: "RESOLVED", label: "Risolte" },
] as const;

type Filter = (typeof FILTERS)[number]["value"];

const STATUS_LABELS: Record<Report["status"], string> = {
  PENDING: "Da vedere",
  REVIEWING: "In revisione",
  RESOLVED: "Risolta",
  DISMISSED: "Respinta",
};

const TARGET_LABELS: Record<Report["targetType"], string> = {
  USER: "Utente",
  CREATOR: "Creator",
  JOURNEY: "Journey",
  UPDATE: "Aggiornamento",
  COMMENT: "Commento del forum",
};

/** Link al contenuto segnalato, quando la pagina pubblica esiste e l'id è quello giusto. */
function contentHref(report: ReportWithUser): string | null {
  if (report.targetType === "JOURNEY") return `/journeys/${report.targetId}`;
  if (report.targetType === "USER") return `/profile/${report.targetId}`;
  return null;
}

export function ReportsList({ reports }: { reports: ReportWithUser[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("ALL");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<ReportWithUser | null>(null);

  const visible = filter === "ALL" ? reports : reports.filter((report) => report.status === filter);

  async function handleStatus(reportId: string, status: string) {
    setPendingId(reportId);
    const result = await setReportStatus(reportId, status);
    setPendingId(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    router.refresh();
  }

  async function handleDelete() {
    if (!toDelete) return;
    setPendingId(toDelete.id);
    const result = await deleteReport(toDelete.id);
    setPendingId(null);
    setToDelete(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
            className={filter === item.value ? CHIP_SELECTED : CHIP}
          >
            {item.label}
          </button>
        ))}
      </div>

      {visible.length === 0 && <Notice>Nessuna segnalazione in questa lista.</Notice>}

      {visible.map((report) => {
        const href = contentHref(report);
        const isClosed = report.status === "RESOLVED";
        const busy = pendingId === report.id;

        return (
          <Panel as="article" key={report.id} className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{STATUS_LABELS[report.status]}</Badge>
              <Badge>{TARGET_LABELS[report.targetType]}</Badge>
              <span className="text-sm text-ink-faint">{formatRelativeDate(report.createdAt)}</span>
            </div>

            <CardTitle>{report.reason}</CardTitle>
            <p className="text-sm text-ink-muted">
              Segnalato da {report.user.name} ({report.user.email})
            </p>
            <p className="break-all text-sm text-ink-faint">ID contenuto: {report.targetId}</p>

            {href && (
              <Link href={href} className="inline-block text-sm font-semibold text-ember hover:underline">
                Apri il contenuto
              </Link>
            )}

            {report.targetType === "CREATOR" && !isClosed && (
              <p className="text-sm text-ink-muted">Risolverla toglie 10 punti di Trust Score al creator.</p>
            )}

            <div className="flex flex-wrap gap-2 pt-1">
              {report.status === "PENDING" && (
                <Button variant="secondary" disabled={busy} onClick={() => handleStatus(report.id, "REVIEWING")}>
                  Prendi in carico
                </Button>
              )}
              {!isClosed && (
                <>
                  <Button variant="primary" disabled={busy} onClick={() => handleStatus(report.id, "RESOLVED")}>
                    Risolvi
                  </Button>
                  <Button variant="secondary" disabled={busy} onClick={() => setToDelete(report)}>
                    Respingi e cancella
                  </Button>
                </>
              )}
              {isClosed && (
                <Button variant="secondary" disabled={busy} onClick={() => handleStatus(report.id, "PENDING")}>
                  Riapri
                </Button>
              )}
            </div>
          </Panel>
        );
      })}

      <Dialog open={toDelete !== null} onOpenChange={(open) => !open && setToDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Cancellare questa segnalazione?</DialogTitle>
            <DialogDescription>
              Sparisce per sempre dal database. Non si può annullare.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setToDelete(null)}>
              Annulla
            </Button>
            <Button variant="danger" disabled={pendingId !== null} onClick={handleDelete}>
              Cancella
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
