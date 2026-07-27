import { formatRelativeDate } from "@/lib/utils";
import { archiveUpdate } from "@/lib/actions/update";

type UpdateItemProps = {
  update: {
    id: string;
    content: string;
    publishedAt: Date;
  };
};

export function UpdateItem({ update }: UpdateItemProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-surface p-4">
      <div>
        <p className="whitespace-pre-wrap text-sm text-ink">{update.content}</p>
        <p className="mt-2 text-xs text-ink-faint">{formatRelativeDate(update.publishedAt)}</p>
      </div>
      <form action={archiveUpdate} className="shrink-0">
        <input type="hidden" name="updateId" value={update.id} />
        <button type="submit" className="text-xs font-medium text-danger hover:opacity-80">
          Delete
        </button>
      </form>
    </div>
  );
}
