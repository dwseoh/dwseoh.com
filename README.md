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
