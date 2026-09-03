import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { getConversationChatData } from "@/lib/messaging";
import { getImagePlaybackUrl } from "@/lib/r2";
import { ChatWindow } from "@/components/messages/ChatWindow";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const { user } = await requireSession();

  // Il messaggio viene segnato come letto lato client (vedi ChatWindow.tsx), non qui: revalidatePath
  // può essere chiamato solo da un'azione innescata dal client, non durante il render della pagina.
  const chatData = await getConversationChatData(conversationId, user.id);
  if (!chatData) notFound();

  const { otherUser, messages, canWrite } = chatData;
  const otherUserAvatarUrl = otherUser.avatarUrl ? await getImagePlaybackUrl(otherUser.avatarUrl) : null;

  return (
    <main>

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
