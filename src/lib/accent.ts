const ACCENT_MAP: Record<string, { badge: string; text: string; border: string }> = {
  red: { badge: "bg-rose-600", text: "text-rose-500", border: "border-rose-500" },
  green: { badge: "bg-emerald-600", text: "text-emerald-500", border: "border-emerald-500" },
  gold: { badge: "bg-amber-500", text: "text-amber-400", border: "border-amber-400" },
  blue: { badge: "bg-sky-600", text: "text-sky-500", border: "border-sky-500" },
  purple: { badge: "bg-violet-600", text: "text-violet-500", border: "border-violet-500" },
  pink: { badge: "bg-pink-600", text: "text-pink-500", border: "border-pink-500" },
};

export function accentClasses(accentColor: string) {
  return ACCENT_MAP[accentColor] ?? ACCENT_MAP.red;
}
