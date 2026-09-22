import { Response } from "@/shared/core/response";
import * as ConversationTypes from "@/features/chat/types/conversation.type";
import * as MessageTypes from "@/features/chat/types/message.type";

export interface ChatService {
  getConversations(): Promise<Response<ConversationTypes.Conversation[]>>;
  getConversation(
    conversationId: string,
  ): Promise<Response<ConversationTypes.Conversation>>;
  getMessages(
    conversationId: string,
    limit?: number,
    cursor?: string,
  ): Promise<Response<MessageTypes.Message[]>>;
  createConversation(otherUserIds: string[]): Promise<Response<string>>;
  sendMessage(
    conversationId: string,
    content: string,
  ): Promise<Response<MessageTypes.Message>>;
}
