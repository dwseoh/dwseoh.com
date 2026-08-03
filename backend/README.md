# backend — stats worker

A small [Cloudflare Worker](https://workers.cloudflare.com) that stores per-post
**view** and **like** counts for the blog, plus a site-wide **unique visitor**
count, in a KV namespace. The frontend (`frontend/lib/stats.ts`) talks to it; if
it isn't configured, the site simply hides its counters.

## API

| Method | Path                              | Body / Query              | Returns                                  |
| ------ | --------------------------------- | ------------------------- | ---------------------------------------- |
| `GET`  | `/api/stats?slugs=a,b,c`          | —                         | `{ stats: { a: {views,likes}, ... } }`   |
| `POST` | `/api/view`                       | `{ slug }`                | `{ views }` (deduped per IP for 12h)     |
| `GET`  | `/api/like?slug=x&visitor=v`      | —                         | `{ likes, liked }`                       |
| `POST` | `/api/like`                       | `{ slug, visitor }`       | `{ likes, liked }` (toggles the like)    |
| `POST` | `/api/visit`                      | `{ visitor }`             | `{ ordinal, total }` (one per browser)   |
| `GET`  | `/api/visits`                     | —                         | `{ total }` (read-only)                  |

- **Views** are deduped by a salted hash of the caller's IP, so a refresh spree
  doesn't inflate the number. The client also guards once per session.
- **Likes** toggle against a per-visitor id (a UUID the browser keeps in
  `localStorage`), so the heart stays filled when a reader returns.
- **Visits** back the "342 people have visited this website." line in the site
  footer, and use that same per-browser UUID as identity — see below. The footer
  shows `total`; `ordinal` is returned too, but nothing renders it today.
- `slug` must match `^[a-z0-9-]{1,100}$`; `visitor` is 8–100 chars.

### Why visits are keyed by browser, not IP

Keying on IP looks tempting but collapses everyone behind a single NAT — café
wifi, campus networks, carrier CGNAT — into one visitor. So identity is the
browser's `localStorage` UUID instead. A browser keeps its ordinal **forever**:
come back next year and you're still the 42nd visitor.

The tradeoff is that clearing storage would let someone farm the number, so the
IP is kept purely as a **minting budget**: at most `VISIT_RATE_MAX` (20) *new*
ordinals per IP per hour. Over budget, the response hands back the current total
as a plausible `ordinal` with `throttled: true`, but persists nothing and doesn't
bump the counter. Returning visitors are never throttled — the budget is only
checked for browsers the worker has never seen.

Both constants live at the top of `src/index.ts`. Raise `VISIT_RATE_MAX` if you
ever demo the site to a room full of people on one network.

### KV keys

| Key                      | Meaning                                             |
| ------------------------ | --------------------------------------------------- |
| `views:<slug>`           | running view count for a post                       |
| `likes:<slug>`           | running like count for a post                       |
| `viewed:<iphash>:<slug>` | presence = this IP already counted (12h TTL)        |
| `like:<visitor>:<slug>`  | presence = this visitor currently likes the post    |
| `site:visits`            | running count of unique site visitors               |
| `visit:<visitor>`        | the ordinal this browser was assigned (no TTL)      |
| `visitrate:<iphash>:<h>` | new ordinals minted from this IP this hour (2h TTL) |

No migration is needed to add the visitor counter — `site:visits` is absent
until the first `POST /api/visit`, and a missing key reads as `0`.

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
