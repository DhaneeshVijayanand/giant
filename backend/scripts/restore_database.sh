#!/usr/bin/env bash
# Automated Database Restore Script for Giant Platform (Linux / Containers)
set -euo pipefail

BACKUP_FILE="${1:-}"

if [ -z "$BACKUP_FILE" ] || [ ! -f "$BACKUP_FILE" ]; then
    echo "Usage: ./restore_database.sh <path_to_backup_file>"
    exit 1
fi

echo "=================================================="
echo "Giant Platform: Restoring Database"
echo "Source: $BACKUP_FILE"
echo "=================================================="

if [[ "$BACKUP_FILE" == *.db ]]; then
    cp "$BACKUP_FILE" "./giant.db"
    echo "[SUCCESS] SQLite database restored to ./giant.db"
elif [[ "$BACKUP_FILE" == *.sql ]]; then
    if [ -z "${DATABASE_URL:-}" ]; then
        echo "Error: DATABASE_URL environment variable is not defined."
        exit 1
    fi
    psql "$DATABASE_URL" < "$BACKUP_FILE"
    echo "[SUCCESS] PostgreSQL database restored from $BACKUP_FILE"
else
    echo "Error: Unrecognized file extension. Expected .db or .sql"
    exit 1
fi
