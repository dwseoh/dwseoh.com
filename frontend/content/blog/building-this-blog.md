---
title: How this blog is put together
date: 2026-07-01
summary: A zero-dependency Markdown blog bolted onto a Next.js site, with view counts and likes running on a tiny Cloudflare Worker.
tags: [engineering, meta, nextjs]
lang: en
thumbnail: /images/photos/delta-hacks.jpg
---

The site you're on is a small Next.js app with a deliberately short
dependency list — `next`, `next-intl`, `react`. I wanted the blog to keep that
spirit: no CMS, no headless anything, no Markdown library. Just files.

## The content model

Every post is a Markdown file in `content/blog/`, with a little frontmatter on
top:

```yaml
---
title: How this blog is put together
date: 2026-07-01
tags: [engineering, meta]
---
```

A ~40-line parser reads the frontmatter, and a small hand-rolled renderer turns
the body into React — headings, lists, quotes, code, links, and the callout
boxes this site already had. No `remark`, no `mdx`. It's not spec-complete
Markdown, but it covers everything a newsletter actually needs.

> [!TIP]
> The renderer reuses the existing `Callout` component. Write a GitHub-style
> `> [!NOTE]` blockquote and it renders as one of these boxes — same look as the
> rest of the site.

## Views and likes

These two counters are the only part that can't be static. They live on a
[Cloudflare Worker](https://workers.cloudflare.com) backed by a KV namespace:

1. When a page loads, the client pings `POST /view` **once per session**.
2. The worker dedupes by a hashed IP so a refresh spree doesn't inflate the number.
3. Likes toggle against a per-visitor id, so the heart stays filled when you come back.

If the API URL isn't configured, the counters simply don't render — the post
reads exactly the same without them. Progressive enhancement, the boring and
correct kind.

## Things I deliberately skipped

- **Comments.** Email is a better filter than a comment box.
- **An RSS-vs-newsletter debate.** Both, eventually. Neither, today.
- **Reading-progress bars.** The posts are short enough to not need one.

That's the whole thing. If you want the gory details, the source is on
[GitHub](https://github.com/dwseoh) — and yes, this very post is the test
fixture I used to make sure the renderer didn't choke on nested `**bold _and
italic_**` text.
