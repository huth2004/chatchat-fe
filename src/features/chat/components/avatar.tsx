export function Avatar({ name, avatarUrl, small = false }: { name?: string | null; avatarUrl?: string | null; small?: boolean }) {
  const displayName = name?.trim() || "Người dùng";
  const initials = displayName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return (
    <span className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-indigo-400 to-violet-600 font-semibold text-white shadow-sm ring-2 ring-white dark:ring-slate-900 ${small ? "h-9 w-9 text-xs" : "h-11 w-11 text-sm"}`}>
      {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : initials}
    </span>
  );
}
