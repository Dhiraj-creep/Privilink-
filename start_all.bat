@echo off
title PriviLink - Shared intelligence. Protected data.
echo ======================================================================
echo   PriviLink: Shared intelligence. Protected data.
echo   Starting complete system (Coordinator, Nodes, Frontend)...
echo ======================================================================

python scripts\run_all.py
if errorlevel 1 (
    echo [ERROR] Launcher failed with code %errorlevel%
    pause
    exit /b %errorlevel%
)
pause
