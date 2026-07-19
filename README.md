# ดูแฮร์รี่พอตเตอร์

Thai-language **information** site for the Harry Potter film franchise — titles, posters,
synopses, ratings, and genre tags sourced from [TMDB](https://www.themoviedb.org/). This is a
catalog/database site: **there is no video player and no streaming of any kind.** Not affiliated
with or endorsed by Warner Bros. or the Harry Potter rights holders.

Domain: `xn--l3cca8ayaad1fcd3f0b7fg3itck.online` (Thai IDN — decodes to "ดูแฮร์รี่พอตเตอร์.online").

Forked from the `tmdb-catalog-site` architecture (see
`/Users/thongpotter/Documents/Me/templates เว็บหนัง/` and
`~/.claude/skills/tmdb-catalog-site/` for the general build recipe this follows).

## Tech stack

- [Next.js 15](https://nextjs.org) (App Router, Server Components, Server Actions)
- [Prisma](https://www.prisma.io) + PostgreSQL
- Tailwind CSS
- [TMDB API](https://developer.themoviedb.org/docs/getting-started) — Harry Potter Collection
  (id 1241) and Fantastic Beasts Collection (id 435259)
- [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) for admin-uploaded images

## What's in the site

### Public site

- **Home** — hero + one section per category
- **Category pages** (`/category/[slug]`) — "แฮร์รี่ พอตเตอร์ ทั้ง 8 ภาค" and
  "สัตว์มหัศจรรย์ (Fantastic Beasts)"
- **Title pages** (`/title/[slug]`) — synopsis, rating, genre tags, cast studio, and a
  "เรื่องที่เกี่ยวข้อง" section cross-linking every film in the same saga
- **Tag pages** (`/tag/[tag]`), `/latest`, `/search`
- **`/characters`** — static page introducing the main characters (Harry, Ron, Hermione,
  Dumbledore, Snape, McGonagall, Hagrid, Voldemort, Draco Malfoy, Death Eaters)

### Admin CMS (`/admin`, session-cookie auth)

- Articles (films): create/edit/delete, cover image upload, SEO title/description, tags,
  related-slugs, "featured" flag — search + 50-per-page pagination per
  `templates เว็บหนัง/ADMIN_CONTENT_LIST.md`
- Categories, Authors, Redirects (301), site-wide settings

### Data pipeline (`prisma/seed.ts` + `src/lib/tmdb.ts`)

Unlike the general-movie/anime sites this scaffold is based on, this catalog is a small, fixed
set (11 films total) — no discover pagination or popularity ranking, just the full TMDB
`collection` filmography for both collections, force-included every re-seed. Each film has an
explicit ภาค label (`EPISODE_LABEL_BY_TMDB_ID` in `prisma/seed.ts`) since TMDB's collection
`parts` order isn't chronological.

`scripts/dump-static-catalog.ts` regenerates `src/lib/static-catalog.json`, the build-time
fallback content used when the database is unreachable at build time (see
`references/deployment-and-resilience.md` in the skill). Re-run it after any re-seed:

```bash
npx tsx scripts/dump-static-catalog.ts
```

## Environment variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Notes |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Admin login |
| `SESSION_SECRET` | Random string, signs the admin session cookie |
| `NEXT_PUBLIC_SITE_URL` | This site's own public URL |
| `TMDB_API_KEY` | TMDB v3 API key |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token, for admin cover-image uploads (set once on Vercel) |

## Getting started

```bash
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Admin panel: `http://localhost:3000/admin/login`

## Before deploying

1. Provision a production Postgres (e.g. Neon on the Vercel Marketplace) — required before
   `/admin` will work on the deployed site, per the template's mandatory production DB rule.
2. Set every env var above on Vercel (Production scope).
3. `npx prisma migrate deploy` and `npx prisma db seed` against the production database.
4. Point the domain (`xn--l3cca8ayaad1fcd3f0b7fg3itck.online`) at the Vercel project.
