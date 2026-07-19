import type { Metadata } from "next";
import Link from "next/link";
import { getAllCategories } from "@/lib/services/categories";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const metadata: Metadata = {
  title: "ตัวละคร แฮร์รี่ พอตเตอร์",
  description:
    "แนะนำตัวละครหลักในจักรวาลแฮร์รี่ พอตเตอร์ ทั้งสามสหายกริฟฟินดอร์ อาจารย์ฮอกวอตส์ และฝ่ายมืด พร้อมข้อมูลว่าภาพยนตร์แฮร์รี่ พอตเตอร์มีกี่ภาค",
  alternates: { canonical: "/characters" },
};
export const revalidate = 3600;

interface CharacterEntry {
  nameTh: string;
  nameEn: string;
  tag: string;
  bio: string;
}

interface CharacterGroup {
  heading: string;
  characters: CharacterEntry[];
}

const CHARACTER_GROUPS: CharacterGroup[] = [
  {
    heading: "สามสหายแห่งบ้านกริฟฟินดอร์",
    characters: [
      {
        nameTh: "แฮร์รี่ พอตเตอร์",
        nameEn: "Harry Potter",
        tag: "ตัวเอก",
        bio: "เด็กชายผู้รอดชีวิต มีแผลเป็นรูปสายฟ้าที่หน้าผาก และเป็นกุญแจสำคัญในการต่อกรกับลอร์ดโวลเดอมอร์",
      },
      {
        nameTh: "รอน วีสลีย์",
        nameEn: "Ron Weasley",
        tag: "เพื่อนสนิท",
        bio: "เพื่อนสนิทคนแรกของแฮร์รี่ มาจากครอบครัวพ่อมดเลือดแท้สายเลือดใหญ่ นิสัยซื่อสัตย์และอารมณ์ดี",
      },
      {
        nameTh: "เฮอร์ไมโอนี่ เกรนเจอร์",
        nameEn: "Hermione Granger",
        tag: "แม่มดที่ฉลาดที่สุดในรุ่น",
        bio: "เกิดจากครอบครัวมักเกิ้ล รอบรู้และคอยช่วยแก้ปัญหาให้เพื่อน ๆ อยู่เสมอ",
      },
    ],
  },
  {
    heading: "อาจารย์และบุคลากรฮอกวอตส์",
    characters: [
      {
        nameTh: "อัลบัส ดัมเบิลดอร์",
        nameEn: "Albus Dumbledore",
        tag: "อาจารย์ใหญ่",
        bio: "อาจารย์ใหญ่โรงเรียนฮอกวอตส์ พ่อมดผู้ทรงพลังและได้รับความเคารพที่สุดคนหนึ่งในยุคนั้น",
      },
      {
        nameTh: "เซเวอร์รัส สเนป",
        nameEn: "Severus Snape",
        tag: "อาจารย์วิชาปรุงยา",
        bio: "หัวหน้าบ้านสลิธีริน ชายผู้ลึกลับที่ดูเหมือนจะเกลียดแฮร์รี่อยู่ตลอดเวลา",
      },
      {
        nameTh: "มิเนอร์วา มักกอนนากัล",
        nameEn: "Minerva McGonagall",
        tag: "รองอาจารย์ใหญ่",
        bio: "หัวหน้าบ้านกริฟฟินดอร์ สอนวิชาแปลงร่าง เข้มงวดแต่ยุติธรรมกับนักเรียนทุกคน",
      },
      {
        nameTh: "รูเบอัส แฮกริด",
        nameEn: "Rubeus Hagrid",
        tag: "ผู้ดูแลสัตว์",
        bio: "ลูกครึ่งยักษ์ผู้ดูแลสัตว์ประจำฮอกวอตส์ และเป็นคนแรกที่พาแฮร์รี่เข้าสู่โลกเวทมนตร์",
      },
    ],
  },
  {
    heading: "ฝ่ายมืดและตัวร้ายหลัก",
    characters: [
      {
        nameTh: "ลอร์ดโวลเดอมอร์",
        nameEn: "Lord Voldemort",
        tag: "จ้าวแห่งศาสตร์มืด",
        bio: "หรือ \"คนที่คุณก็รู้ว่าใคร\" จ้าวแห่งศาสตร์มืดผู้ไร้ความปรานีที่ต้องการปกครองโลกเวทมนตร์",
      },
      {
        nameTh: "เดรโก มัลฟอย",
        nameEn: "Draco Malfoy",
        tag: "คู่ปรับตลอดกาล",
        bio: "นักเรียนบ้านสลิธีริน คู่ปรับของแฮร์รี่ในโรงเรียน มาจากตระกูลเลือดแท้ที่ร่ำรวยและหยิ่งยโส",
      },
      {
        nameTh: "ผู้เสพความตาย",
        nameEn: "Death Eaters",
        tag: "กลุ่มสาวก",
        bio: "กลุ่มพ่อมดแม่มดศาสตร์มืดที่เป็นสาวกผู้ซื่อสัตย์ของลอร์ดโวลเดอมอร์",
      },
    ],
  },
];

