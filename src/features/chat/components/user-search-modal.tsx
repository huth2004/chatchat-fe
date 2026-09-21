import { Button, Input } from "@/shared/components/ui";
import type { User } from "@/features/user";
import { Avatar } from "./avatar";

type Props = {
  query: string;
  results: User[];
  searching: boolean;
  creating: boolean;
  onQueryChange: (value: string) => void;
  onClose: () => void;
  onStartConversation: (user: User) => void;
};

export function UserSearchModal({ query, results, searching, creating, onQueryChange, onClose, onStartConversation }: Props) {
  return (
    <div className="fixed inset-0 z-20 flex items-start justify-center bg-slate-900/30 px-4 pt-24" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900" onClick={(event) => event.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Tìm người dùng</h2>
          <button type="button" onClick={onClose} className="text-xl text-slate-400 hover:text-slate-700" aria-label="Đóng">×</button>
        </div>
        <Input value={query} onChange={(event) => onQueryChange(event.target.value)} autoFocus placeholder="Nhập tên người dùng..." className="h-11 rounded-xl border-0 bg-slate-50" />
        <div className="mt-3 max-h-80 overflow-y-auto">
          {searching && <p className="py-6 text-center text-sm text-slate-400">Đang tìm...</p>}
          {!searching && query.trim() && !results.length && <p className="py-6 text-center text-sm text-slate-400">Không tìm thấy người dùng</p>}
          {results.map((target) => (
            <div key={target.id} className="flex items-center gap-3 rounded-xl p-3 text-slate-800 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
              <Avatar name={target.username} />
              <span className="min-w-0 flex-1 truncate text-sm font-semibold">{target.username}</span>
              <Button type="button" disabled={creating} onClick={() => onStartConversation(target)} size="sm" className="shrink-0 rounded-lg bg-indigo-600 px-3 shadow-none hover:bg-indigo-700">{creating ? "Đang tạo..." : "Nhắn tin"}</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
