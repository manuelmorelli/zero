"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Report } from "@/generated/prisma/client";
import {
  banReportedAccount,
  deleteReport,
  hideReportedContent,
  setReportStatus,
  unbanReportedAccount,
  unhideReportedContent,
} from "@/lib/actions/adminReports";
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

type ReportWithUser = Report & {
  user: { name: string; email: string };
  contentHidden: boolean;
  ownerUserId: string | null;
  accountBanned: boolean;
};

/** Tipi di contenuto che si possono nascondere subito da qui (vedi HIDEABLE_TARGET_TYPES in
 * lib/actions/adminReports.ts: Utente/Journeyer restano fuori, è un'azione diversa). */
const HIDEABLE_TARGET_TYPES: Report["targetType"][] = ["JOURNEY", "EPISODE", "COMMENT"];

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
  CREATOR: "Journeyer",
  JOURNEY: "Journey",
  EPISODE: "Episodio",
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
  const [toHide, setToHide] = useState<ReportWithUser | null>(null);
  const [toBan, setToBan] = useState<ReportWithUser | null>(null);

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

  async function handleHide() {
    if (!toHide) return;
    setPendingId(toHide.id);
    const result = await hideReportedContent(toHide.id);
    setPendingId(null);
    setToHide(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Contenuto nascosto.");
    router.refresh();
  }

  async function handleUnhide(reportId: string) {
    setPendingId(reportId);
    const result = await unhideReportedContent(reportId);
    setPendingId(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Contenuto di nuovo visibile.");
    router.refresh();
  }

  async function handleBan() {
    if (!toBan) return;
    setPendingId(toBan.id);
    const result = await banReportedAccount(toBan.id);
    setPendingId(null);
    setToBan(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Account bannato.");
    router.refresh();
  }

  async function handleUnban(reportId: string) {
    setPendingId(reportId);
    const result = await unbanReportedAccount(reportId);
    setPendingId(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Account riattivato.");
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
              {report.contentHidden && <Badge className="border-danger-line text-danger">Contenuto nascosto</Badge>}
              {report.accountBanned && <Badge className="border-danger-line text-danger">Account bannato</Badge>}
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
              {HIDEABLE_TARGET_TYPES.includes(report.targetType) && !report.contentHidden && (
                <Button variant="danger" disabled={busy} onClick={() => setToHide(report)}>
                  Nascondi subito
                </Button>
              )}
              {HIDEABLE_TARGET_TYPES.includes(report.targetType) && report.contentHidden && (
                <Button variant="secondary" disabled={busy} onClick={() => handleUnhide(report.id)}>
                  Rendi di nuovo visibile
                </Button>
              )}
              {report.ownerUserId && !report.accountBanned && (
                <Button variant="danger" disabled={busy} onClick={() => setToBan(report)}>
                  Banna l&apos;account
                </Button>
              )}
              {report.ownerUserId && report.accountBanned && (
                <Button variant="secondary" disabled={busy} onClick={() => handleUnban(report.id)}>
                  Riattiva l&apos;account
                </Button>
              )}
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

      <Dialog open={toHide !== null} onOpenChange={(open) => !open && setToHide(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Nascondere subito questo contenuto?</DialogTitle>
            <DialogDescription>
              Sparisce dal sito per tutti, da subito. Non è definitivo: si può far tornare visibile da qui quando vuoi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setToHide(null)}>
              Annulla
            </Button>
            <Button variant="danger" disabled={pendingId !== null} onClick={handleHide}>
              Nascondi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={toBan !== null} onOpenChange={(open) => !open && setToBan(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Bannare questo account?</DialogTitle>
            <DialogDescription>
              La persona viene disconnessa subito e non può più entrare su Zero. Non è definitivo: si
              può riattivare da qui quando vuoi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setToBan(null)}>
              Annulla
            </Button>
            <Button variant="danger" disabled={pendingId !== null} onClick={handleBan}>
              Banna
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
