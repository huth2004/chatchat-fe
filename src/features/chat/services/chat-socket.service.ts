import { io, type Socket } from "socket.io-client";

import type { Message } from "@/features/chat/types/message.type";
import { getAccessToken } from "@/shared/utils/access-token";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ??
  (typeof window !== "undefined" ? window.location.origin : "");

const MESSAGE_EVENT = "message:new";

type MessageListener = (message: Message) => void;
type ConnectionListener = () => void;
type ConversationCreatedListener = (conversationId: string) => void;

type ConversationCreatedPayload =
  | string
  | {
      conversationId?: string;
    };

const CONVERSATION_CREATED_EVENT = "conversation:new";

class ChatSocketService {
  private socket: Socket | null = null;
  private readonly joinedConversations = new Set<string>();

  connect(
    listener: MessageListener,
    onConnected?: ConnectionListener,
    onConversationCreated?: ConversationCreatedListener,
  ) {
    if (!SOCKET_URL) return () => undefined;

    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        autoConnect: false,
        transports: ["websocket"],
        withCredentials: true,
        auth: { token: getAccessToken() },
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 10000,
      });
      this.socket.on("connect_error", (error) => {
        const details = error as Error & {
          description?: unknown;
          context?: unknown;
        };
        console.error("[chat-socket] connect_error:", {
          message: error.message,
          description: details.description,
          context: details.context,
        });
      });
      this.socket.on("connect", () => {
        console.info("[chat-socket] connected:", this.socket?.id);
        onConnected?.();
      });
      this.socket.on("disconnect", (reason) => {
        console.warn("[chat-socket] disconnected:", reason);
      });
      this.socket.on(
        CONVERSATION_CREATED_EVENT,
        (payload: ConversationCreatedPayload) => {
          const conversationId =
            typeof payload === "string" ? payload : payload?.conversationId;
          if (conversationId) onConversationCreated?.(conversationId);
        },
      );
      this.socket.on("connect", () => {
        for (const conversationId of this.joinedConversations) {
          this.socket?.emit("conversation:join", { conversationId });
        }
      });
    }

    this.socket.auth = { token: getAccessToken() };
    this.socket.on(MESSAGE_EVENT, listener);
    this.socket.connect();

    return () => {
      this.socket?.off(MESSAGE_EVENT, listener);
    };
  }

  joinConversation(conversationId: string) {
    this.joinedConversations.add(conversationId);
    if (this.socket?.connected) {
      this.socket.emit("conversation:join", { conversationId });
    }
  }

  leaveConversation(conversationId: string) {
    this.joinedConversations.delete(conversationId);
    if (this.socket?.connected) {
      this.socket.emit("conversation:leave", { conversationId });
    }
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.joinedConversations.clear();
  }
}

export const chatSocketService = new ChatSocketService();