export default async function CharactersPage() {
  const categories = await getAllCategories();

  return (
    <div className="flex min-h-full flex-col">
      <Header categories={categories} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <h1 className="text-xl font-bold text-[var(--ink)]">ตัวละคร แฮร์รี่ พอตเตอร์</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--ink-muted)]">
          แนะนำตัวละครหลักในจักรวาลแฮร์รี่ พอตเตอร์ ทั้งสามสหายบ้านกริฟฟินดอร์ อาจารย์และบุคลากรฮอกวอตส์
          ไปจนถึงฝ่ายมืดและตัวร้ายหลักของเรื่อง
        </p>

        {CHARACTER_GROUPS.map((group) => (
          <section key={group.heading} className="mt-8">
            <h2 className="mb-3 border-l-4 border-[var(--brand)] pl-3 text-lg font-bold text-[var(--ink)]">
              {group.heading}
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.characters.map((character) => (
                <article
                  key={character.nameEn}
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
                >
                  <span className="inline-block rounded-full bg-[var(--surface-muted)] px-2.5 py-0.5 text-xs font-semibold text-[var(--brand)]">
                    {character.tag}
                  </span>
                  <h3 className="mt-2 text-base font-bold text-[var(--ink)]">
                    {character.nameTh} <span className="font-normal text-[var(--ink-muted)]">({character.nameEn})</span>
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--ink-muted)]">{character.bio}</p>
                </article>
              ))}
            </div>
          </section>
        ))}

        <section className="mt-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="text-lg font-bold text-[var(--ink)]">แฮร์รี่ พอตเตอร์ มีกี่ภาค?</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--ink-muted)]">
            แฟรนไชส์หลักแฮร์รี่ พอตเตอร์มีทั้งหมด 8 ภาค (สร้างจากหนังสือ 7 เล่ม) ตั้งแต่ภาค 1 ศิลาอาถรรพ์
            ไปจนถึงภาค 7.2 เครื่องรางยมทูต ตอนที่ 2 ดูรายชื่อครบทุกภาคได้ที่{" "}
            <Link
              href="/category/harry-potter"
              prefetch={false}
              className="text-[var(--brand)] underline underline-offset-2"
            >
              หมวดแฮร์รี่ พอตเตอร์ ทั้ง 8 ภาค
            </Link>
            . นอกจากนี้ยังมีภาคแยกในจักรวาลเวทมนตร์เดียวกันคือชุดสัตว์มหัศจรรย์ (Fantastic Beasts) อีก 3 ภาค ดูได้ที่{" "}
            <Link
              href="/category/fantastic-beasts"
              prefetch={false}
              className="text-[var(--brand)] underline underline-offset-2"
            >
              หมวดสัตว์มหัศจรรย์
            </Link>
            .
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
