export type Message = {
  id: string;
  conversationId?: string;
  senderId: string;
  content: string;
  createdAt: string;
};

export type CreateMessage = {
  conversationId: string;
  content: string;
};

export type MessageDTO = Message;
export type CreateMessageDTO = CreateMessage;

export type MessagePageMetadata = {
  nextCursor?: string | null;
  hasMore: boolean;
};
