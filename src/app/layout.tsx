import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import "./globals.css";
import { getCachedSiteSettings } from "@/lib/services/settings";
import { getSiteUrl } from "@/lib/site-url";

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getCachedSiteSettings();
  const siteUrl = getSiteUrl();
  const shareImages = settings.siteShareImage ? [settings.siteShareImage] : undefined;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: settings.siteTitle,
      template: "%s | ดูแฮร์รี่พอตเตอร์",
    },
    description: settings.siteDescription,
    // TODO: add this site's own Google Search Console verification.google value once
    // registered — do not reuse another site's verification code.
    openGraph: {
      type: "website",
      locale: "th_TH",
      siteName: "ดูแฮร์รี่พอตเตอร์",
      title: settings.siteTitle,
      description: settings.siteDescription,
      url: siteUrl,
      images: shareImages,
    },
    twitter: {
      card: "summary_large_image",
      title: settings.siteTitle,
      description: settings.siteDescription,
      images: shareImages,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${kanit.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-[var(--background)] text-[var(--ink)]">
        {children}
        {/* TODO: add this site's own analytics tracking (e.g. Histats) once set up —
            use a new site id for this domain, never reuse another site's tracking id. */}
      </body>
    </html>
  );
}
