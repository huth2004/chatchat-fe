export type Conversation = {
  id: string;
  type: "direct" | "group";
  title: string;
  avatarUrl: string | null;
  lastMessage: {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    timestamp: string;
  } | null;
};

export type ConversationDTO = Conversation;

export type ConversationDetails = Conversation & {
  messages: import("./message.type").Message[];
};
