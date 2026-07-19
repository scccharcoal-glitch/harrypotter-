import { prisma } from "@/lib/prisma";

interface RedirectEntry {
  destination: string;
  statusCode: number;
}

const CACHE_TTL_MS = 60_000;

let cache: Map<string, RedirectEntry> = new Map();
let lastFetchedAt = 0;

export async function getRedirectMap(): Promise<Map<string, RedirectEntry>> {
  const now = Date.now();
  if (lastFetchedAt > 0 && now - lastFetchedAt < CACHE_TTL_MS) {
    return cache;
  }

  try {
    const rows = await prisma.redirect.findMany();
    const next = new Map<string, RedirectEntry>();
    for (const row of rows) {
      next.set(row.source, { destination: row.destination, statusCode: row.statusCode });
    }

    cache = next;
  } catch {
    // Middleware runs before every matched request. If the database is
    // unavailable, keep serving with the last known redirects (or none)
    // instead of returning a 500 before Next.js can render the page.
  }

  lastFetchedAt = now;
  return cache;
}

export function invalidateRedirectCache() {
  lastFetchedAt = 0;
}
