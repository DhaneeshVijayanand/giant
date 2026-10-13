# PowerShell Automated Database Restore Script for Giant Platform
param (
    [Parameter(Mandatory=$true)]
    [string]$BackupFile
)

if (-not (Test-Path -Path $BackupFile)) {
    Write-Error "Backup file not found: $BackupFile"
    exit 1
}

Write-Host "=================================================="
Write-Host "Giant Platform: Restoring Database"
Write-Host "Source: $BackupFile"
Write-Host "=================================================="

if ($BackupFile.EndsWith(".db")) {
    $TargetDb = "..\giant.db"
    Copy-Item -Path $BackupFile -Destination $TargetDb -Force
    Write-Host "[SUCCESS] SQLite database restored to $TargetDb"
} elseif ($BackupFile.EndsWith(".sql")) {
    if (-not $env:DATABASE_URL) {
        Write-Error "DATABASE_URL environment variable is not defined."
        exit 1
    }
    psql $env:DATABASE_URL -f $BackupFile
    Write-Host "[SUCCESS] PostgreSQL database restored from $BackupFile"
} else {
    Write-Error "Unrecognized backup format. Expected .db or .sql file."
    exit 1
}
