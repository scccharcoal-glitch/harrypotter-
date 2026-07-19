import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/services/settings";
import { getAllCategories } from "@/lib/services/categories";
import { isBlobConfigured } from "@/lib/upload";
import { SettingsForm } from "./SettingsForm";

export const metadata: Metadata = {
  title: "ตั้งค่าเว็บไซต์",
  robots: { index: false, follow: false },
};

export default async function AdminSettingsPage() {
  const [settings, categories] = await Promise.all([getSiteSettings(), getAllCategories()]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-slate-900">ตั้งค่าเว็บไซต์</h1>
      <SettingsForm
        siteTitle={settings.siteTitle}
        siteDescription={settings.siteDescription}
        siteShareImage={settings.siteShareImage}
        categories={categories}
        homeCategorySlugs={settings.homeCategorySlugs}
        homeSeoContent={settings.homeSeoContent}
        sponsorLinks={settings.sponsorLinks}
        blobEnabled={isBlobConfigured()}
      />
    </div>
  );
}
