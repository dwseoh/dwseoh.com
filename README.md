# dwseoh.com

![GitHub repo size](https://img.shields.io/github/repo-size/dwseoh/dwseoh.com)
![GitHub top language](https://img.shields.io/github/languages/top/dwseoh/dwseoh.com)
![GitHub last commit](https://img.shields.io/github/last-commit/dwseoh/dwseoh.com?color=red)

Personal site: a single-page portfolio in English and Korean, plus a blog at `/blog`.

- `frontend/`: Next.js app deployed on Vercel.
- `backend/`: Cloudflare Worker behind the view, like, and visitor counters


# Do it yourself!

## Running locally

```bash
cd frontend
npm install
npm run dev      # http://localhost:3000
```

`npm run build` for a production build. The backend is optional; see Counters.

## Editing content

Copy, links, and media paths live in `frontend/messages/en.json`, with `ko.json`
as its Korean mirror. Changing text, portfolio links, hobby cards, photos, or
webrings needs no code changes.

English is served at `/` and Korean at `/ko` (next-intl, `localePrefix:
'as-needed'`). The blog sits outside the `[locale]` segment and is English-only.

## Blog

Posts are Markdown files in `frontend/content/blog/<slug>.md`:

```markdown
---
title: How this blog is put together
date: 2026-07-01
summary: One line that doubles as the subtitle and share-card description.
tags: [engineering, meta]
category: Engineering                        # optional; falls back to first tag
thumbnail: /images/photos/delta-hacks.jpg    # optional card + cover image
lang: en
---
```

** Prefix a filename with `_` to keep it a draft.

`frontend/lib/markdown.tsx` renders the body with no Markdown dependency:
headings, lists, quotes, code, links, images, pipe tables, and GitHub-style
`> [!NOTE]` callouts.

The blog shares the site's palette but reads as its own publication: serif type,
a narrower column, client-side search, a light/dark toggle scoped to `/blog`, a
reading-progress bar, pagination, and prev/next links. Subscribe links point at
[Substack](https://substack.com/@dwseoh).

## Counters

Blog views, likes, and the "N people have visited this website" line in the
footer come from the Worker in `backend/`. Point the frontend at it:

```bash
# frontend/.env.local, or a Vercel environment variable
NEXT_PUBLIC_STATS_API=https://dwseoh-blog-stats.<subdomain>.workers.dev
```
Backend must also be deployed through wrangler; it is a cloudflare edge function. Read more in backend/README.md

But even if you leave it unset and the counters don't render; everything else works the same.
