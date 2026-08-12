import Link from "next/link";
import { requireSession } from "@/lib/session";
import { listConversations } from "@/lib/messaging";
import { getImagePlaybackUrl } from "@/lib/r2";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatRelativeDate } from "@/lib/utils";

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
      <PageHeader containerClassName="max-w-2xl" />

      <div className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="text-lg font-bold tracking-tight text-ink">Messages</h1>

        {items.length === 0 ? (
          <p className="mt-6 rounded-xl border border-border bg-surface p-6 text-sm text-ink-muted">
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
                    <span className="shrink-0 text-[11px] text-ink-faint">
                      {formatRelativeDate(conversation.lastMessageAt)}
                    </span>
                  </span>
                  <span className="mt-0.5 line-clamp-1 text-xs text-ink-muted">
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

function Avatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  if (avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={avatarUrl} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />;
  }
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-bold text-ink-muted">
      {initials}
    </span>
  );
}
