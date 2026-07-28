// Mirrors `images.remotePatterns` in next.config.ts. next/image throws a hard client-side
// render error (not just a broken-image icon) for any src whose hostname isn't in that
// allowlist — this lets callers check first and fall back to a plain <img> for
// admin-entered URLs (e.g. blog post cover images) that can point anywhere.
const ALLOWED_EXACT_HOSTS = new Set(["placehold.co", "image.tmdb.org"]);
const ALLOWED_HOST_SUFFIX = ".public.blob.vercel-storage.com";

export function isAllowedImageHost(url: string): boolean {
  if (!url || url.startsWith("/")) return true;

  try {
    const { hostname, protocol } = new URL(url);
    if (protocol !== "https:") return false;
    return ALLOWED_EXACT_HOSTS.has(hostname) || hostname.endsWith(ALLOWED_HOST_SUFFIX);
  } catch {
    return false;
  }
}
