import Image from "next/image";
import { formatRelativeDate } from "@/lib/utils";
import { archiveUpdate } from "@/lib/actions/update";
import type { DashboardUpdate } from "@/lib/updates";

type UpdateItemProps = {
  update: DashboardUpdate;
};

export function UpdateItem({ update }: UpdateItemProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <UpdateBody update={update} />
        </div>
        <form action={archiveUpdate} className="shrink-0">
          <input type="hidden" name="updateId" value={update.id} />
          <button type="submit" className="text-xs font-medium text-danger hover:opacity-80">
            Delete
          </button>
        </form>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <p className="text-xs text-ink-faint">{formatRelativeDate(update.publishedAt)}</p>
        {update.reactions.length > 0 && (
          <p className="flex items-center gap-2 text-xs text-ink-muted">
            {update.reactions.map((reaction) => (
              <span key={reaction.emoji}>
                {reaction.emoji} {reaction.count}
              </span>
            ))}
          </p>
        )}
      </div>

      {update.isQuestion && <AnswersPanel answers={update.answers} />}
    </div>
  );
}

// Media (se presente, in base a `type`), poi il testo (didascalia, o prompt del sondaggio/della
// domanda se è quello il suo ruolo qui), poi i risultati del sondaggio (se presente): le tre
// parti sono indipendenti, non a vicenda esclusive — un Update foto/video può avere anche un
// sondaggio o una domanda abbinati (vedi Update.isQuestion nello schema).
function UpdateBody({ update }: { update: DashboardUpdate }) {
  return (
    <div>
      {update.type === "IMAGE" && update.mediaUrl && (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-surface-2">
          <Image src={update.mediaUrl} alt="" fill sizes="400px" className="object-cover" />
        </div>
      )}
      {update.type === "VIDEO" && update.mediaUrl && (
        <video src={update.mediaUrl} controls playsInline className="w-full rounded-lg bg-black" />
      )}

      {update.content && (
        <p
          className={`whitespace-pre-wrap text-sm text-ink ${update.poll ? "font-semibold" : ""} ${
            update.type === "IMAGE" || update.type === "VIDEO" ? "mt-2" : ""
          }`}
        >
          {update.content}
        </p>
      )}

      {update.poll && (
        <div className="mt-3 space-y-2">
          {update.poll.options.map((option) => {
            const percent =
              update.poll!.totalVotes > 0 ? Math.round((option.votes / update.poll!.totalVotes) * 100) : 0;
            return (
              <div key={option.id} className="relative overflow-hidden rounded-lg border border-border bg-surface-2">
                <div className="absolute inset-y-0 left-0 bg-ember/20" style={{ width: `${percent}%` }} />
                <div className="relative flex items-center justify-between px-3 py-2 text-xs">
                  <span className="font-medium text-ink">{option.label}</span>
                  <span className="text-ink-muted">
                    {percent}% · {option.votes}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AnswersPanel({ answers }: { answers: DashboardUpdate["answers"] }) {
  return (
    <details className="mt-3 border-t border-border pt-3">
      <summary className="cursor-pointer text-xs font-semibold text-ink-muted hover:text-ink">
        {answers.length === 0
          ? "No answers yet"
          : `${answers.length} ${answers.length === 1 ? "answer" : "answers"} — visible only to you`}
      </summary>
      {answers.length > 0 && (
        <ul className="mt-3 space-y-2">
          {answers.map((answer) => (
            <li key={answer.id} className="rounded-lg bg-surface-2 px-3 py-2">
              <p className="text-sm text-ink">{answer.content}</p>
              <p className="mt-1 text-[11px] text-ink-faint">{formatRelativeDate(answer.createdAt)}</p>
            </li>
          ))}
        </ul>
      )}
    </details>
  );
}
