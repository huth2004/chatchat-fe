"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type SubmitEvent,
} from "react";
import { Button, Input } from "@/shared/components/ui";
import { useAuth } from "@/features/auth/providers/auth-provider";
import {
  chatService,
  chatSocketService,
  type Conversation,
  type DirectConversation,
  type Message,
} from "@/features/chat";
import { userService, type User } from "@/features/user";
import { useTheme } from "@/shared/providers/theme-provider";

type ChatConversation = Conversation & {
  messages: ChatMessage[];
  unread?: number;
};

type ChatMessage = Message & {
  sendStatus?: "sending" | "failed";
};

type ChatDirectConversation = Omit<DirectConversation, "messages"> & {
  messages: ChatMessage[];
};

function appendMessage(messages: ChatMessage[], message: ChatMessage) {
  return messages.some(({ id }) => id === message.id)
    ? messages
    : [...messages, message];
}

function replacePendingMessage(
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
            new Date(message.timestamp).getTime() -
              new Date(sentMessage.timestamp).getTime(),
          ) < 120000)),
  );

  return messages.flatMap((message) => {
    if (message.id === pendingMessageId) {
      return serverMessage ? [] : [sentMessage];
    }

    if (serverMessage && message.id === serverMessage.id) {
      return [sentMessage];
    }

    return [message];
  });
}

function mergeMessages(current: ChatMessage[], incoming: Message[]) {
  const messages = new Map(current.map((message) => [message.id, message]));

  for (const message of incoming) {
    messages.set(message.id, message);
  }

  return [...messages.values()].sort(
    (first, second) =>
      new Date(first.timestamp).getTime() -
      new Date(second.timestamp).getTime(),
  );
}

