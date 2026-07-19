export function formatThaiDate(iso: string): string {
  return new Intl.DateTimeFormat("th-TH", { day: "2-digit", month: "short", year: "numeric" }).format(
    new Date(iso)
  );
}
