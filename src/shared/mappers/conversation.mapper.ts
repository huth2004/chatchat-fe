import * as UserTypes from "../types/user.type";
import * as ConversationTypes from "../types/conversation.type";
import * as MessageTypes from "../types/message.type";

import { UserMapper } from "./user.mapper";
import { MessageMapper } from "./message.mapper";

export class ConversationMapper {
  static toConversation(
    conversationDTO: ConversationTypes.ConversationDTO,
    userDTO: UserTypes.UserDTO,
    messagesDTO: MessageTypes.MessageDTO[],
  ): ConversationTypes.Conversation {
    return {
      id: conversationDTO.id,
      partner: UserMapper.toUser(userDTO),
      messages: messagesDTO.map((m) => MessageMapper.toMessage(m)),
    };
  }
}
