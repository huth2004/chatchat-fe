// Type for UI
import { User } from "./user.type";
import { Message } from "./message.type";

export type Conversation = {
  id: string;
  partner: User;
  messages: Message[];
};

// Type for API
import { MessageDTO } from "./message.type";

export type ConversationDTO = {
  id: string;
  messages: MessageDTO[];
};
