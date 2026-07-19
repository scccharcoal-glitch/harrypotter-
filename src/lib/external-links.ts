export const EXTERNAL_LINK_REL = "nofollow noopener noreferrer external";

const INTERNAL_HOSTS = new Set([
  "xn--l3cca8ayaad1fcd3f0b7fg3itck.online",
  "www.xn--l3cca8ayaad1fcd3f0b7fg3itck.online",
]);

export function isExternalLink(href: string): boolean {
  const value = href.trim();
  if (!value || value.startsWith("/") || value.startsWith("#") || value.startsWith("?")) {
    return false;
  }

  try {
    const url = new URL(value);
    return (url.protocol === "http:" || url.protocol === "https:") && !INTERNAL_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

export function getExternalLinkProps(href: string): { target?: "_blank"; rel?: string } {
  return isExternalLink(href) ? { target: "_blank", rel: EXTERNAL_LINK_REL } : {};
}
