# dwseoh.com

Personal portfolio website (Notion-style single page) with a bilingual (English/Korean) layout, an auto-scrolling photo strip, hobby cards, and a webring switcher.

> [!NOTE]
> This is a placeholder build ahead of a full redesign (Summer 2026). It's a
> Next.js migration of the old static HTML site.

## Run it locally

```bash
cd frontend
npm install
npm run dev        # http://localhost:3000
```

`npm run build` for a production build.

## Editing content

All text, links, and media references live in **`frontend/messages/en.json`**
(`ko.json` is a duplicate for the Korean translation). No code changes needed
to update copy, portfolio links, hobby channels, photos, or webrings.

## Theming

Colors and the content width are CSS variables at the top of
`frontend/app/globals.css` (`--n-bg`, `--n-text`, `--n-accent`, `--n-width`, …).
Change them in one place to restyle the whole site.

## Fonts

- **Inter** — English content
- **Gowun Dodum** — Korean content

## Blog

A Notion-style blog lives at **`/blog`**. Posts are Markdown files in
**`frontend/content/blog/<slug>.md`** with a small frontmatter block:

```markdown
---
title: How this blog is put together
date: 2026-07-01
summary: One-line description — doubles as the article subtitle + share cards.
tags: [engineering, meta]
category: Engineering   # optional kicker above the title (falls back to first tag)
lang: en                # en | ko — posts are single-language
---
```

The body is rendered by a dependency-free Markdown renderer
(`frontend/lib/markdown.tsx`) that supports headings, lists, quotes, code,
links, images, pipe tables, and GitHub-style `> [!NOTE]` callouts (reusing the
site's `Callout`). Prefix a filename with `_` to keep it as a draft.

The blog is its own **standalone publication**: an editorial serif + sans reading
experience with a sticky nav (search + language + theme), a reading-progress
bar, Medium-style byline, prev/next articles, and a newsletter footer. It has a
scoped **light/dark theme** (persisted in `localStorage`, no-flash) that only
affects the blog surface — the portfolio stays light. **Subscribe** and the
newsletter form hand off to Substack; repoint them via `SUBSTACK_URL` in
`frontend/app/[locale]/blog/layout.tsx`.

**View counts + likes** are served by a Cloudflare Worker in **`backend/`**
(see its README). Point the frontend at it with an env var:

```bash
# frontend/.env.local  (or Vercel env)
NEXT_PUBLIC_STATS_API=https://dwseoh-blog-stats.<subdomain>.workers.dev
```

Leave it unset and the counters simply don't render — the blog still works.
