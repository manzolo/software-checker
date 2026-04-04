---
description: Aggiungi un software da monitorare all'istanza di produzione
argument-hint: <url> [nome] [hourly|daily|weekly] [css_selector]
allowed-tools: [Bash, WebFetch]
---

Aggiungi un software al tracker di produzione su http://software-checker.lan/. Argomento: $ARGUMENTS

## Istanza target

Usare SEMPRE `http://software-checker.lan/api/` — mai localhost.

## Steps

### 1. Analizza l'argomento

Estrai dall'argomento:
- **url** — obbligatoria
- **nome** — opzionale, se non fornito derivalo dall'URL (es. nome del repo GitHub, o dominio)
- **check_interval** — opzionale, default `weekly`
- **css_selector** — opzionale, solo per type=scrape

### 2. Determina il tipo

- URL contiene `github.com` → `type: github`
- URL contiene `feed`, `rss`, `atom`, `.xml` → `type: rss`
- Altrimenti → `type: scrape` (richiede css_selector; se non fornito, fai un WebFetch della pagina per trovare il selettore più adatto e proponilo all'utente prima di procedere)

### 3. Aggiungi il software

```bash
curl -s -X POST http://software-checker.lan/api/software \
  -H "Content-Type: application/json" \
  -d '{"name":"<nome>","url":"<url>","type":"<type>","check_interval":"<interval>"[,"css_selector":"<selector>"]}'
```

Estrai l'`id` dalla risposta.

### 4. Esegui il primo check

```bash
curl -s -X POST http://software-checker.lan/api/software/<id>/check
```

### 5. Riporta

Mostra:
- Nome e tipo rilevato
- Versione trovata (o errore se il check fallisce)
- Promemoria: "Vai su http://software-checker.lan/ e fai acknowledge per registrare la versione corrente"
