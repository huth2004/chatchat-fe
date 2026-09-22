import type { ChatMessage } from "../types/chat-view.type";
import { Avatar } from "./avatar";

type Props = {
  messages: ChatMessage[];
  conversationTitle: string;
  avatarUrl: string | null;
  currentUserId: string;
  onRetry: (message: ChatMessage) => void;
};

export function MessageList({ messages, conversationTitle, avatarUrl, currentUserId, onRetry }: Props) {
  return (
    <>
      <div className="mx-auto flex items-center gap-3 text-[10px] font-semibold uppercase tracking-widest text-slate-300"><span className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />Hôm nay<span className="h-px flex-1 bg-slate-100 dark:bg-slate-800" /></div>
      {messages.map((item) => {
        const isMine = item.senderId === currentUserId;
        return <div key={item.id} className={`flex items-end gap-2 ${isMine ? "justify-end" : "justify-start"}`}>
          {!isMine && <Avatar name={conversationTitle} avatarUrl={avatarUrl} small />}
          <div className={`flex max-w-[min(78%,460px)] flex-col ${isMine ? "items-end" : "items-start"}`}>
            <div className={`max-w-full wrap-break-word whitespace-pre-wrap px-4 py-3 text-sm leading-relaxed shadow-sm ${isMine ? "rounded-2xl rounded-br-md bg-indigo-600 text-white shadow-indigo-100 dark:shadow-none" : "rounded-2xl rounded-bl-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"}`}>{item.content}</div>
            {isMine && item.sendStatus === "failed" && <button type="button" onClick={() => onRetry(item)} className="mt-1 text-xs font-medium text-red-500 underline-offset-2 hover:underline dark:text-red-400">Gửi lại</button>}
            {isMine && item.sendStatus === "sending" && <span className="mt-1 text-[10px] text-slate-400">Đang gửi...</span>}
          </div>
        </div>;
      })}
    </>
  );
}
