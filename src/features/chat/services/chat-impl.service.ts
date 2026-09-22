import { ChatService } from "./chat.service";
import { apiRequest } from "@/shared/utils/api-client";
import { Response } from "@/shared/core/response";
import * as ConversationTypes from "@/features/chat/types/conversation.type";
import * as MessageTypes from "@/features/chat/types/message.type";

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

  createConversation(otherUserIds: string[]): Promise<Response<string>> {
    return apiRequest<string>(`/chat/conversations`, {
      method: "POST",
      body: JSON.stringify({ otherUserIds }),
    });
  }

  getMessages(
    conversationId: string,
    limit?: number,
    cursor?: string,
  ): Promise<Response<MessageTypes.Message[]>> {
    const queryParams = new URLSearchParams();
    if (limit) queryParams.append("limit", limit.toString());
    if (cursor) queryParams.append("cursor", cursor);
    return apiRequest<MessageTypes.Message[]>(
      `/chat/messages/${encodeURIComponent(conversationId)}?${queryParams.toString()}`,
    );
  }

  sendMessage(
    conversationId: string,
    content: string,
  ): Promise<Response<MessageTypes.Message>> {
    const randomNumber1 = Math.floor(Math.random() * 1000);
    const randomNumber2 = Math.floor(Math.random() * 1000);

    // if (randomNumber1 > randomNumber2) {
    //   return new Promise((resolve) => {
    //     setTimeout(() => {
    //       resolve({
    //         status: "error",
    //         message: "Server is disconnected",
    //       });
    //     }, 1000);
    //   });
    // }

    return apiRequest<MessageTypes.Message>(`/chat/messages`, {
      method: "POST",
      body: JSON.stringify({ conversationId, content }),
    });
  }
}

export const chatService: ChatService = new ChatImplService();
