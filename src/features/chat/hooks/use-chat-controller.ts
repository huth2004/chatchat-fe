"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useAuth } from "@/features/auth/providers/auth-provider";
import {
  chatService,
  chatSocketService,
  type Conversation,
  type Message,
} from "@/features/chat";
import { userService, type User } from "@/features/user";
import { useTheme } from "@/shared/providers/theme-provider";
import type {
  ChatConversation,
  ChatDirectConversation,
  ChatMessage,
} from "../types/chat-view.type";
import {
  appendMessage,
  mergeMessages,
  normalizeUsername,
  replacePendingMessage,
} from "../utils/chat.utils";

export function useChatController() {
  const { user, isLoading } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [directConversations, setDirectConversations] = useState<
    Record<string, ChatDirectConversation>
  >({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isUserSearchOpen, setIsUserSearchOpen] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState<User[]>([]);
  const [isUserSearching, setIsUserSearching] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [loadError, setLoadError] = useState("");
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const selectedConversationIdRef = useRef<string | null>(null);
  const sendQueuesRef = useRef(new Map<string, Promise<void>>());
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  const selectedConversation = conversations.find((conversation) => conversation.id === selectedId);
  const selectedDirectConversation = selectedConversation
    ? directConversations[selectedConversation.id]
    : undefined;
  selectedConversationIdRef.current = selectedConversation?.id ?? null;
  const filteredConversations = useMemo(
    () => {
      const normalizedSearch = search.toLowerCase();

      return conversations.filter((conversation) => {
        const title = conversation.title?.trim().toLowerCase() ?? "";
        const hasRecentMessage = conversation.lastMessage !== null;
        const isSelected = conversation.id === selectedId;

        return (
          title.includes(normalizedSearch) &&
          (hasRecentMessage || isSelected)
        );
      });
    },
    [conversations, search, selectedId],
  );

  const synchronizeConversation = useCallback(async (conversationId: string) => {
    try {
      const result = await chatService.getDirectConversation(conversationId);
      if (result.status !== "success" || !result.data) return;

      chatSocketService.joinConversation(conversationId);
      setDirectConversations((current) => {
        const existing = current[conversationId];

        return {
          ...current,
          [conversationId]: {
            ...result.data!,
            messages: mergeMessages(
              existing?.messages ?? [],
              result.data!.messages,
            ),
          },
        };
      });

      setConversations((current) => {
        const latestMessage =
          result.data!.messages[result.data!.messages.length - 1];
        const existing = current.find(
          (conversation) => conversation.id === conversationId,
        );

        const conversation: ChatConversation = {
          ...(existing ?? {
            id: conversationId,
            type: "direct" as const,
            lastMessage: null,
            messages: [],
          }),
          title: result.data!.title,
          avatarUrl: result.data!.avatarUrl,
          lastMessage: latestMessage
            ? {
                id: latestMessage.id,
                conversationId,
                senderId: latestMessage.senderId,
                content: latestMessage.content,
                timestamp: latestMessage.timestamp,
              }
            : existing?.lastMessage ?? null,
        };

        if (existing) {
          return current.map((item) =>
            item.id === conversationId ? conversation : item,
          );
        }

        return [conversation, ...current];
      });
    } catch {
      setLoadError("Không thể đồng bộ tin nhắn sau khi kết nối lại.");
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    setIsLoadingConversations(true);
    void chatService.getConversations().then((result) => {
      if (result.status !== "success" || !result.data) {
        return;
      }
      const serverConversations = result.data.map((conversation) => ({ ...conversation, messages: [] }));
      setConversations(serverConversations);
      for (const conversation of serverConversations) {
        chatSocketService.joinConversation(conversation.id);
      }
      setSelectedId((currentId) => currentId && serverConversations.some(({ id }) => id === currentId)
        ? currentId
        : serverConversations[0]?.id ?? null);
    }).catch(() => {
      setConversations([]);
      setSelectedId(null);
    }).finally(() => setIsLoadingConversations(false));
  }, [user]);

  useEffect(() => {
    if (!user) {
      chatSocketService.disconnect();
      return;
    }

    const unsubscribe = chatSocketService.connect((incomingMessage) => {
      const conversationId = incomingMessage.conversationId;
      if (!conversationId) return;

      setDirectConversations((current) => {
        const direct = current[conversationId];
        if (!direct || direct.messages.some(({ id }) => id === incomingMessage.id)) {
          return current;
        }

        return {
          ...current,
          [conversationId]: {
            ...direct,
            messages: appendMessage(direct.messages, incomingMessage),
          },
        };
      });

      setConversations((current) => current.map((conversation) => {
        if (
          conversation.id !== conversationId ||
          conversation.lastMessage?.id === incomingMessage.id
        ) {
          return conversation;
        }

        return {
          ...conversation,
          messages: appendMessage(conversation.messages, incomingMessage),
          lastMessage: {
            id: incomingMessage.id,
            conversationId: conversation.id,
            senderId: incomingMessage.senderId,
            content: incomingMessage.content,
            timestamp: incomingMessage.timestamp,
          },
        };
      }));
    }, () => {
      const conversationId = selectedConversationIdRef.current;
      if (conversationId) {
        void synchronizeConversation(conversationId);
      }
    }, (conversationId) => {
      void synchronizeConversation(conversationId);
    });

    return () => {
      unsubscribe();
      chatSocketService.disconnect();
    };
  }, [synchronizeConversation, user]);

  useEffect(() => {
    const query = userSearch.trim();
    if (!isUserSearchOpen || !query) {
      setUserResults([]);
      return;
    }

    const timer = window.setTimeout(() => {
      setIsUserSearching(true);
      void userService.searchProfile(query)
        .then((result) => setUserResults(
          result.status === "success"
            ? (result.data ?? []).filter((target) => {
              const isSameId = user?.id != null && String(target.id) === String(user.id);
              const isSameUsername = normalizeUsername(target.username) === normalizeUsername(user?.username);
              return !isSameId && !isSameUsername;
            })
            : [],
        ))
        .catch(() => setUserResults([]))
        .finally(() => setIsUserSearching(false));
    }, 300);

    return () => window.clearTimeout(timer);
  }, [isUserSearchOpen, userSearch, user?.id]);

  useEffect(() => {
    if (!selectedConversation) return;
    if (selectedConversation.type !== "direct") return;
    void chatService.getDirectConversation(selectedConversation.id).then((result) => {
      if (result.status !== "success" || !result.data) {
        setLoadError(result.message ?? "Không thể tải cuộc trò chuyện.");
        return;
      }
      setDirectConversations((current) => ({
        ...current,
        [selectedConversation.id]: {
          ...result.data!,
          messages: mergeMessages([], result.data!.messages),
        },
      }));
      setConversations((current) => current.map((conversation) =>
        conversation.id === selectedConversation.id
          ? {
              ...conversation,
              title: result.data!.title,
              avatarUrl: result.data!.avatarUrl,
            }
          : conversation,
      ));
    }).catch(() => setLoadError("Không thể tải tin nhắn của cuộc trò chuyện."));
  }, [selectedConversation?.id]);

  const scrollMessagesToBottom = (behavior: ScrollBehavior = "smooth") => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior });
    setShowScrollToBottom(false);
  };

  useEffect(() => {
    setShowScrollToBottom(false);
    const frame = window.requestAnimationFrame(() => scrollMessagesToBottom("auto"));
    return () => window.cancelAnimationFrame(frame);
  }, [selectedConversation?.id, selectedDirectConversation?.messages.length]);

  const handleMessagesScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    setShowScrollToBottom(distanceFromBottom > 120);
  };

  const conversationForView: ChatConversation = selectedConversation ?? {
    id: "",
    type: "direct" as const,
    title: "Chưa chọn cuộc trò chuyện",
    avatarUrl: null,
    lastMessage: null,
    messages: [] as Message[],
  };
  const messages = selectedDirectConversation?.messages ?? conversationForView.messages;

  const openUserSearch = () => {
    setUserSearch("");
    setUserResults([]);
    setIsUserSearchOpen(true);
  };

  const retryMessage = (item: ChatMessage) => {
    if (item.sendStatus !== "failed" || !selectedConversation) return;

    const directConversation = directConversations[selectedConversation.id];
    if (!directConversation) {
      setLoadError("Đang tải thông tin người nhận. Vui lòng thử lại.");
      return;
    }

    enqueueMessageRequest(
      selectedConversation.id,
      directConversation.id,
      item.id,
      item.content,
    );
  };

  const enqueueMessageRequest = (
    conversationId: string,
    directConversationId: string,
    pendingMessageId: string,
    content: string,
  ) => {
    const previousRequest =
      sendQueuesRef.current.get(conversationId) ?? Promise.resolve();
    const nextRequest = previousRequest
      .catch(() => undefined)
      .then(() =>
        sendMessageRequest(
          conversationId,
          directConversationId,
          pendingMessageId,
          content,
        ),
      );

    sendQueuesRef.current.set(conversationId, nextRequest);
    void nextRequest.finally(() => {
      if (sendQueuesRef.current.get(conversationId) === nextRequest) {
        sendQueuesRef.current.delete(conversationId);
      }
    });
  };

  const sendMessageRequest = async (
    conversationId: string,
    directConversationId: string,
    pendingMessageId: string,
    content: string,
  ) => {
    setDirectConversations((current) => {
      const direct = current[conversationId];
      if (!direct) return current;

      return {
        ...current,
        [conversationId]: {
          ...direct,
          messages: direct.messages.map((item) =>
            item.id === pendingMessageId
              ? { ...item, sendStatus: "sending" }
              : item,
          ),
        },
      };
    });

    try {
      const result = await chatService.sendMessage(directConversationId, content);
      if (result.status !== "success" || !result.data) {
        throw new Error(result.message ?? "Không thể gửi tin nhắn.");
      }

      const sentMessage: ChatMessage = {
        ...result.data,
        timestamp: result.data.timestamp || new Date().toISOString(),
      };
      setDirectConversations((current) => {
        const direct = current[conversationId];
        if (!direct) return current;

        return {
          ...current,
          [conversationId]: {
            ...direct,
            messages: replacePendingMessage(
              direct.messages,
              pendingMessageId,
              sentMessage,
            ),
          },
        };
      });
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                messages: replacePendingMessage(
                  conversation.messages,
                  pendingMessageId,
                  sentMessage,
                ),
                lastMessage: {
                  id: sentMessage.id,
                  conversationId,
                  senderId: sentMessage.senderId,
                  content: sentMessage.content,
                  timestamp: sentMessage.timestamp,
                },
              }
            : conversation,
        ),
      );
    } catch (error) {
      setDirectConversations((current) => {
        const direct = current[conversationId];
        if (!direct) return current;

        return {
          ...current,
          [conversationId]: {
            ...direct,
            messages: direct.messages.map((item) =>
              item.id === pendingMessageId
                ? { ...item, sendStatus: "failed" }
                : item,
            ),
          },
        };
      });
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                messages: conversation.messages.map((item) =>
                  item.id === pendingMessageId
                    ? { ...item, sendStatus: "failed" }
                    : item,
                ),
              }
            : conversation,
        ),
      );
      setLoadError(
        error instanceof Error ? error.message : "Không thể gửi tin nhắn.",
      );
    }
  };

  const sendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = message.trim();
    if (!content || !selectedConversation || !user) return;

    if (selectedConversation.type !== "direct") {
      setLoadError("Tính năng chat nhóm chưa được phát triển.");
      return;
    }

    const directConversation = directConversations[selectedConversation.id];
    if (!directConversation) {
      setLoadError("Đang tải thông tin người nhận. Vui lòng thử lại.");
      return;
    }

    const pendingMessage: ChatMessage = {
      id: `pending:${Date.now()}:${Math.random().toString(36).slice(2)}`,
      conversationId: selectedConversation.id,
      senderId: user.id,
      content,
      timestamp: new Date().toISOString(),
      sendStatus: "sending",
    };
    setDirectConversations((current) => {
      const direct = current[selectedConversation.id];
      if (!direct) return current;
      return {
        ...current,
        [selectedConversation.id]: {
          ...direct,
          messages: appendMessage(direct.messages, pendingMessage),
        },
      };
    });
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === selectedConversation.id
          ? {
              ...conversation,
              messages: appendMessage(conversation.messages, pendingMessage),
              lastMessage: {
                id: pendingMessage.id,
                conversationId: conversation.id,
                senderId: pendingMessage.senderId,
                content: pendingMessage.content,
                timestamp: pendingMessage.timestamp,
              },
            }
          : conversation,
      ),
    );
    setMessage("");
    enqueueMessageRequest(
      selectedConversation.id,
      directConversation.id,
      pendingMessage.id,
      content,
    );
  };

  const openConversation = (target: Conversation) => {
    const existing = conversations.find((conversation) => conversation.id === target.id);
    if (existing) {
      setSelectedId(existing.id);
      setSearch("");
      return;
    }

    const conversation: ChatConversation = {
      ...target,
      messages: [],
    };
    setConversations((current) => [conversation, ...current]);
    setSelectedId(conversation.id);
    setSearch("");
  };

  const startConversation = async (target: User) => {
    setIsCreatingConversation(true);
    setLoadError("");
    try {
      const result = await chatService.createDirectConversation(target.id);
      if (result.status !== "success" || !result.data) {
        setLoadError(result.message ?? "Không thể tạo cuộc trò chuyện.");
        return;
      }

      const conversation: ChatConversation = {
        id: result.data,
        type: "direct",
        title: target.username,
        avatarUrl: target.avatar,
        lastMessage: null,
        messages: [],
      };
      setConversations((current) => [
        conversation,
        ...current.filter((item) => item.id !== conversation.id),
      ]);
      setSelectedId(conversation.id);
      setIsUserSearchOpen(false);
      setUserSearch("");
    } catch {
      setLoadError("Không thể tạo cuộc trò chuyện.");
    } finally {
      setIsCreatingConversation(false);
    }
  };

  return {
    user,
    isLoading,
    isDarkMode,
    toggleTheme,
    conversations,
    filteredConversations,
    selectedId,
    setSelectedId,
    search,
    setSearch,
    isUserSearchOpen,
    setIsUserSearchOpen,
    userSearch,
    setUserSearch,
    userResults,
    isUserSearching,
    isCreatingConversation,
    message,
    setMessage,
    isLoadingConversations,
    loadError,
    selectedConversation,
    selectedDirectConversation,
    conversationForView,
    messages,
    messagesContainerRef,
    showScrollToBottom,
    scrollMessagesToBottom,
    handleMessagesScroll,
    openUserSearch,
    retryMessage,
    sendMessage,
    openConversation,
    startConversation,
  };
}
