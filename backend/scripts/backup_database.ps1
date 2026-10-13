# PowerShell Automated Database Backup Script for Giant Platform
param (
    [string]$BackupDir = "..\backups"
)

$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
if (-not (Test-Path -Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

Write-Host "=================================================="
Write-Host "Giant Platform: Initiating Database Backup"
Write-Host "Timestamp: $Timestamp"
Write-Host "=================================================="

# Check for SQLite database file
$SqliteDb = "..\giant.db"
if (Test-Path -Path $SqliteDb) {
    $TargetFile = Join-Path -Path $BackupDir -ChildPath "giant_sqlite_$Timestamp.db"
    Copy-Item -Path $SqliteDb -Destination $TargetFile
    Write-Host "[SUCCESS] SQLite database successfully backed up to:"
    Write-Host "  -> $TargetFile"
}

# Check if PostgreSQL is in use via environment
if ($env:DATABASE_URL -match "postgres") {
    $TargetPg = Join-Path -Path $BackupDir -ChildPath "giant_pg_$Timestamp.sql"
    Write-Host "PostgreSQL environment detected. Running pg_dump..."
    pg_dump $env:DATABASE_URL -f $TargetPg
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[SUCCESS] PostgreSQL database backed up to:"
        Write-Host "  -> $TargetPg"
    } else {
        Write-Warning "[WARNING] pg_dump encountered an error or is not on PATH."
    }
}

Write-Host "Backup process completed."
