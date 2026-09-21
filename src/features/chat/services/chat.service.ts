import { Response } from "@/shared/core/response";
import * as ConversationTypes from "@/features/chat/types/conversation.type";
import * as MessageTypes from "@/features/chat/types/message.type";
import * as DirectConversationTypes from "@/features/chat/types/direct-conversation.type";

export interface ChatService {
  getConversations(): Promise<Response<ConversationTypes.Conversation[]>>;
  getConversation(
    conversationId: string,
  ): Promise<Response<ConversationTypes.Conversation>>;
  getDirectConversation(
    conversationId: string,
  ): Promise<Response<DirectConversationTypes.DirectConversation>>;
  createDirectConversation(partnerId: string): Promise<Response<string>>;
  sendMessage(
    conversationId: string,
    content: string,
  ): Promise<Response<MessageTypes.Message>>;
}
