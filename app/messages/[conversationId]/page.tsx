import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { canMessage, getConversationForParticipant, listMessages, otherParticipant } from "@/lib/messaging";
import { markConversationRead } from "@/lib/actions/message";
import { getImagePlaybackUrl } from "@/lib/r2";
import { Header } from "@/components/layout/Header";
import { ChatWindow } from "@/components/messages/ChatWindow";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const { user } = await requireSession();

  const conversation = await getConversationForParticipant(conversationId, user.id);
  if (!conversation) notFound();

  const { user: otherUser } = otherParticipant(conversation, user.id);

  const [messages, canWrite] = await Promise.all([
    listMessages(conversationId),
    canMessage(user.id, otherUser.id),
    markConversationRead(conversationId),
  ]);

  const otherUserAvatarUrl = otherUser.avatarUrl ? await getImagePlaybackUrl(otherUser.avatarUrl) : null;

  return (
    <main>
      <Header />

      <div className="mx-auto max-w-2xl px-6 pb-10 pt-24">
        <ChatWindow
          conversationId={conversationId}
          currentUserId={user.id}
          otherUser={{ name: otherUser.name, avatarUrl: otherUserAvatarUrl }}
          initialMessages={messages.map((message) => ({
            id: message.id,
            senderId: message.senderId,
            content: message.content,
            createdAt: message.createdAt.toISOString(),
          }))}
          initialCanWrite={canWrite}
        />
      </div>
    </main>
  );
}
