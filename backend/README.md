# backend — blog stats worker

A small [Cloudflare Worker](https://workers.cloudflare.com) that stores per-post
**view** and **like** counts for the blog in a KV namespace. The frontend
(`frontend/lib/stats.ts`) talks to it; if it isn't configured, the blog simply
hides its counters.

## API

| Method | Path                              | Body / Query              | Returns                                  |
| ------ | --------------------------------- | ------------------------- | ---------------------------------------- |
| `GET`  | `/api/stats?slugs=a,b,c`          | —                         | `{ stats: { a: {views,likes}, ... } }`   |
| `POST` | `/api/view`                       | `{ slug }`                | `{ views }` (deduped per IP for 12h)     |
| `GET`  | `/api/like?slug=x&visitor=v`      | —                         | `{ likes, liked }`                       |
| `POST` | `/api/like`                       | `{ slug, visitor }`       | `{ likes, liked }` (toggles the like)    |

- **Views** are deduped by a salted hash of the caller's IP, so a refresh spree
  doesn't inflate the number. The client also guards once per session.
- **Likes** toggle against a per-visitor id (a UUID the browser keeps in
  `localStorage`), so the heart stays filled when a reader returns.
- `slug` must match `^[a-z0-9-]{1,100}$`.

## Setup

```bash
cd backend
npm install

# 1. Create the KV namespace (prod + preview) and copy the ids into wrangler.toml
npx wrangler kv namespace create STATS
npx wrangler kv namespace create STATS --preview

# 2. Set the IP-hash salt (any random string)
npx wrangler secret put SALT

# 3. Run locally / deploy
npm run dev        # http://localhost:8787
npm run deploy     # -> https://dwseoh-blog-stats.<your-subdomain>.workers.dev
```

Edit `ALLOWED_ORIGINS` in `wrangler.toml` to your production domain(s).

## Wiring it to the frontend

Point the frontend at the deployed Worker with an env var (Vercel → Project →
Settings → Environment Variables, or `frontend/.env.local` for dev):

```bash
NEXT_PUBLIC_STATS_API=https://dwseoh-blog-stats.<your-subdomain>.workers.dev
```

That's the only wiring needed. Leave it unset and the counters disappear; the
blog works exactly the same without a backend.

## Notes / trade-offs

- Counters are read-modify-write on KV, which is eventually consistent and not
  strictly atomic. That's fine for a personal blog. For exact counts under real
  concurrency, move the counters to a **Durable Object** (one per slug) and keep
  KV only for the dedupe/like-membership keys.
- No auth: these are public vanity counters. The slug allowlist, per-IP view
  dedupe, and origin allowlist are the only abuse controls.
