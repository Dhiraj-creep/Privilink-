"""
PriviLink Complete System Orchestrator
Launches:
1. Coordinator Central API (Port 8000)
2. Bank A Sovereign Node (Port 8001)
3. Insurer B Sovereign Node (Port 8002)
4. Lender C Sovereign Node (Port 8003)
5. React / Vite Frontend (Port 5173)

Monitors all sub-processes, verifies HTTP readiness on all 5 ports,
and handles clean graceful shutdown on Ctrl+C.
"""

import sys
import os
import time
import subprocess
import signal
import urllib.request
import urllib.error
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from backend.config import (
    COORDINATOR_DB_PATH,
    COORDINATOR_PORT,
    BANK_A_PORT,
    INSURER_B_PORT,
    LENDER_C_PORT
)


def ensure_data_seeded():
    """Verify that databases exist; if not, automatically seed them."""
    if not COORDINATOR_DB_PATH.exists():
        print("[PriviLink] Database not found. Seeding initial environment...")
        from scripts.seed_data import seed_all
        seed_all()
    else:
        print("[PriviLink] Verified existing data stores.")


def probe_endpoint(name: str, url: str, timeout: float = 1.0) -> bool:
    """Attempt HTTP GET request against service endpoint."""
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "PriviLink-HealthProbe/1.0"})
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.status in (200, 304)
    except Exception:
        return False


def verify_cluster_readiness(max_attempts: int = 15, delay: float = 0.8) -> bool:
    """Active readiness check polling all 5 microservice endpoints."""
    endpoints = [
        ("Coordinator API", f"http://127.0.0.1:{COORDINATOR_PORT}/api/health"),
        ("Bank A Node", f"http://127.0.0.1:{BANK_A_PORT}/health"),
        ("Insurer B Node", f"http://127.0.0.1:{INSURER_B_PORT}/health"),
        ("Lender C Node", f"http://127.0.0.1:{LENDER_C_PORT}/health"),
        ("Vite Frontend UI", "http://localhost:5173/")
    ]

    print("\n[PROBE] Verifying readiness across all federation endpoints...")
    all_ready = False

    for attempt in range(1, max_attempts + 1):
        pending = []
        for name, url in endpoints:
            if not probe_endpoint(name, url):
                pending.append(name)

        if not pending:
            all_ready = True
            break

        time.sleep(delay)

    for name, url in endpoints:
        ok = probe_endpoint(name, url)
        status_symbol = "✓" if ok else "✗"
        print(f"  [{status_symbol}] {name:<20} -> {url}")

    return all_ready


def main():
    print("=" * 72)
    print("  PriviLink: PRIVACY-PRESERVING RISK INTELLIGENCE FEDERATION")
    print("  System Orchestrator — Starting all components...")
    print("=" * 72)

    ensure_data_seeded()

    processes = []

    try:
        # 1. Start Coordinator Backend (Port 8000)
        print(f"\n[1/3] Launching Coordinator API on http://127.0.0.1:{COORDINATOR_PORT}...")
        p_coord = subprocess.Popen(
            [sys.executable, "-m", "uvicorn", "backend.main:app", "--host", "127.0.0.1", "--port", str(COORDINATOR_PORT), "--log-level", "warning"],
            cwd=str(PROJECT_ROOT),
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        processes.append(("Coordinator API", p_coord))

        # 2. Start Sovereign Participant Nodes (Ports 8001, 8002, 8003)
        print(f"[2/3] Launching Sovereign Nodes (Ports {BANK_A_PORT}, {INSURER_B_PORT}, {LENDER_C_PORT})...")
        p_nodes = subprocess.Popen(
            [sys.executable, "backend/run_nodes.py", "ALL"],
            cwd=str(PROJECT_ROOT),
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        processes.append(("Sovereign Nodes", p_nodes))

        # 3. Start Vite Frontend (Port 5173)
        print(f"[3/3] Launching Frontend UI at http://localhost:5173/...")
        npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
        p_front = subprocess.Popen(
            [npm_cmd, "run", "dev"],
            cwd=str(PROJECT_ROOT),
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        processes.append(("Frontend UI", p_front))

        # Perform Active Health Probes
        is_ready = verify_cluster_readiness(max_attempts=15, delay=0.8)

        if not is_ready:
            print("\n[ERROR] One or more services failed readiness verification.")
            print("[INFO] Check port availability and node database configurations.")
            # Do not exit immediately if running interactively, but notify clearly
        else:
            print("\n" + "=" * 72)
            print("  ✓ ALL 5 FEDERATION SERVICES VERIFIED & READY")
            print("=" * 72)
            print(f"  • Frontend Web UI:         http://localhost:5173/")
            print(f"  • Coordinator API:          http://127.0.0.1:{COORDINATOR_PORT}/api")
            print(f"  • Coordinator Swagger Docs: http://127.0.0.1:{COORDINATOR_PORT}/docs")
            print(f"  • Bank A Sovereign Node:    http://127.0.0.1:{BANK_A_PORT}/")
            print(f"  • Insurer B Sovereign Node:  http://127.0.0.1:{INSURER_B_PORT}/")
            print(f"  • Lender C Sovereign Node:   http://127.0.0.1:{LENDER_C_PORT}/")
            print("=" * 72)
            print("  Press Ctrl+C at any time to cleanly stop all processes.\n")

        # Keep alive and monitor
        while True:
            time.sleep(1)
            for name, proc in processes:
                if proc.poll() is not None:
                    print(f"[WARNING] {name} exited unexpectedly (code {proc.returncode}).")

    except KeyboardInterrupt:
        print("\n[PriviLink] Stopping all processes cleanly...")
    finally:
        for name, proc in processes:
            try:
                proc.terminate()
                if os.name == "nt":
                    subprocess.call(
                        ["taskkill", "/F", "/T", "/PID", str(proc.pid)],
                        stdout=subprocess.DEVNULL,
                        stderr=subprocess.DEVNULL
                    )
            except Exception:
                pass


if __name__ == "__main__":
    main()
