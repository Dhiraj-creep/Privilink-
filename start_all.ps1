# PriviLink Launch Script for PowerShell
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  PriviLink: Shared intelligence. Protected data." -ForegroundColor Green
Write-Host "  Launching Coordinator, Sovereign Nodes, and Vite Frontend..." -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Cyan

python scripts/run_all.py
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] System launcher exited with error code $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}
