import * as UserTypes from "@/features/user/types/user.type";
import * as ConversationTypes from "@/features/chat/types/conversation.type";
import * as MessageTypes from "@/features/chat/types/message.type";

import { UserMapper } from "@/features/user/mappers/user.mapper";
import { MessageMapper } from "./message.mapper";

export class ConversationMapper {
  static toConversation(
    conversationDTO: ConversationTypes.ConversationDTO,
    userDTO: UserTypes.UserDTO,
    messagesDTO: MessageTypes.MessageDTO[],
  ): ConversationTypes.Conversation {
    return {
      id: conversationDTO.id,
      type: conversationDTO.type,
      title: userDTO.username,
      avatarUrl: userDTO.avatar ?? null,
      lastMessage: messagesDTO.length
        ? {
            ...MessageMapper.toMessage(messagesDTO[messagesDTO.length - 1]),
            conversationId: conversationDTO.id,
          }
        : null,
    };
  }
}
