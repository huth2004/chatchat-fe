import type { ChatMessage } from "../types/chat-view.type";
import type { Message } from "../types/message.type";

export function appendMessage(messages: ChatMessage[], message: ChatMessage) {
  return deduplicateMessages(
    messages.some(({ id }) => id === message.id)
      ? messages
      : [...messages, message],
  );
}

export function deduplicateMessages(messages: ChatMessage[]) {
  const uniqueMessages = new Map<string, ChatMessage>();

  for (const message of messages) {
    uniqueMessages.set(message.id, message);
  }

  return [...uniqueMessages.values()];
}

export function replacePendingMessage(
  messages: ChatMessage[],
  pendingMessageId: string,
  sentMessage: ChatMessage,
) {
  const pendingMessage = messages.find(({ id }) => id === pendingMessageId);
  const serverMessage = messages.find(
    (message) =>
      message.id !== pendingMessageId &&
      !message.id.startsWith("pending:") &&
      (message.id === sentMessage.id ||
        (pendingMessage &&
          message.senderId === sentMessage.senderId &&
          message.content === pendingMessage.content &&
          Math.abs(
        new Date(message.createdAt).getTime() -
          new Date(sentMessage.createdAt).getTime(),
          ) < 120000)),
  );

  return deduplicateMessages(messages.flatMap((message) => {
    if (message.id === pendingMessageId) {
      return serverMessage ? [] : [sentMessage];
    }
    if (serverMessage && message.id === serverMessage.id) {
      return [sentMessage];
    }
    return [message];
  }));
}

export function mergeMessages(current: ChatMessage[], incoming: Message[]) {
  return deduplicateMessages([...current, ...incoming]).sort(
    (first, second) =>
    new Date(first.createdAt).getTime() -
    new Date(second.createdAt).getTime(),
  );
}

export function normalizeUsername(value?: string | null) {
  return value?.trim().toLocaleLowerCase("vi-VN") ?? "";
}

export function formatConversationTime(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const now = new Date();
  const elapsedMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (elapsedMinutes >= 0 && elapsedMinutes < 1) return "Vừa xong";
  if (elapsedMinutes < 60) return `${elapsedMinutes} phút trước`;
  const startOfDay = (current: Date) =>
    new Date(current.getFullYear(), current.getMonth(), current.getDate()).getTime();
  const dayDifference = Math.floor(
    (startOfDay(now) - startOfDay(date)) / 86400000,
  );
  if (dayDifference === 0) {
    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }
  if (dayDifference === 1) return "Hôm qua";
  if (dayDifference > 1 && dayDifference < 7) {
    return new Intl.DateTimeFormat("vi-VN", { weekday: "short" }).format(date);
  }
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: date.getFullYear() === now.getFullYear() ? undefined : "numeric",
  }).format(date);
}
