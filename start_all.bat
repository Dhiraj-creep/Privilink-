@echo off
title TRUSTMESH - Privacy-Preserving Risk Intelligence
echo ======================================================================
echo   TRUSTMESH: Privacy-Preserving Cross-Institution Risk Intelligence
echo   Starting complete system (Coordinator, Nodes, Frontend)...
echo ======================================================================

python scripts\run_all.py
if errorlevel 1 (
    echo [ERROR] Launcher failed with code %errorlevel%
    pause
    exit /b %errorlevel%
)
pause