function Avatar({ name, avatarUrl, small = false }: { name?: string | null; avatarUrl?: string | null; small?: boolean }) {
  const displayName = name?.trim() || "Người dùng";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <span className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-indigo-400 to-violet-600 font-semibold text-white shadow-sm ring-2 ring-white dark:ring-slate-900 ${small ? "h-9 w-9 text-xs" : "h-11 w-11 text-sm"}`}>
      {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : initials}
    </span>
  );
}

function normalizeUsername(value?: string | null) {
  return value?.trim().toLocaleLowerCase("vi-VN") ?? "";
}

function formatConversationTime(value?: string | null) {
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

export default function ChatView() {
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
        [selectedConversation.id]: result.data!,
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

  if (isLoading || !user) {
    return <main className="flex min-h-screen items-center justify-center bg-[#f6f7fb] text-sm text-slate-400">Đang tải phiên đăng nhập...</main>;
  }

  if (isLoadingConversations) {
    return <main className="flex min-h-screen items-center justify-center bg-[#f6f7fb] text-sm text-slate-400">Đang tải cuộc trò chuyện...</main>;
  }

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

    void sendMessageRequest(
      selectedConversation.id,
      directConversation.id,
      item.id,
      item.content,
    );
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

  const sendMessage = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = message.trim();
    if (!content || !selectedConversation) return;

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
    void sendMessageRequest(
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

  return (
    <main className="h-dvh overflow-hidden bg-[#f6f7fb] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto flex h-full max-w-375 overflow-hidden bg-white shadow-xl shadow-slate-200/40 dark:bg-slate-900 dark:shadow-none">
        <section className="flex w-full max-w-87.5 shrink-0 flex-col border-r border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900">
          <header className="px-6 pb-5 pt-8">
            <div className="mb-7 flex items-center justify-between">
              <div>
                <h1 className="mt-1 text-2xl font-bold tracking-tight">Tin nhắn</h1>
              </div>
              <button type="button" onClick={openUserSearch} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-lg text-indigo-600 transition hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-300 dark:hover:bg-indigo-950" aria-label="Tìm người dùng">⌕</button>
            </div>
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm cuộc trò chuyện..." leftIcon={<span>⌕</span>} className="h-11 min-w-0 flex-1 rounded-xl border-0 bg-slate-50 dark:bg-slate-800" />
          </header>
          <div className="flex-1 overflow-y-auto px-3">
            {filteredConversations.map((conversation) => (
              <button key={conversation.id} onClick={() => setSelectedId(conversation.id)} className={`mb-1 flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${selectedId === conversation.id ? "bg-indigo-50 dark:bg-indigo-950/50" : "hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
                <Avatar name={conversation.title || "Người dùng"} avatarUrl={conversation.avatarUrl} />
                <span className="flex min-w-0 flex-1 items-center gap-2">
                <span className="min-w-0 flex-1">
                  <span className={`block truncate text-sm font-semibold ${selectedId === conversation.id ? "text-indigo-900 dark:text-indigo-200" : "text-slate-800 dark:text-slate-200"}`}>{conversation.title || "Người dùng"}</span>
                  <span className="mt-1 block truncate text-xs text-slate-400">{conversation.lastMessage?.content ?? "Chưa có tin nhắn"}</span>
                  </span>
                <span
                  className="shrink-0 self-center text-[10px] font-medium text-slate-400"
                  title={conversation.lastMessage?.timestamp ?? undefined}
                >
                  {formatConversationTime(conversation.lastMessage?.timestamp)}
                </span>
                </span>
                {conversation.unread && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white">{conversation.unread}</span>}
              </button>
            ))}
            {filteredConversations.length === 0 && <p className="px-3 py-8 text-center text-sm text-slate-400">Chưa có cuộc trò chuyện</p>}
          </div>
          <footer className="flex min-w-0 items-center gap-3 border-t border-slate-100 p-4 dark:border-slate-800">
            <Avatar name={user.username} small />
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-700 dark:text-slate-200" title={user.username || "Người dùng"}>
              {user.username || "Người dùng"}
            </span>
            <button type="button" onClick={toggleTheme} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" aria-label={isDarkMode ? "Bật giao diện sáng" : "Bật giao diện tối"}>
              {isDarkMode ? "✹" : "⬤"}
            </button>
          </footer>
        </section>

        <section className="flex min-h-0 min-w-0 flex-1 flex-col dark:bg-slate-950">
          <header className="flex h-22.25 items-center justify-between border-b border-slate-100 px-5 sm:px-8 dark:border-slate-800">
            {selectedConversation && (
              <div className="flex items-center gap-3">
                <Avatar name={conversationForView.title} avatarUrl={conversationForView.avatarUrl} />
                <div><h2 className="font-bold text-slate-900 dark:text-slate-100">{conversationForView.title || "Người dùng"}</h2></div>
              </div>
            )}
          </header>
          <div className="flex min-h-0 flex-1">
            <div className="relative flex min-w-0 flex-1 flex-col">
              <div
                ref={messagesContainerRef}
                onScroll={handleMessagesScroll}
                className="relative min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-7 sm:px-8"
              >
                {!selectedConversation ? (
                  <div className="flex h-full items-center justify-center text-center">
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        {conversations.length ? "Chọn một cuộc trò chuyện để bắt đầu." : "Bạn chưa có cuộc trò chuyện nào."}
                      </p>
                      <Button type="button" size="pill" onClick={openUserSearch} className="mt-4 rounded-xl bg-indigo-600 shadow-none hover:bg-indigo-700">
                        Tìm bạn bè
                      </Button>
                    </div>
                  </div>
                ) : selectedConversation.type !== "direct" ? (
                  <div className="flex h-full items-center justify-center text-center">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Tính năng chat nhóm chưa được phát triển.</p>
                  </div>
                ) : (
                  <>
                <div className="mx-auto flex items-center gap-3 text-[10px] font-semibold uppercase tracking-widest text-slate-300"><span className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />Hôm nay<span className="h-px flex-1 bg-slate-100 dark:bg-slate-800" /></div>
                {messages.map((item) => {
                  const isMine =
                    !selectedDirectConversation ||
                    item.senderId !== selectedDirectConversation.partnerId;
                  return <div key={item.id} className={`flex items-end gap-2 ${isMine ? "justify-end" : "justify-start"}`}>
                    {!isMine && <Avatar name={conversationForView.title} avatarUrl={conversationForView.avatarUrl} small />}
                    <div className={`flex max-w-[min(78%,460px)] flex-col ${isMine ? "items-end" : "items-start"}`}>
                      <div className={`max-w-full wrap-break-word whitespace-pre-wrap px-4 py-3 text-sm leading-relaxed shadow-sm ${isMine ? "rounded-2xl rounded-br-md bg-indigo-600 text-white shadow-indigo-100 dark:shadow-none" : "rounded-2xl rounded-bl-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"}`}>{item.content}</div>
                      {isMine && item.sendStatus === "failed" && (
                        <button
                          type="button"
                          onClick={() => retryMessage(item)}
                          className="mt-1 text-xs font-medium text-red-500 underline-offset-2 hover:underline dark:text-red-400"
                        >
                          Gửi lại
                        </button>
                      )}
                      {isMine && item.sendStatus === "sending" && (
                        <span className="mt-1 text-[10px] text-slate-400">
                          Đang gửi...
                        </span>
                      )}
                    </div>
                  </div>;
                })}
                  </>
                )}
              </div>
              {showScrollToBottom && (
                <button
                  type="button"
                  onClick={() => scrollMessagesToBottom()}
                  className="absolute bottom-28 left-1/2 z-10 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-lg text-slate-600 shadow-lg transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  aria-label="Cuộn xuống tin nhắn mới nhất"
                  title="Tin nhắn mới nhất"
                >
                  ↓
                </button>
              )}
              {selectedConversation && (
              <form onSubmit={sendMessage} className="border-t border-slate-100 p-4 sm:p-6 dark:border-slate-800">
                <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-50 dark:border-slate-700 dark:bg-slate-900">
                  <textarea value={message} disabled={!selectedConversation || selectedConversation.type !== "direct"} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} rows={1} placeholder={!selectedConversation ? "Chọn cuộc trò chuyện để nhắn tin" : selectedConversation.type === "direct" ? "Viết tin nhắn..." : "Tính năng chat nhóm chưa được phát triển"} className="max-h-32 min-h-10 min-w-0 flex-1 resize-none overflow-y-auto wrap-break-word border-0 bg-transparent px-2 py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed dark:text-slate-100" />
                  <Button type="submit" disabled={selectedConversation.type !== "direct"} aria-label="Gửi tin nhắn" size="md" className="shrink-0 rounded-xl bg-indigo-600 px-4 shadow-none hover:bg-indigo-700">Gửi</Button>
                </div>
              </form>
              )}
            </div>
          </div>
        </section>
      </div>
      {isUserSearchOpen && (
        <div className="fixed inset-0 z-20 flex items-start justify-center bg-slate-900/30 px-4 pt-24" onClick={() => setIsUserSearchOpen(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Tìm người dùng</h2>
              <button type="button" onClick={() => setIsUserSearchOpen(false)} className="text-xl text-slate-400 hover:text-slate-700" aria-label="Đóng">×</button>
            </div>
            <Input value={userSearch} onChange={(event) => setUserSearch(event.target.value)} autoFocus placeholder="Nhập tên người dùng..." className="h-11 rounded-xl border-0 bg-slate-50" />
            <div className="mt-3 max-h-80 overflow-y-auto">
              {isUserSearching && <p className="py-6 text-center text-sm text-slate-400">Đang tìm...</p>}
              {!isUserSearching && userSearch.trim() && !userResults.length && <p className="py-6 text-center text-sm text-slate-400">Không tìm thấy người dùng</p>}
              {userResults.map((target) => (
                <div key={target.id} className="flex items-center gap-3 rounded-xl p-3 text-slate-800 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                  <Avatar name={target.username} />
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">{target.username}</span>
                  <Button type="button" disabled={isCreatingConversation} onClick={() => void startConversation(target)} size="sm" className="shrink-0 rounded-lg bg-indigo-600 px-3 shadow-none hover:bg-indigo-700">
                    {isCreatingConversation ? "Đang tạo..." : "Nhắn tin"}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
