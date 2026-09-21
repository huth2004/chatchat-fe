import { Message } from "./message.type";

export type DirectConversation = {
  id: string;
  partnerId: string;
  title: string;
  avatarUrl: string | null;
  messages: Message[];
};

export type DirectConversationDTO = DirectConversation;
