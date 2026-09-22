import type { Conversation } from "./conversation.type";
import type { Message } from "./message.type";

export type ChatMessage = Message & {
  isMine?: boolean;
  sendStatus?: "sending" | "failed";
};

export type ChatConversation = Conversation & {
  messages: ChatMessage[];
  unread?: number;
  isLoadingMessages?: boolean;
};

export type ChatDirectConversation = ChatConversation & {
  partnerId?: string;
  nextCursor?: string | null;
  hasMore?: boolean;
};
