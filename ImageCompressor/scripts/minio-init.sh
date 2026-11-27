#!/usr/bin/env bash
#
# Initializes the local MinIO used by the API: waits for it to be ready and creates the bucket.
# Idempotent: safe to run any number of times.
#
# Usage:
#   ImageCompressor/scripts/minio-init.sh
#
# Environment overrides:
#   MINIO_BUCKET        bucket name, must match AwsOptions:BucketName (default: mybucket)
#   MINIO_SERVICE       compose service name (default: minio)
#   MINIO_WAIT_TIMEOUT  seconds to wait for MinIO to become ready (default: 60)
#   COMPOSE_FILE        path to docker-compose.yml (default: ../docker-compose.yml next to this script)
#
# Root credentials are taken from the MinIO container's own environment, so they are never
# passed on the command line.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="${COMPOSE_FILE:-$SCRIPT_DIR/../docker-compose.yml}"
SERVICE="${MINIO_SERVICE:-minio}"
BUCKET="${MINIO_BUCKET:-mybucket}"
WAIT_TIMEOUT="${MINIO_WAIT_TIMEOUT:-60}"
ALIAS="local"

log() { printf '[minio-init] %s\n' "$*"; }
fail() { printf '[minio-init] ERROR: %s\n' "$*" >&2; exit 1; }

compose() { docker compose -f "$COMPOSE_FILE" "$@"; }

# Runs `mc <args>` inside the MinIO container with an alias bound to the root credentials.
mc_exec() {
  compose exec -T "$SERVICE" sh -c \
    'mc alias set "$0" http://localhost:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD" >/dev/null && mc "$@"' \
    "$ALIAS" "$@"
}

command -v docker >/dev/null 2>&1 || fail "docker is not installed or not in PATH"
[[ -f "$COMPOSE_FILE" ]] || fail "compose file not found: $COMPOSE_FILE"

if [[ -z "$(compose ps --status running -q "$SERVICE" 2>/dev/null)" ]]; then
  log "Service '$SERVICE' is not running, starting it..."
  compose up -d "$SERVICE"
fi

log "Waiting for MinIO to become ready (timeout ${WAIT_TIMEOUT}s)..."
deadline=$((SECONDS + WAIT_TIMEOUT))
until mc_exec ready "$ALIAS" >/dev/null 2>&1; do
  (( SECONDS < deadline )) || fail "MinIO did not become ready within ${WAIT_TIMEOUT}s"
  sleep 1
done
log "MinIO is ready."

log "Creating bucket '$BUCKET' (if missing)..."
mc_exec mb --ignore-existing "$ALIAS/$BUCKET"

# Images are served through the API with per-user access checks, so the bucket must stay private.
log "Making sure bucket '$BUCKET' has no anonymous access..."
mc_exec anonymous set none "$ALIAS/$BUCKET"

log "Done. Bucket '$BUCKET' is ready."
