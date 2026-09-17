import * as MessageTypes from "@/shared/types/message.type";

export class MessageMapper {
  static toMessage(messageDTO: MessageTypes.MessageDTO): MessageTypes.Message {
    return {
      id: messageDTO.id,
      conversationId: messageDTO.conversationId,
      senderId: messageDTO.senderId,
      content: messageDTO.content,
      images: [],
      videos: [],
      status: "sent",
      sentAt: messageDTO.createdAt,
    };
  }

  static toCreateMessageDTO(
    message: MessageTypes.Message,
  ): MessageTypes.CreateMessageDTO {
    return {
      conversationId: message.conversationId,
      content: message.content,
    };
  }
}
