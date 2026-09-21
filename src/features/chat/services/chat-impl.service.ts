import { ChatService } from "./chat.service";
import { apiRequest } from "@/shared/utils/api-client";
import { Response } from "@/shared/core/response";
import * as ConversationTypes from "@/features/chat/types/conversation.type";
import * as MessageTypes from "@/features/chat/types/message.type";
import * as DirectConversationTypes from "@/features/chat/types/direct-conversation.type";

class ChatImplService implements ChatService {
  getConversations(): Promise<Response<ConversationTypes.Conversation[]>> {
    return apiRequest<ConversationTypes.Conversation[]>(`/chat/conversations`);
  }

  getConversation(
    conversationId: string,
  ): Promise<Response<ConversationTypes.Conversation>> {
    return apiRequest<ConversationTypes.Conversation>(
      `/chat/conversations/${encodeURIComponent(conversationId)}`,
    );
  }

  getDirectConversation(
    conversationId: string,
  ): Promise<Response<DirectConversationTypes.DirectConversation>> {
    return apiRequest<DirectConversationTypes.DirectConversation>(
      `/chat/conversations/direct/${encodeURIComponent(conversationId)}`,
    );
  }

  createDirectConversation(partnerId: string): Promise<Response<string>> {
    return apiRequest<string>(`/chat/conversations/direct`, {
      method: "POST",
      body: JSON.stringify({ partnerId }),
    });
  }

  sendMessage(
    conversationId: string,
    content: string,
  ): Promise<Response<MessageTypes.Message>> {
    // return new Promise((resolve) => {
    //   setTimeout(() => {
    //     resolve({
    //       status: "error",
    //       message: "Server is disconnected",
    //     });
    //   }, 1000);
    // });

    return apiRequest<MessageTypes.Message>(`/chat/conversations`, {
      method: "POST",
      body: JSON.stringify({ conversationId, content }),
    });
  }
}

export const chatService: ChatService = new ChatImplService();
