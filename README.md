# Justin Bieber Hub

A fan webapp to browse Justin Bieber's YouTube videos, stream his music, and find every official account (Spotify, Apple Music, Instagram, TikTok, and more).

## Features

- **YouTube** — Watch videos in-app with a scrollable catalog. **JustinBieberVEVO** loads the full music video catalog (230+ videos) with Load more; switch to @justinbieber for live sets and exclusives.
- **Music** — Embedded Spotify player streams the full catalog. Add Spotify API credentials to browse albums, singles, and 30-second previews in-app.
- **Accounts** — One-click links to all major official profiles.

## Quick start

```bash
npm install
cp .env.example .env   # optional API keys
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The API runs on port 3001.

## API keys (optional)

| Variable | What it unlocks |
|----------|-----------------|
| `YOUTUBE_API_KEY` | Full YouTube uploads list + load more |
| `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` | Album grid, track lists, audio previews |

Without keys, the app still works: latest YouTube videos via RSS, Spotify embed for streaming, and all social links.

## Scripts

- `npm run dev` — API + frontend (concurrent)
- `npm run dev:web` — Vite only
- `npm run dev:server` — Express API only
- `npm run build` — Production frontend build
