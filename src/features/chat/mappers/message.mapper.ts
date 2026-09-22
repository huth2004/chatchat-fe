import * as MessageTypes from "@/features/chat/types/message.type";

export class MessageMapper {
  static toMessage(messageDTO: MessageTypes.MessageDTO): MessageTypes.Message {
    return {
      id: messageDTO.id,
      conversationId: messageDTO.conversationId,
      senderId: messageDTO.senderId,
      content: messageDTO.content,
      createdAt: messageDTO.createdAt,
    };
  }

  static toCreateMessageDTO(
    message: MessageTypes.CreateMessage,
  ): MessageTypes.CreateMessageDTO {
    return {
      conversationId: message.conversationId,
      content: message.content,
    };
  }
}
