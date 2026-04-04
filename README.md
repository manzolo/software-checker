# Software Checker

Track software releases and get notified when new versions are available.

![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js)
![Vue](https://img.shields.io/badge/Vue-3-4FC08D?logo=vue.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)

## Features

- **Multi-source tracking** — GitHub releases, HTML scraping with CSS selectors, RSS/Atom feeds
- **Smart notifications** — notified only when a version actually changes; first discovery is silent
- **Acknowledge flow** — confirm single or all updates; notification badge disappears, history stays
- **Manual version control** — edit the known version directly to re-trigger alerts (useful for testing)
- **Notification channels** — in-app (real-time via SSE), Telegram Bot, Web Push (browser)
- **Scheduled checks** — per-software interval: hourly, daily, or weekly
- **On-demand checks** — force a check for one or all software from the dashboard

## Architecture

```
Browser
  └── nginx :80
        ├── /          → Vue 3 SPA (Tailwind CSS)
        └── /api/*     → Express backend :3000
                            ├── PostgreSQL (pg)
                            ├── node-cron scheduler
                            ├── GitHub API / Cheerio / rss-parser
                            └── Notifiers: SSE · Telegram · Web Push
```

## Quick Start

### Prerequisites

- Docker + Docker Compose v2
- Git

### Run

```bash
git clone https://github.com/manzolo/software-checker.git
cd software-checker

cp .env.example .env
# Edit .env — at minimum set DB_PASSWORD

./manager.sh up
```

Open **http://localhost** in your browser.

### manager.sh

```bash
./manager.sh up                   # Build and start all containers
./manager.sh down                 # Stop and remove containers
./manager.sh restart [service]    # Recreate one or all containers
./manager.sh build [service]      # Rebuild images
./manager.sh logs [service]       # Follow logs (all or one service)
./manager.sh shell <service>      # Open a shell inside a container
./manager.sh status               # Show container status
```

Services: `backend`, `frontend`, `db`

## Configuration

Copy `.env.example` to `.env` and configure:

| Variable | Required | Description |
|---|---|---|
| `DB_PASSWORD` | ✅ | PostgreSQL password |
| `GITHUB_TOKEN` | optional | Raises GitHub API rate limit from 60 to 5000 req/hour |
| `TELEGRAM_BOT_TOKEN` | optional | Telegram bot token (from @BotFather) |
| `TELEGRAM_CHAT_ID` | optional | Telegram chat or group ID |
| `VAPID_PUBLIC_KEY` | optional | Auto-generated on first run if empty |
| `VAPID_PRIVATE_KEY` | optional | Auto-generated on first run if empty |
| `VAPID_SUBJECT` | optional | mailto address for Web Push |

Telegram and Web Push can also be configured from the **Settings** page in the UI.

## Adding Software

| Type | URL example | Extra field |
|---|---|---|
| `github` | `https://github.com/nodejs/node` | — |
| `rss` | `https://github.com/nodejs/node/releases.atom` | — |
| `scrape` | any webpage | CSS selector pointing to the version text |

## Notification Logic

```
Check runs
  ├── version == last_version  →  nothing (already acknowledged)
  ├── last_version == null     →  silent first discovery (badge only)
  └── version != last_version  →  notify (in-app + Telegram + Web Push)
                                   dashboard badge lights up

User clicks Acknowledge
  └── last_version = latest_found  →  badge off, history kept
```

## Setting Up Telegram

1. Create a bot via [@BotFather](https://t.me/BotFather) and copy the token
2. Get your Chat ID (send a message to your bot, then visit `https://api.telegram.org/bot<TOKEN>/getUpdates`)
3. Enter both in **Settings → Telegram** and click **Test Telegram**

## Setting Up Web Push

1. Open **Settings → Web Push**
2. Click **"Iscriviti alle notifiche browser"** — your browser will ask for permission
3. Enable the toggle and save
4. Click **Test Web Push** to verify

VAPID keys are auto-generated on first run and stored in the database.

## Docker Images

Pre-built images are available on Docker Hub:

```yaml
services:
  backend:
    image: manzolo/software-checker-backend:latest
  frontend:
    image: manzolo/software-checker-frontend:latest
  db:
    image: postgres:16-alpine
```

## Development

```bash
# Backend (hot reload)
cd backend && npm install && node --watch src/index.js

# Frontend (Vite dev server with proxy)
cd frontend && npm install && npm run dev
```

The Vite dev server proxies `/api` to `http://localhost:3000`.

## API Reference

| Method | Path | Description |
|---|---|---|
| GET | `/api/software` | List all tracked software |
| POST | `/api/software` | Add software |
| PUT | `/api/software/:id` | Update (including `last_version`) |
| DELETE | `/api/software/:id` | Remove |
| POST | `/api/software/:id/check` | Force check now |
| POST | `/api/software/:id/acknowledge` | Confirm version |
| POST | `/api/software/check-all` | Force check all |
| POST | `/api/software/acknowledge-all` | Confirm all |
| GET | `/api/notifications/stream` | SSE stream |
| GET | `/api/notifications` | List notifications |
| PUT | `/api/notifications/read-all` | Mark all read |
| GET | `/api/settings` | Get settings |
| PUT | `/api/settings` | Update settings |
| POST | `/api/settings/test-telegram` | Send test message |
| POST | `/api/settings/test-webpush` | Send test push |
| GET | `/api/push/vapid-public-key` | VAPID public key |
| POST | `/api/push/subscribe` | Register push subscription |

## License

MIT
