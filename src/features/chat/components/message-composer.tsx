import type { ChangeEvent, FormEvent, KeyboardEvent } from "react";
import { Button } from "@/shared/components/ui";

type Props = {
  value: string;
  enabled: boolean;
  placeholder: string;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function MessageComposer({ value, enabled, placeholder, onChange, onSubmit }: Props) {
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };
  return (
    <form onSubmit={onSubmit} className="border-t border-slate-100 p-4 sm:p-6 dark:border-slate-800">
      <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-50 dark:border-slate-700 dark:bg-slate-900">
        <textarea value={value} disabled={!enabled} onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onChange(event.target.value)} onKeyDown={handleKeyDown} rows={1} placeholder={placeholder} className="max-h-32 min-h-10 min-w-0 flex-1 resize-none overflow-y-auto wrap-break-word border-0 bg-transparent px-2 py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed dark:text-slate-100" />
        <Button type="submit" disabled={!enabled} aria-label="Gửi tin nhắn" size="md" className="shrink-0 rounded-xl bg-indigo-600 px-4 shadow-none hover:bg-indigo-700">Gửi</Button>
      </div>
    </form>
  );
}
