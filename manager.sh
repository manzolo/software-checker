#!/usr/bin/env bash
# manager.sh — Gestione container Docker per software-checker
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE="docker compose -f ${SCRIPT_DIR}/docker-compose.yml"

# Colori
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

info()    { echo -e "${CYAN}[info]${NC} $*"; }
success() { echo -e "${GREEN}[ok]${NC}   $*"; }
warn()    { echo -e "${YELLOW}[warn]${NC} $*"; }
error()   { echo -e "${RED}[error]${NC} $*" >&2; }

require_env() {
  if [ ! -f "${SCRIPT_DIR}/.env" ]; then
    warn ".env non trovato — copio da .env.example"
    cp "${SCRIPT_DIR}/.env.example" "${SCRIPT_DIR}/.env"
    warn "Modifica .env con le tue credenziali prima di avviare!"
  fi
}

cmd_help() {
  echo ""
  echo "  Utilizzo: ./manager.sh <comando> [opzioni]"
  echo ""
  echo "  Comandi disponibili:"
  echo "    up          Avvia tutti i container (build se necessario)"
  echo "    down        Ferma e rimuove i container"
  echo "    restart     Riavvia tutti i container"
  echo "    build       Rebuilda le immagini"
  echo "    status      Mostra lo stato dei container"
  echo "    logs [svc]  Mostra i log (tutti o di un servizio specifico)"
  echo "    shell <svc> Apre una shell nel container specificato"
  echo "    ps          Alias di status"
  echo "    help        Mostra questo messaggio"
  echo ""
  echo "  Servizi: backend, frontend, db"
  echo ""
}

cmd_up() {
  require_env
  info "Avvio dei container..."
  $COMPOSE up -d --build --remove-orphans
  success "Container avviati"
  $COMPOSE ps
}

cmd_down() {
  info "Arresto dei container..."
  $COMPOSE down
  success "Container fermati"
}

cmd_restart() {
  local svc="${1:-}"
  if [ -n "$svc" ]; then
    info "Riavvio del servizio: ${svc}"
    $COMPOSE up -d "$svc"
    success "Servizio ${svc} riavviato"
  else
    info "Riavvio di tutti i container..."
    $COMPOSE up -d --remove-orphans
    success "Tutti i container riavviati"
  fi
}

cmd_build() {
  local svc="${1:-}"
  info "Build delle immagini${svc:+ per ${svc}}..."
  if [ -n "$svc" ]; then
    $COMPOSE build "$svc"
  else
    $COMPOSE build
  fi
  success "Build completata"
}

cmd_status() {
  $COMPOSE ps
}

cmd_logs() {
  local svc="${1:-}"
  local lines="${2:-200}"
  if [ -n "$svc" ]; then
    $COMPOSE logs --follow --tail="$lines" "$svc"
  else
    $COMPOSE logs --follow --tail="$lines"
  fi
}

cmd_shell() {
  local svc="${1:-}"
  if [ -z "$svc" ]; then
    error "Specifica un servizio: backend, frontend, db"
    exit 1
  fi
  info "Apertura shell nel container: ${svc}"
  $COMPOSE exec "$svc" sh
}

# --- main ---
COMMAND="${1:-help}"
shift || true

case "$COMMAND" in
  up)       cmd_up "$@" ;;
  down)     cmd_down "$@" ;;
  restart)  cmd_restart "$@" ;;
  build)    cmd_build "$@" ;;
  status|ps) cmd_status ;;
  logs)     cmd_logs "$@" ;;
  shell)    cmd_shell "$@" ;;
  help|--help|-h) cmd_help ;;
  *)
    error "Comando sconosciuto: ${COMMAND}"
    cmd_help
    exit 1
    ;;
esac
