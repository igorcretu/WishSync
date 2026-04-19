# WishSync

**Gifting, together.** A shared wishlist app for couples and friend groups — with secret reservations, occasion reminders, and smart autofill from any store.

Live at [wishsync.crig.dev](https://wishsync.crig.dev)

---

## What it does

WishSync lets you and the people you love share wishlists without spoiling surprises. Add items to your list, and your gifting circle can secretly reserve them so no one doubles up — the wish owner never sees who's got it covered.

- **Secret reservations** — reserve an item and the owner won't see it's taken
- **Autofill from any URL** — paste a link, get title, price, image, and store automatically
- **Occasion tracking** — birthdays, anniversaries, holidays, all in one place
- **Surprise mode** — randomly pick an unreserved item when you can't decide
- **Styled email notifications** — invite links, reservation confirmations, new wish alerts
- **Circles** — couple or friend group, invite via link or email

---

## Stack

| Layer | Tech |
| --- | --- |
| Frontend | React 19 + TypeScript + Vite |
| Backend | Express 4 + TypeScript + Prisma |
| Database | PostgreSQL 16 |
| Auth | JWT (30-day tokens) |
| Email | Nodemailer — Mailpit for dev, Gmail for prod |
| Scraping | Fetch → `__NEXT_DATA__` → Puppeteer (Chromium) |
| Hosting | Raspberry Pi 5 (ARM64) via Docker Compose |
| Frontend deploy | Netlify (auto-deploys from `main`) |

---

## Local development

```sh
# set your API URL
cp .env.example .env.local
# VITE_API_URL=http://localhost:3000

npm install
npm run dev
```

Open `http://localhost:5173`. The backend needs to be running — see `../backend/README.md`.

---

## Project structure

```
frontend/
├── public/
│   └── favicon.svg
└── src/
    ├── app.tsx          # routing, data loading, global state
    ├── views.tsx        # all page views and modals
    ├── components.tsx   # shared UI (WishCard, Avatar, Sidebar…)
    ├── api.ts           # typed fetch client for the backend
    ├── AuthContext.tsx  # JWT auth context + hooks
    ├── types.tsx        # shared TypeScript types
    ├── data.tsx         # static data, sample content, constants
    └── styles.css       # full design system
```

---

## Deployment

Pushes to `main` trigger a GitHub Actions workflow that builds and deploys to Netlify.

Required secrets:

| Secret | Where to get it |
| --- | --- |
| `NETLIFY_AUTH_TOKEN` | Netlify → User Settings → Personal access tokens |
| `NETLIFY_SITE_ID` | Netlify → Site → Site configuration → Site ID |
| `VITE_API_URL` | Your backend's public URL |

---

## Features in detail

### Autofill from a URL

Paste any product link and WishSync tries three layers of extraction:

1. **HTTP fetch** — pulls JSON-LD, `__NEXT_DATA__` (Zalando, IKEA, H&M, Zara, MediaMarkt), Open Graph, microdata, and heuristic price patterns
2. **Puppeteer fallback** — real Chromium for JS-heavy sites
3. **Amazon special case** — title from URL slug + image from ASIN (Amazon blocks all scrapers)

### Secret reservations

When a gifter reserves an item, the owner's view is unchanged — they still see it as available. Only other circle members see it's taken. Reservation data is never exposed to the wish owner through any API route.

### Occasions calendar

Add birthdays, anniversaries, and holidays linked to a circle. Sorted by days remaining. Email reminders are opt-in per user.
