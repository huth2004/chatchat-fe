import * as ConversationTypes from "@/shared/types/conversation.type";
import * as MessageTypes from "@/shared/types/message.type";

export interface ChatService {
  getConversations(
    hasMessages: boolean,
  ): Promise<ConversationTypes.Conversation[]>;
  getConversationByPartnerId(
    partnerId: string,
  ): Promise<ConversationTypes.Conversation>;
  sendMessage(
    message: MessageTypes.CreateMessage,
  ): Promise<MessageTypes.Message>;
}
