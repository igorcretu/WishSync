# WishSync

**Gifting, together.**
A shared wishlist app for couples and friend groups — secret reservations, occasion reminders, and smart autofill from any store.

Live at [wishsync.crig.dev](https://wishsync.crig.dev)

---

## What it does

WishSync lets people share wishlists without spoiling surprises. You see what your partner or friends want. They never see what you've claimed.

```
You browse their list → reserve something secretly → buy it → mark as purchased → it moves to history.
They see their full list the whole time, none the wiser.
```

### Wishlist

- Add wishes with title, price, store, image, priority (must / would love / nice to have), occasion tag, and personal notes
- Paste any product URL and it autofills title, price, image, and currency automatically
- Supports Amazon, Next.js storefronts, JSON-LD structured data, and a fallback Chromium scraper
- Currency auto-detected per store (€ for amazon.de, £ for amazon.co.uk, etc.)
- Filter by category (21 types) and priority; search by keyword; sort by price
- Upload a custom image for any wish

### Gifting

- Reserve a wish secretly — the owner sees their full list unchanged; circle members see it's taken
- "Surprise mode" — one click randomly reserves an unclaimed item
- React to wishes (♥ / 👀 / 🎁) to signal interest without committing
- Mark a reserved wish as purchased — it moves to gift history
- History is split: gifts you've given vs. gifts you've received

### Circles

- Create couple circles or friend groups
- Invite by link (7-day expiry) or direct email
- View any circle member's wishlist
- Rename circles, remove members, leave or delete a circle

### Occasions

- Add occasions with date, title, and color
- Sorted by days away on the calendar view and dashboard
- Reminder emails at 14, 7, 3, and 1 day before — sent automatically at midnight

### Dashboard

- Partner's wishlist snapshot + unreserved count
- Budget reserved (total value of gifts you've claimed)
- Next upcoming occasion
- Live activity feed — recent reservations and purchases across your circles

### Profile

- Upload a profile photo (shown in avatar throughout the app)
- Change password, toggle notification preferences per email type
- Delete account with password confirmation (cascades all data)

### Emails

All beautifully styled HTML emails:

- Welcome on registration
- Circle invite with accept link
- Reservation confirmation to the buyer
- New wish added (opt-in, per circle)
- Reaction notification to wish owner (opt-in)
- Occasion reminders at 14 / 7 / 3 / 1 days before

---

## Stack

| Layer | Tech |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, plain CSS |
| Backend | Express 4, TypeScript, Prisma ORM |
| Database | PostgreSQL 16 |
| Auth | JWT (30-day tokens, stored in localStorage) |
| Email | Nodemailer — Mailpit in dev, any SMTP in prod |
| Images | Multer → local `uploads/` volume |
| Scraping | HTTP fetch → JSON-LD / `__NEXT_DATA__` / microdata → Puppeteer |
| Hosting | Frontend on Netlify; backend + DB on Raspberry Pi 5 via Docker Compose |

---

## Local development

### Prerequisites

- Node 20+
- Docker + Docker Compose (for the backend)
- A `.env` file in `backend/` (see below)

### Frontend

```bash
cd frontend
npm install
npm run dev        # → http://localhost:5173
```

Set `VITE_API_URL` in `frontend/.env` if your backend isn't on `localhost:3000`:

```env
VITE_API_URL=http://localhost:3000
```

### Backend

```bash
cd backend
cp .env.example .env   # fill in the values
docker compose up -d   # starts postgres + mailpit + api
```

The API auto-runs `prisma migrate deploy` on start. Mailpit web UI is at `http://localhost:8025` — all dev emails land there.

**Backend `.env` variables:**

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for signing tokens — any long random string |
| `FRONTEND_URL` | Full URL of the frontend (used in email links) |
| `APP_URL` | Public URL of the API |
| `SMTP_HOST` | SMTP server host (`mailpit` in dev) |
| `SMTP_PORT` | SMTP port (`1025` for Mailpit, `465` or `587` in prod) |
| `SMTP_USER` | SMTP username (blank for Mailpit) |
| `SMTP_PASS` | SMTP password (blank for Mailpit) |
| `SMTP_FROM` | From address, e.g. `WishSync <noreply@example.com>` |
| `POSTGRES_PASSWORD` | Postgres password (used by Docker Compose) |

---

## Project structure

```
wishsync/
├── frontend/
│   ├── src/
│   │   ├── app.tsx          # root component, all state + data fetching
│   │   ├── views.tsx        # every page view (Dashboard, MyList, PartnerList, …)
│   │   ├── components.tsx   # Avatar, WishCard, Sidebar, PageHeader, …
│   │   ├── api.ts           # typed fetch wrappers for every endpoint
│   │   ├── types.tsx        # shared TypeScript interfaces
│   │   ├── data.tsx         # static seed data (categories, priority labels, …)
│   │   ├── auth-views.tsx   # login + register screens
│   │   ├── AuthContext.tsx  # auth state + useAuth hook
│   │   └── icons.tsx        # SVG icon components
│   └── public/
│       └── favicon.svg
│
└── backend/
    ├── prisma/
    │   └── schema.prisma    # database schema
    ├── src/
    │   ├── index.ts         # Express server + scheduler startup
    │   ├── config.ts        # env variable validation
    │   ├── db.ts            # Prisma client singleton
    │   ├── lib/
    │   │   ├── email.ts     # all email templates + senders
    │   │   ├── scraper.ts   # multi-layer product scraper
    │   │   └── scheduler.ts # occasion reminder cron (runs at midnight)
    │   ├── middleware/
    │   │   └── auth.ts      # JWT middleware + signToken
    │   └── routes/
    │       ├── auth.ts      # /api/auth — register, login, me, avatar, delete
    │       ├── wishes.ts    # /api/wishes — CRUD, scrape, reserve, react, activity
    │       ├── circles.ts   # /api/circles — create, invite, rename, members
    │       ├── occasions.ts # /api/occasions — CRUD
    │       ├── invites.ts   # /api/invites — preview + accept
    │       └── history.ts   # /api/history + /api/wishes/:id/purchase
    └── docker-compose.yml
```

---

## How autofill works

When you paste a URL into "Add a wish":

1. **Amazon** — extracts title from the URL slug (Amazon blocks all scrapers). Currency is inferred from the TLD (`amazon.de → €`, `amazon.co.uk → £`, etc.).
2. **HTTP scrape** — fetches the page and parses: Open Graph tags, JSON-LD `Product` schema (title, price, priceCurrency), `__NEXT_DATA__` from Next.js storefronts, microdata, and a heuristic price scan.
3. **Browser scrape** — falls back to a real Chromium instance via Puppeteer for JavaScript-rendered and bot-protected pages.

Currency is resolved in priority order: JSON-LD `priceCurrency` → meta tag ISO code → heuristic symbol scan → Amazon TLD map → default `$`.

---

## How occasion reminders work

The scheduler runs at **00:05 every night**. It loads all occasions from the database, calculates how many days until each one (accounting for year rollover), and sends a styled reminder email to every circle member who has "Birthdays approaching" notifications enabled — at 14, 7, 3, and 1 day before.

---

## How secret reservations work

When you reserve a wish:

- A `Reservation` row is created linking your user ID to the wish.
- When the **owner** fetches their own wishes, reservations are hidden entirely — the wish appears normal.
- When **other circle members** fetch the wish, they see it's reserved (but not by whom, unless they're the reserver).
- The reservation is visible in the activity feed to other members.

This is enforced server-side in the `GET /api/circles/:id/members/:memberId/wishes` route.
