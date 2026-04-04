# Software Checker — Guida per Claude

## Panoramica

Applicazione web per tracciare le release di software. L'utente aggiunge software con URL (GitHub, RSS, HTML scraping), l'app controlla periodicamente le nuove versioni e notifica via Telegram, Web Push e notifiche in-app.

## Stack

| Layer | Tecnologia |
|---|---|
| Backend | Node.js 24 + Express |
| Database | PostgreSQL 16 |
| Frontend | Vue 3 + Pinia + Tailwind CSS |
| Scheduling | node-cron |
| Deploy | Docker + docker-compose |

## Struttura

```
backend/src/
  config/        database.js, webpush.js
  db/            migrate.js, migrations/
  models/        software.js, notification.js, pushSubscription.js, settings.js
  routes/        software.js, notifications.js, push.js, settings.js
  services/
    checker/     index.js, github.js, scraper.js, rss.js
    notifier/    index.js, inapp.js, telegram.js, webpush.js
    scheduler.js
  sse/           manager.js
frontend/src/
  stores/        software.js, notifications.js, settings.js
  views/         DashboardView, SoftwareFormView, NotificationsView, SettingsView
  composables/   useSSE.js, useWebPush.js
```

## Logica Notifiche

- `last_version` = versione confermata dall'utente
- `latest_found` = ultima versione rilevata dal checker
- Notifica parte **solo** quando `latest_found != last_version` e `last_version != null`
- Prima scoperta (`last_version = null`) è silenziosa: popola `latest_found`, il badge dashboard si accende ma non arriva notifica
- L'utente fa acknowledge → `last_version = latest_found` → badge spento, storico conservato
- `last_version` è modificabile manualmente dal form (per testare o correggere)

## Sviluppo Locale

```bash
cp .env.example .env      # imposta almeno DB_PASSWORD
./manager.sh up           # build + avvio (porta 80)
./manager.sh logs backend # segui i log
./manager.sh shell backend # shell nel container
```

## Release

Usare il comando `/bump`:

```
/bump patch   # 0.1.0 → 0.1.1
/bump minor   # 0.1.0 → 0.2.0
/bump major   # 0.1.0 → 1.0.0
/bump 1.2.3   # versione esplicita
```

Il comando: calcola versione → chiede conferma → scrive `backend/VERSION` → commit + tag → push → GitHub Release → rebuild locale → offre deploy su home-server.

## Deploy Produzione

**Server:** `root@home-server` — `~/software-checker/`

- Il `docker-compose.yml` sul server usa immagini da Docker Hub (`manzolo/software-checker-backend`, `manzolo/software-checker-frontend`)
- Il frontend è sulla rete Docker `nginx-net` (external), raggiungibile da nginx proxy manager come `software-checker-frontend:80` — **nessuna porta esposta sull'host**
- NPM gestisce i virtual host; l'utente configura i proxy manualmente

**Istanza di produzione raggiungibile in LAN:** `http://software-checker.lan/`
Quando l'utente chiede di aggiungere/modificare software nel tracker, usare SEMPRE `http://software-checker.lan/api/`, mai `http://localhost/`.

Deploy manuale:
```bash
ssh root@home-server "cd ~/software-checker && docker compose pull && docker compose up -d"
```

## CI/CD

GitHub Actions (`.github/workflows/docker-publish.yml`):
- Trigger: push su `main` o tag `v*`
- Builda e pusha su Docker Hub `manzolo/software-checker-backend:latest` e `frontend:latest`
- Tag semver pubblica anche `1.2`, `1.2.3`
- Secrets necessari nel repo: `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`

## Migrazioni DB

Automatiche all'avvio del backend via `src/db/migrate.js`. Aggiungere file `.sql` in `src/db/migrations/` con prefisso numerico (es. `002_nuova_tabella.sql`).

## Canali Notifica

| Canale | Configurazione |
|---|---|
| In-app (SSE) | sempre attivo |
| Telegram | token + chat ID in Settings o `.env` |
| Web Push | VAPID keys auto-generate al primo avvio, subscribe dal browser in Settings |
