export type Message = {
  id: string;
  conversationId?: string;
  senderId: string;
  content: string;
  timestamp: string;
};

export type CreateMessage = {
  conversationId: string;
  content: string;
};

export type MessageDTO = Message;
export type CreateMessageDTO = CreateMessage;
