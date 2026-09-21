import type { Conversation } from "./conversation.type";
import type { DirectConversation } from "./direct-conversation.type";
import type { Message } from "./message.type";

export type ChatMessage = Message & {
  sendStatus?: "sending" | "failed";
};

export type ChatConversation = Conversation & {
  messages: ChatMessage[];
  unread?: number;
};

export type ChatDirectConversation = Omit<DirectConversation, "messages"> & {
  messages: ChatMessage[];
};
