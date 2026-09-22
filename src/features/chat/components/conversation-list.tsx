import { Input } from "@/shared/components/ui";
import type { ChatConversation } from "../types/chat-view.type";
import { Avatar } from "./avatar";
import { formatConversationTime } from "../utils/chat.utils";

type Props = {
  conversations: ChatConversation[];
  selectedId: string | null;
  search: string;
  username: string;
  isDarkMode: boolean;
  onSearchChange: (value: string) => void;
  onSelect: (id: string) => void;
  onOpenUserSearch: () => void;
  onToggleTheme: () => void;
};

export function ConversationList({ conversations, selectedId, search, username, isDarkMode, onSearchChange, onSelect, onOpenUserSearch, onToggleTheme }: Props) {
  return (
    <section className="flex w-full max-w-87.5 shrink-0 flex-col border-r border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900">
      <header className="px-6 pb-5 pt-8">
        <div className="mb-7 flex items-center justify-between">
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Tin nhắn</h1>
          <button type="button" onClick={onOpenUserSearch} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-lg text-indigo-600 transition hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-300 dark:hover:bg-indigo-950" aria-label="Tìm người dùng">⌕</button>
        </div>
        <Input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Tìm cuộc trò chuyện..." leftIcon={<span>⌕</span>} className="h-11 min-w-0 flex-1 rounded-xl border-0 bg-slate-50 dark:bg-slate-800" />
      </header>
      <div className="flex-1 overflow-y-auto px-3">
        {conversations.map((conversation) => (
          <button key={conversation.id} onClick={() => onSelect(conversation.id)} className={`mb-1 flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${selectedId === conversation.id ? "bg-indigo-50 dark:bg-indigo-950/40" : "hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
            <Avatar name={conversation.title} avatarUrl={conversation.avatarUrl} small />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{conversation.title || "Người dùng"}</span>
              <span className="block truncate text-xs text-slate-400">{conversation.lastMessage?.content || "Chưa có tin nhắn"}</span>
            </span>
            <span className="shrink-0 self-center text-[10px] font-medium text-slate-400" title={conversation.lastMessage?.createdAt ?? undefined}>{formatConversationTime(conversation.lastMessage?.createdAt)}</span>
            {conversation.unread && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white">{conversation.unread}</span>}
          </button>
        ))}
        {conversations.length === 0 && <p className="px-3 py-8 text-center text-sm text-slate-400">Chưa có cuộc trò chuyện</p>}
      </div>
      <footer className="flex min-w-0 items-center gap-3 border-t border-slate-100 p-4 dark:border-slate-800">
        <Avatar name={username} small />
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-700 dark:text-slate-200" title={username || "Người dùng"}>{username || "Người dùng"}</span>
        <button type="button" onClick={onToggleTheme} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" aria-label={isDarkMode ? "Bật giao diện sáng" : "Bật giao diện tối"}>{isDarkMode ? "✹" : "⬤"}</button>
      </footer>
    </section>
  );
}
