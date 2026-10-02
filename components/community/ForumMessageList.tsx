import Link from "next/link";
import type { ForumMessageItem } from "@/lib/community/forumMessages";
import { ReportButton } from "@/components/common/ReportButton";
import { ForumMessageDeleteButton } from "@/components/community/ForumMessageDeleteButton";
import { Avatar } from "@/components/ui/avatar";
import { PANEL, PANEL_GLASS } from "@/components/ui/panel";
import { cn } from "@/lib/utils";

type ForumMessageListProps = {
  messages: ForumMessageItem[];
  currentUserId: string | null;
  /** Il creator può cancellare qualunque messaggio nel forum del proprio Journey, non solo i propri. */
  isCreatorViewer: boolean;
  searchQuery: string;
};

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function ForumMessageList({ messages, currentUserId, isCreatorViewer, searchQuery }: ForumMessageListProps) {
  if (messages.length === 0) {
    return (
      <p className="mt-4 text-sm text-ink-muted">
        {searchQuery ? `No messages match "${searchQuery}".` : "No messages yet, be the first to start the conversation."}
      </p>
    );
  }

  return (
    <ul className="mt-4 space-y-3">
      {messages.map((message) => {
        const canDelete = currentUserId === message.authorId || isCreatorViewer;
        const canReport = currentUserId !== null && currentUserId !== message.authorId;

        return (
          <li
            key={message.id}
            className={cn(
              message.isCreator ? PANEL_GLASS : PANEL,
              "p-3.5",
              message.isCreator && "shadow-glow"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <Avatar name={message.authorName} avatarUrl={message.authorAvatarUrl} size="sm" />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    {message.authorUsername ? (
                      <Link
                        href={`/profile/${message.authorUsername}`}
                        className={cn(
                          "truncate text-sm font-semibold hover:underline",
                          message.isCreator ? "text-ember" : "text-ink"
                        )}
                      >
                        {message.authorName}
                      </Link>
                    ) : (
                      <span className={cn("truncate text-sm font-semibold", message.isCreator ? "text-ember" : "text-ink")}>
                        {message.authorName}
                      </span>
                    )}
                    {message.isCreator && (
                      <span className="shrink-0 text-sm font-semibold uppercase tracking-wide text-ember">· Creator</span>
                    )}
                  </div>
                  <span className="text-sm text-ink-faint">{formatTimestamp(message.createdAt)}</span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {canReport && <ReportButton targetType="COMMENT" targetId={message.id} className="grid h-7 w-7 place-items-center rounded-full border border-transparent text-ink-faint transition-colors hover:border-danger hover:text-danger" />}
                {canDelete && <ForumMessageDeleteButton messageId={message.id} />}
              </div>
            </div>
            <p className="mt-2.5 whitespace-pre-line text-sm leading-relaxed text-ink">{message.content}</p>
          </li>
        );
      })}
    </ul>
  );
}
