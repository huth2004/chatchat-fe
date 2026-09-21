import * as MessageTypes from "@/features/chat/types/message.type";

export class MessageMapper {
  static toMessage(messageDTO: MessageTypes.MessageDTO): MessageTypes.Message {
    return {
      id: messageDTO.id,
      senderId: messageDTO.senderId,
      content: messageDTO.content,
      timestamp: messageDTO.timestamp,
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
