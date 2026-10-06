"""
TRUSTMESH Demo Reset Script
Restores all 4 databases, retrains models, regenerates verified audit chain,
and leaves the system in a pristine benchmark state for judging.
"""

import sys
import os
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from scripts.seed_data import seed_all

if __name__ == "__main__":
    print("=" * 65)
    print("  TRUSTMESH: DEMO STATE RESET & DATA STORE RE-SEEDING")
    print("=" * 65)
    seed_all()
    print("\n[SUCCESS] System reset complete. Ready for evaluation by judges.\n")
