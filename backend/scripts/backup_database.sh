#!/usr/bin/env bash
# Automated Database Backup Script for Giant Platform (Bash / Linux / Containers)
set -euo pipefail

BACKUP_DIR="${1:-./backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

mkdir -p "$BACKUP_DIR"

echo "=================================================="
echo "Giant Platform: Initiating Database Backup"
echo "Timestamp: $TIMESTAMP"
echo "=================================================="

# Check for SQLite database
SQLITE_DB="./giant.db"
if [ -f "$SQLITE_DB" ]; then
    TARGET_SQLITE="$BACKUP_DIR/giant_sqlite_$TIMESTAMP.db"
    cp "$SQLITE_DB" "$TARGET_SQLITE"
    echo "[SUCCESS] SQLite database backed up to: $TARGET_SQLITE"
fi

# Check for PostgreSQL database
if [[ "${DATABASE_URL:-}" == *"postgres"* ]]; then
    TARGET_PG="$BACKUP_DIR/giant_pg_$TIMESTAMP.sql"
    echo "PostgreSQL detected. Running pg_dump..."
    pg_dump "$DATABASE_URL" > "$TARGET_PG"
    echo "[SUCCESS] PostgreSQL backup completed: $TARGET_PG"
fi

echo "Backup routine finished."
