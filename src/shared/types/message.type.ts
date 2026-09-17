// Type for UI
export type MessageStatus = "sent" | "pending" | "failed";

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  images: [];
  videos: [];
  status: MessageStatus;
  sentAt: string;
};

export type CreateMessage = {
  conversationId: string;
  content: string;
};

// Type for API
export type MessageDTO = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
};

export type CreateMessageDTO = {
  conversationId: string;
  content: string;
};
