# WishSync

Gifting, together. A shared wishlist app for couples and friend groups — see what the people you love actually want, reserve gifts secretly, and never repeat a present.

Live at [wishsync.crig.dev](https://wishsync.crig.dev)

## Stack

- React 19 + TypeScript
- Vite
- Hosted on Netlify (auto-deploys from `main`)
- Backend API at [wishsync-api.crig.dev](https://wishsync-api.crig.dev) — see the `/backend` folder

## Features

- Email + password auth
- Wishlists with priorities, occasions, categories, and images
- Secret reservations — your partner sees their wish is available, your gifting circle sees it's taken
- Invite links to create couple / friend group circles
- Occasions calendar
- Purchase history

## Local development

```bash
cp .env.example .env.local
# set VITE_API_URL=http://localhost:3000

npm install
npm run dev
```

The backend needs to be running locally — see `../backend/README.md`.

## Deployment

Pushes to `main` trigger a GitHub Actions workflow that builds and deploys to Netlify.

Required GitHub secrets:

| Secret | Where to get it |
| ------ | --------------- |
| `NETLIFY_AUTH_TOKEN` | Netlify → User Settings → Personal access tokens |
| `NETLIFY_SITE_ID` | Netlify → Site → Site configuration → Site ID |
| `VITE_API_URL` | Your backend URL |
