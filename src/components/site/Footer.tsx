import Link from "next/link";
import { getCachedAllTags } from "@/lib/services/articles";
import { getCachedSiteSettings } from "@/lib/services/settings";
import { getExternalLinkProps } from "@/lib/external-links";

export async function Footer() {
  const [tags, settings] = await Promise.all([getCachedAllTags(), getCachedSiteSettings()]);

  return (
    <footer className="mt-16 border-t border-[var(--border)] bg-[var(--surface)] py-8">
      <div className="mx-auto max-w-6xl px-4 text-sm text-[var(--ink-muted)]">
        <p className="text-base font-bold text-[var(--ink)]">
          <span aria-hidden="true" className="text-[var(--brand)]">⚡</span>{" "}
          <span className="text-[var(--brand)]">ดูแฮร์รี่</span>พอตเตอร์
        </p>
        <p className="mt-2 max-w-3xl leading-relaxed">
          ดูแฮร์รี่พอตเตอร์ ศูนย์รวมข้อมูลภาพยนตร์แฮร์รี่ พอตเตอร์ครบทั้ง 8 ภาค และสัตว์มหัศจรรย์ 3 ภาค พร้อมเรื่องย่อ
          นักแสดง ตัวละคร เรตติ้ง และแพลตฟอร์มที่มีให้บริการ อัปเดตข้อมูลใหม่ทุกวัน เว็บไซต์นี้เป็นเว็บข้อมูล/รีวิวภาพยนตร์
          สำหรับแฟนคลับเท่านั้น ไม่มีวิดีโอหรือการสตรีมมิ่งบนเว็บนี้ และไม่ได้เป็นส่วนหนึ่งหรือได้รับการรับรองจาก Warner Bros.
          หรือเจ้าของลิขสิทธิ์แฟรนไชส์ Harry Potter แต่อย่างใด
        </p>
        {tags.length > 0 && (
          <div className="mt-6 border-t border-[var(--border)] pt-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--ink)]">แท็กทั้งหมด</p>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/tag/${encodeURIComponent(tag)}`}
                  prefetch={false}
                  className="rounded-full border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--ink-muted)] transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)]"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 border-t border-[var(--border)] pt-6">
          {settings.sponsorLinks.length > 0 && (
            <div className="mb-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
                Sponsor Link
              </p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                {settings.sponsorLinks.map((link, index) => (
                  <span key={`${link.url}-${index}`} className="flex items-center gap-3">
                    {index > 0 && <span aria-hidden="true" className="text-[var(--border)]">|</span>}
                    <a
                      href={link.url}
                      {...getExternalLinkProps(link.url)}
                      className="transition-colors hover:text-[var(--brand)]"
                    >
                      {link.label}
                    </a>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4">
            <Link href="/blog" prefetch={false} className="font-medium text-[var(--ink)] transition-colors hover:text-[var(--brand)]">
              บทความ
            </Link>
            <a href="/sitemap.xml" className="font-medium text-[var(--ink)] transition-colors hover:text-[var(--brand)]">
              Sitemap
            </a>
          </div>
        </div>

        <p className="mt-6">&copy; {new Date().getFullYear()} ดูแฮร์รี่พอตเตอร์. All rights reserved.</p>
      </div>
    </footer>
  );
}
