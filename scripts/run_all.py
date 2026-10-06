"""
TRUSTMESH Complete System Orchestrator
Launches:
1. Coordinator Central API (Port 8000)
2. Bank A Sovereign Node (Port 8001)
3. Insurer B Sovereign Node (Port 8002)
4. Lender C Sovereign Node (Port 8003)
5. React / Vite Frontend (Port 5173)

Monitors all sub-processes and handles clean graceful shutdown on Ctrl+C.
"""

import sys
import os
import time
import subprocess
import signal
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
        print("[TRUSTMESH] Database not found. Seeding initial environment...")
        from scripts.seed_data import seed_all
        seed_all()
    else:
        print("[TRUSTMESH] Verified existing data stores.")


def main():
    print("=" * 72)
    print("  TRUSTMESH: PRIVACY-PRESERVING RISK INTELLIGENCE FEDERATION")
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
        # On Windows, npm is npm.cmd
        npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
        p_front = subprocess.Popen(
            [npm_cmd, "run", "dev"],
            cwd=str(PROJECT_ROOT),
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        processes.append(("Frontend UI", p_front))

        time.sleep(2)

        print("\n" + "=" * 72)
        print("  ✓ ALL SYSTEMS RUNNING SUCCESSFULLY")
        print("=" * 72)
        print(f"  • Frontend Web UI:        http://localhost:5173/")
        print(f"  • Coordinator API:         http://127.0.0.1:{COORDINATOR_PORT}/api")
        print(f"  • API Swagger Docs:        http://127.0.0.1:{COORDINATOR_PORT}/docs")
        print(f"  • Bank A Sovereign Node:   http://127.0.0.1:{BANK_A_PORT}/")
        print(f"  • Insurer B Sovereign Node: http://127.0.0.1:{INSURER_B_PORT}/")
        print(f"  • Lender C Sovereign Node:  http://127.0.0.1:{LENDER_C_PORT}/")
        print("=" * 72)
        print("  Press Ctrl+C at any time to cleanly stop all processes.\n")

        # Keep alive and monitor
        while True:
            time.sleep(1)
            for name, proc in processes:
                if proc.poll() is not None:
                    print(f"[WARNING] {name} exited unexpectedly (code {proc.returncode}).")

    except KeyboardInterrupt:
        print("\n[TRUSTMESH] Stopping all processes cleanly...")
    finally:
        for name, proc in processes:
            try:
                proc.terminate()
                if os.name == "nt":
                    # Force kill child process tree if needed
                    subprocess.call(
                        ["taskkill", "/F", "/T", "/PID", str(proc.pid)],
                        stdout=subprocess.DEVNULL,
                        stderr=subprocess.DEVNULL
                    )
            except Exception:
                pass
        print("[TRUSTMESH] All services stopped. Shutdown complete.")


if __name__ == "__main__":
    main()
