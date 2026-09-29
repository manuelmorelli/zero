import Link from "next/link";
import { requireSession } from "@/lib/session";
import { listConversations } from "@/lib/messaging";
import { getImagePlaybackUrl } from "@/lib/r2";
import { formatRelativeDate } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { PAGE_SPACING, PAGE_WIDTH } from "@/components/ui/page-container";
import { PageTitle } from "@/components/ui/heading";
import { NOTICE } from "@/components/ui/panel";

export default async function MessagesPage() {
  const { user } = await requireSession();
  const conversations = await listConversations(user.id);

  const items = await Promise.all(
    conversations.map(async (conversation) => ({
      id: conversation.id,
      otherUserName: conversation.otherUser.name,
      otherUserAvatarUrl: conversation.otherUser.avatarUrl
        ? await getImagePlaybackUrl(conversation.otherUser.avatarUrl)
        : null,
      lastMessagePreview: conversation.lastMessage?.content ?? null,
      lastMessageAt: conversation.lastMessageAt,
      unreadCount: conversation.unreadCount,
    }))
  );

  return (
    <main>

      <div className={`${PAGE_WIDTH.narrow} ${PAGE_SPACING}`}>
        <PageTitle>Messages</PageTitle>

        {items.length === 0 ? (
          <p className={`mt-6 ${NOTICE}`}>
            You don&apos;t have any conversations yet. You can message someone you follow, or who
            follows you, from their profile.
          </p>
        ) : (
          <div className="mt-6 divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
            {items.map((conversation) => (
              <Link
                key={conversation.id}
                href={`/messages/${conversation.id}`}
                className="flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-surface-2"
              >
                <Avatar name={conversation.otherUserName} avatarUrl={conversation.otherUserAvatarUrl} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-ink">{conversation.otherUserName}</span>
                    <span className="shrink-0 text-sm text-ink-faint">
                      {formatRelativeDate(conversation.lastMessageAt)}
                    </span>
                  </span>
                  <span className="mt-0.5 line-clamp-1 text-sm text-ink-muted">
                    {conversation.lastMessagePreview ?? "No messages yet"}
                  </span>
                </span>
                {conversation.unreadCount > 0 && (
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-danger" />
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
