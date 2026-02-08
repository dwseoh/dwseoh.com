# Portfolio Website Build Prompt

## Overview

Build a minimalistic, modern, and visually appealing personal portfolio website for **Jamie Seoh (서동완)** — a full-stack developer and Software Engineering student at the University of Waterloo. The site should feel clean and intentional, using a **minimal color scheme** (near-monochrome with one subtle accent). No emojis anywhere — use **Lucide icons** exclusively.

---

## Tech Stack

- **Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui (already installed — use preimported components from the project's `components/ui` directory)
- **Backend:** FastAPI (Python) for view count tracking and other analytics/statistics
- **Database:** Supabase (Postgres) — connected from the FastAPI backend
- **Fonts:** `Inter` (Latin text) and `Gowun Dodum` (Korean text) — imported via Google Fonts, same as the original site
- **Icons:** `lucide-react` only — no emojis

---

## Design Principles

- **Minimalist but not boring** — intentional whitespace, subtle hover animations, clean typography hierarchy
- **Near-monochrome color scheme** — e.g. off-white/light gray background (`#fafafa` or similar), near-black text (`#111`), one muted accent color (e.g. a soft blue `#3b82f6` or muted slate) for links/interactive elements. Keep it restrained.
- **Responsive** — mobile-first, looks great on all breakpoints
- **Smooth transitions** — subtle fade-ins, hover states on links/cards, nothing flashy
- **Good typography** — use `Inter` as the primary font. When the language is set to Korean (`ko`), apply `Gowun Dodum` as the font family. Proper hierarchy with font sizes and weights.
- **shadcn/ui components** — use `Button`, `Separator`, `Badge`, `Card`, etc. from the existing shadcn setup. Don't reinvent UI primitives.

---

## Site Structure & Pages

### Global Layout

**Top Navigation Bar (sticky):**
- Left: Site name/logo — "Jamie Seoh" (clickable, links to `/`)
- Right (in order): `Blog` | `Projects` | `Resume` (external link to `https://dwseoh.com/assets/static/resume.pdf`, opens in new tab) | Language Toggle (EN/한국어 dropdown, same logic as original — persists choice in localStorage)
- Nav should be clean, no background color or very subtle border-bottom. Use Lucide icons where appropriate (e.g. `ExternalLink` icon next to Resume).
- On mobile: collapse into a hamburger menu using shadcn `Sheet` or similar.

**Footer (all pages):**
- Social icons row using Lucide icons (or simple SVG icons for platforms Lucide doesn't cover):
  - [LinkedIn](https://www.linkedin.com/in/jamie-seoh) 
  - [GitHub](https://github.com/dwseoh) 
  - [Instagram](https://www.instagram.com/dongwan_seoh/) 
  - [Discord](https://discord.com/users/891434702509060106) 
  - [Email](mailto:contact@dwseoh.com) — use `Mail` icon
- Below icons: `© 2025 Jamie Seoh. All rights reserved.`
- Subtle separator above footer. Muted text color for the copyright line.

---

### Page: Home (`/`)

Reorganize the content from the original HTML into a well-structured, modern landing page. Suggested layout:

**Hero Section:**
- Large heading: "Hi, I'm Jamie" (EN) / "안녕하세요, 서동완입니다" (KO)
- Subtext: A concise one-liner — "Full-stack developer studying Software Engineering at the University of Waterloo." (EN) / equivalent Korean text from original
- Optional: subtle animated element (e.g. a blinking cursor after the name, or a gentle fade-in on load)

**About Section:**
- Brief bio pulled from the original content. Keep it to 2-3 short paragraphs max.
- English version: Mention full-stack dev, UW Software Engineering, moved to Canada in 2019, passion for music (principal clarinetist, conductor, producer, ensemble director), community involvement (Ignition Hacks, UW Korean Student Association).
- Korean version: Use the Korean content from the original HTML.
- This section should feel conversational, not like a resume dump.

**Quick Links Section:**
- Styled as a row/grid of minimal cards or a clean list:
  - GitHub — "Check out my projects" — Lucide `Github` icon
  - LinkedIn — "Connect with me" — Lucide `Linkedin` icon  
  - @dwclarinet (Instagram) — "Music projects" — Lucide `Music` icon
  - @jam_flicks (Instagram) — "Photography" — Lucide `Camera` icon
- Each card/item: icon + label + short description. Hover effect (subtle lift or underline).

**SE Webring Badge:**
- Keep the SE Webring link (`https://se-webring.xyz/`) at the bottom of the home page, styled subtly — e.g. a small badge or inline link with the original SVG icon and text "Software Engineering Student at University of Waterloo" / Korean equivalent.

**View Counter:**
- Small, subtle "X views" counter somewhere on the home page (e.g. bottom of hero or footer area). This hits the FastAPI backend endpoint.

---

### Page: Blog (`/blog`)

**Skeleton/backbone only — Jamie will design the full layout later.**

- Page heading: "Blog" / "블로그"
- Empty state message: "Posts coming soon." / "게시글이 곧 올라옵니다."
- Basic structure for a blog list page: prepare a `BlogPostCard` component (title, date, short excerpt, tags as `Badge` components) even if there are no posts yet.
- Leave a placeholder for future CMS/MDX integration.

---

### Page: Projects (`/projects`)

**Skeleton/backbone only.**

- Page heading: "Projects" / "프로젝트"
- Empty state message: "Projects coming soon." / "프로젝트가 곧 공개됩니다."
- Prepare a `ProjectCard` component (title, description, tech stack badges, GitHub link, live demo link) as a reusable component.
- Include a mention/link to the legacy music projects site: `https://projects.dwseoh.com` with a note that it's no longer maintained.

---

## Internationalization (i18n)

- Implement a simple client-side language toggle (EN / KO), same approach as the original:
  - Store preference in `localStorage`
  - Use a React context or simple state to switch between language content
  - All user-facing text should have EN and KO versions
  - When Korean is active, apply `font-family: 'Gowun Dodum', 'Inter', sans-serif` to the body/content
- You don't need a full i18n library — a simple dictionary/object approach is fine. Create a `lib/i18n.ts` or `dictionaries/en.ts` + `dictionaries/ko.ts` pattern.

---

## FastAPI Backend

### Purpose
- Track page view counts
- Serve as a lightweight stats/analytics API
- Future extensibility for blog post metadata, contact form, etc.

### Endpoints

```
GET  /api/views/{page}        → Returns { page: string, count: number }
POST /api/views/{page}        → Increments view count, returns updated count
GET  /api/stats                → Returns aggregate stats (total views, etc.)
GET  /api/health               → Health check
```

### Implementation Details

- Use **Supabase** as the database (Postgres)
- Create a `page_views` table:
  ```sql
  CREATE TABLE page_views (
    id SERIAL PRIMARY KEY,
    page VARCHAR(255) NOT NULL UNIQUE,
    count INTEGER DEFAULT 0,
    last_viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```
- Use `supabase-py` client library to interact with the database
- Add CORS middleware allowing the Next.js frontend origin
- **Environment variables** (create `.env.example`):
  ```
  SUPABASE_URL=your_supabase_url_here
  SUPABASE_KEY=your_supabase_anon_or_service_key_here
  FRONTEND_URL=http://localhost:3000
  ```
- **Do NOT hardcode any secrets.** Use `.env` loading via `python-dotenv` or Pydantic settings.
- Include a `requirements.txt` with: `fastapi`, `uvicorn`, `supabase`, `python-dotenv`, `pydantic-settings`

### Frontend Integration

- On the home page, call `POST /api/views/home` on mount (once per session — use sessionStorage to deduplicate)
- Display the count from `GET /api/views/home` on the page
- Use a simple `fetch` call or a small API utility in `lib/api.ts`

---

## Project Structure

```
/
├── frontend/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with nav + footer + font + i18n provider
│   │   ├── page.tsx            # Home page
│   │   ├── blog/
│   │   │   └── page.tsx        # Blog listing (skeleton)
│   │   ├── projects/
│   │   │   └── page.tsx        # Projects listing (skeleton)
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                 # shadcn components (pre-existing)
│   │   ├── navbar.tsx
│   │   ├── footer.tsx
│   │   ├── hero.tsx
│   │   ├── about.tsx
│   │   ├── quick-links.tsx
│   │   ├── view-counter.tsx
│   │   ├── language-toggle.tsx
│   │   ├── blog-post-card.tsx
│   │   └── project-card.tsx
│   ├── lib/
│   │   ├── i18n.ts             # Language context + dictionaries
│   │   └── api.ts              # API utility for FastAPI calls
│   ├── dictionaries/
│   │   ├── en.ts
│   │   └── ko.ts
│   └── public/
│       └── images/             # Favicon, SE webring SVG, flag icons, etc.
│
├── backend/
│   ├── main.py                 # FastAPI app entry point
│   ├── routes/
│   │   └── views.py            # View count endpoints
│   ├── db.py                   # Supabase client setup
│   ├── models.py               # Pydantic models
│   ├── .env.example
│   └── requirements.txt
│
└── README.md
```

---

## Key Implementation Notes

1. **Code everything fully** — all components, pages, API routes, database schema, config files. The only thing left blank should be the actual Supabase credentials in `.env` (documented in `.env.example`).
2. **Use the existing shadcn/ui components** — don't create custom buttons, cards, separators, etc. when shadcn already provides them. Check the `components/ui` directory first.
3. **No emojis.** Use Lucide React icons for all iconography.
4. **Minimal color usage.** Stick to grayscale + one accent. The site should feel like a well-designed developer portfolio, not a colorful marketing page.
5. **Smooth, subtle animations** — use Tailwind's `transition` utilities or `framer-motion` if needed for page transitions, but keep it minimal.
6. **Accessibility** — proper semantic HTML, aria labels on icon-only buttons, keyboard navigation support.
7. **The language toggle** must work exactly like the original — dropdown with flag icons, persisted in localStorage, smooth content swap.
8. **All Korean translations** should use the content from the original HTML as the source of truth. For new UI elements (nav items, empty states, etc.), provide natural Korean translations.

---

## Content Reference

All biographical content, links, and social URLs are sourced from the original HTML provided. Here they are consolidated:

**Links:**
- LinkedIn: https://www.linkedin.com/in/jamie-seoh
- GitHub: https://github.com/dwseoh
- Resume: https://dwseoh.com/assets/static/resume.pdf
- Music Instagram: https://instagram.com/dwclarinet
- Photography Instagram: https://instagram.com/jam_flicks
- Discord: https://discord.com/users/891434702509060106
- Personal Instagram: https://www.instagram.com/dongwan_seoh/
- Email: contact@dwseoh.com
- Legacy Music Projects: https://projects.dwseoh.com
- SE Webring: https://se-webring.xyz/

**Bio (EN):** Full-stack developer studying Software Engineering at the University of Waterloo. Native Korean speaker, moved to Canada in fall 2019. Passionate about music — principal clarinetist, conductor, music producer, ensemble director. Community involvement: Ignition Hacks, UW Korean Student Association.

**Bio (KO):** Use the Korean text from the original HTML verbatim.
