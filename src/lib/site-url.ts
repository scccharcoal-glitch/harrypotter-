const PRODUCTION_SITE_URL = "https://www.xn--l3cca8ayaad1fcd3f0b7fg3itck.online";
const LEGACY_VERCEL_HOSTS = new Set(["doo-harry-potter.vercel.app"]);

export function getSiteUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const siteUrl = new URL(configuredUrl || PRODUCTION_SITE_URL);

  if (process.env.VERCEL_ENV === "production" || LEGACY_VERCEL_HOSTS.has(siteUrl.hostname)) {
    return PRODUCTION_SITE_URL;
  }

  return siteUrl.toString().replace(/\/$/, "");
}
