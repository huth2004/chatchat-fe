"use client";

import { Button } from "@/shared/components/ui";
import { useChatController } from "../hooks/use-chat-controller";
import { Avatar } from "../components/avatar";
import { ConversationList } from "../components/conversation-list";
import { MessageComposer } from "../components/message-composer";
import { MessageList } from "../components/message-list";
import { UserSearchModal } from "../components/user-search-modal";

function LoadingState({ message }: { message: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f7fb] text-sm text-slate-400">
      {message}
    </main>
  );
}

export default function ChatView() {
  const chat = useChatController();

  if (chat.isLoading || !chat.user) {
    return <LoadingState message="Đang tải phiên đăng nhập..." />;
  }

  if (chat.isLoadingConversations) {
    return <LoadingState message="Đang tải cuộc trò chuyện..." />;
  }

  const isDirectConversation = chat.selectedConversation?.type === "direct";

  return (
    <main className="h-dvh overflow-hidden bg-[#f6f7fb] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto flex h-full max-w-375 overflow-hidden bg-white shadow-xl shadow-slate-200/40 dark:bg-slate-900 dark:shadow-none">
        <ConversationList
          conversations={chat.filteredConversations}
          selectedId={chat.selectedId}
          search={chat.search}
          username={chat.user.username}
          isDarkMode={chat.isDarkMode}
          onSearchChange={chat.setSearch}
          onSelect={chat.setSelectedId}
          onOpenUserSearch={chat.openUserSearch}
          onToggleTheme={chat.toggleTheme}
        />

        <section className="flex min-h-0 min-w-0 flex-1 flex-col dark:bg-slate-950">
          <header className="flex h-22.25 items-center justify-between border-b border-slate-100 px-5 sm:px-8 dark:border-slate-800">
            {chat.selectedConversation && (
              <div className="flex items-center gap-3">
                <Avatar
                  name={chat.conversationForView.title}
                  avatarUrl={chat.conversationForView.avatarUrl}
                />
                <h2 className="font-bold text-slate-900 dark:text-slate-100">
                  {chat.conversationForView.title || "Người dùng"}
                </h2>
              </div>
            )}
          </header>

          <div className="flex min-h-0 flex-1">
            <div className="relative flex min-w-0 flex-1 flex-col">
              <div
                ref={chat.messagesContainerRef}
                onScroll={chat.handleMessagesScroll}
                className="relative min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-7 sm:px-8"
              >
                {chat.loadError && (
                  <div
                    role="alert"
                    className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
                  >
                    {chat.loadError}
                  </div>
                )}
                {!chat.selectedConversation ? (
                  <EmptyConversationState
                    hasConversations={chat.conversations.length > 0}
                    onOpenUserSearch={chat.openUserSearch}
                  />
                ) : !isDirectConversation ? (
                  <div className="flex h-full items-center justify-center text-center">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Tính năng chat nhóm chưa được phát triển.
                    </p>
                  </div>
                ) : (
                  <>
                    {chat.selectedDirectConversation?.isLoadingMessages && (
                      <p className="text-center text-xs text-slate-400">
                        {chat.messages.length ? "Đang tải tin nhắn cũ..." : "Đang tải tin nhắn..."}
                      </p>
                    )}
                    <MessageList
                      messages={chat.messages}
                      conversationTitle={chat.conversationForView.title}
                      avatarUrl={chat.conversationForView.avatarUrl}
                      currentUserId={chat.user.id}
                      onRetry={chat.retryMessage}
                    />
                    {/* {chat.selectedDirectConversation?.hasMore && !chat.selectedDirectConversation.isLoadingMessages && (
                      <p className="text-center text-xs text-slate-400">
                        Cuộn lên để tải tin nhắn cũ hơn
                      </p>
                    )} */}
                  </>
                )}
              </div>

              {chat.showScrollToBottom && (
                <button
                  type="button"
                  onClick={() => chat.scrollMessagesToBottom()}
                  className="absolute bottom-28 left-1/2 z-10 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-lg text-slate-600 shadow-lg transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  aria-label="Cuộn xuống tin nhắn mới nhất"
                  title="Tin nhắn mới nhất"
                >
                  ↓
                </button>
              )}

              {chat.selectedConversation && (
                <MessageComposer
                  value={chat.message}
                  enabled={isDirectConversation}
                  placeholder={
                    isDirectConversation
                      ? "Viết tin nhắn..."
                      : "Tính năng chat nhóm chưa được phát triển"
                  }
                  onChange={chat.setMessage}
                  onSubmit={chat.sendMessage}
                />
              )}
            </div>
          </div>
        </section>
      </div>

      {chat.isUserSearchOpen && (
        <UserSearchModal
          query={chat.userSearch}
          results={chat.userResults}
          searching={chat.isUserSearching}
          creating={chat.isCreatingConversation}
          onQueryChange={chat.setUserSearch}
          onClose={() => chat.setIsUserSearchOpen(false)}
          onStartConversation={(target) => void chat.startConversation(target)}
        />
      )}
    </main>
  );
}

function EmptyConversationState({
  hasConversations,
  onOpenUserSearch,
}: {
  hasConversations: boolean;
  onOpenUserSearch: () => void;
}) {
  return (
    <div className="flex h-full items-center justify-center text-center">
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {hasConversations
            ? "Chọn một cuộc trò chuyện để bắt đầu."
            : "Bạn chưa có cuộc trò chuyện nào."}
        </p>
        <Button
          type="button"
          size="pill"
          onClick={onOpenUserSearch}
          className="mt-4 rounded-xl bg-indigo-600 shadow-none hover:bg-indigo-700"
        >
          Tìm bạn bè
        </Button>
      </div>
    </div>
  );
}
