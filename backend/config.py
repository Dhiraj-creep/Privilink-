"""
PriviLink Configuration
Centralized configuration parameters, directory paths, ports, seeds, environment variables,
and cryptographic constants.
"""

import os
from pathlib import Path

# Base Paths
BASE_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = BASE_DIR / "backend"
DATA_STORE_DIR = BASE_DIR / "data_store"

# Isolated Storage Paths
COORDINATOR_DB_PATH = DATA_STORE_DIR / "coordinator" / "coordinator.db"
BANK_A_DB_PATH = DATA_STORE_DIR / "nodes" / "bank_a" / "bank_a.db"
INSURER_B_DB_PATH = DATA_STORE_DIR / "nodes" / "insurer_b" / "insurer_b.db"
LENDER_C_DB_PATH = DATA_STORE_DIR / "nodes" / "lender_c" / "lender_c.db"
ML_ARTIFACTS_DIR = BACKEND_DIR / "ml" / "artifacts"

# Environment and Execution Mode
PRIVILINK_ENV = os.getenv("PRIVILINK_ENV", os.getenv("TRUSTMESH_ENV", "development")).lower()
PRIVILINK_MODE = os.getenv("PRIVILINK_MODE", os.getenv("TRUSTMESH_MODE", "distributed")).lower()
# Backward-compatibility aliases
TRUSTMESH_ENV = PRIVILINK_ENV
TRUSTMESH_MODE = PRIVILINK_MODE

ALLOW_DEMO_SHORTCUTS = (
    os.getenv("PRIVILINK_ALLOW_DEMO_SHORTCUTS", os.getenv("TRUSTMESH_ALLOW_DEMO_SHORTCUTS", "true" if PRIVILINK_ENV != "production" else "false")).lower()
    in ("true", "1", "yes")
)
INTERNAL_SERVICE_KEY = os.getenv("INTERNAL_SERVICE_KEY", os.getenv("PRIVILINK_INTERNAL_SERVICE_KEY", "privilink-internal-node-secret-2026"))

# Server Ports & URLs
COORDINATOR_PORT = int(os.getenv("COORDINATOR_PORT", "8000"))
BANK_A_PORT = int(os.getenv("BANK_A_PORT", "8001"))
INSURER_B_PORT = int(os.getenv("INSURER_B_PORT", "8002"))
LENDER_C_PORT = int(os.getenv("LENDER_C_PORT", "8003"))

BANK_A_URL = os.getenv("BANK_A_URL", f"http://127.0.0.1:{BANK_A_PORT}")
INSURER_B_URL = os.getenv("INSURER_B_URL", f"http://127.0.0.1:{INSURER_B_PORT}")
LENDER_C_URL = os.getenv("LENDER_C_URL", f"http://127.0.0.1:{LENDER_C_PORT}")

# CORS Configuration
_cors_raw = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000")
CORS_ORIGINS = [origin.strip() for origin in _cors_raw.split(",") if origin.strip()]

# ML / Synthetic Data Parameters
SYNTHETIC_DATA_SEED = int(os.getenv("SYNTHETIC_DATA_SEED", "42"))
TOTAL_SYNTHETIC_RECORDS = int(os.getenv("TOTAL_SYNTHETIC_RECORDS", "1500"))
FEATURE_DIMS = {
    "BANK_A": 5,
    "INSURER_B": 5,
    "LENDER_C": 5,
}

# Cryptographic & Privacy Parameters
DEFAULT_EPSILON = float(os.getenv("DEFAULT_EPSILON", "1.5"))
DEFAULT_DELTA = float(os.getenv("DEFAULT_DELTA", "1e-5"))
CLIP_NORM = float(os.getenv("CLIP_NORM", "1.0"))

# 256-bit safe prime for commutative Diffie-Hellman Private Set Intersection (RFC 3526 MODP Group 14 subset or 256-bit prime)
DH_PRIME_HEX = (
    "FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD1"
    "29024E088A67CC74020BBEA63B139B22514A08798E3404DD"
    "EF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245"
    "E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7ED"
    "EE386BFB5A899FA5AE9F24117C4B1FE649286651ECE45B3D"
    "C2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F"
    "83655D23DCA3AD961C62F356208552BB9ED529077096966D"
    "670C354E4ABC9804F1746C08CA18217C32905E462E36CE3B"
    "E39E772C180E86039B2783A2EC07A28FB5C55DF06F4C52C9"
    "DE2BCBF6955817183995497CEA956AE515D2261898FA0510"
    "15728E5A8AACAA68FFFFFFFFFFFFFFFF"
)
DH_PRIME = int(DH_PRIME_HEX, 16)
DH_GENERATOR = 2

# JWT / Secret Key Management
DEFAULT_DEV_SECRET = "privilink-local-evaluation-insecure-demo-secret-key-2026"
LEGACY_DEV_SECRET = "trustmesh-local-evaluation-insecure-demo-secret-key-2026"
AUTH_SECRET_KEY = os.getenv("PRIVILINK_SECRET_KEY", os.getenv("TRUSTMESH_SECRET_KEY", DEFAULT_DEV_SECRET))
AUTH_ALGORITHM = os.getenv("PRIVILINK_AUTH_ALGORITHM", os.getenv("TRUSTMESH_AUTH_ALGORITHM", "HS256"))

if PRIVILINK_ENV == "production":
    if not AUTH_SECRET_KEY or AUTH_SECRET_KEY in (DEFAULT_DEV_SECRET, LEGACY_DEV_SECRET):
        raise RuntimeError(
            "Production Security Failure: Essential secret 'PRIVILINK_SECRET_KEY' (or 'TRUSTMESH_SECRET_KEY') is missing or set to default dev key. "
            "Set a cryptographically strong key in environment before starting in production mode."
        )
    if ALLOW_DEMO_SHORTCUTS:
        raise RuntimeError(
            "Production Security Failure: Demo shortcuts (PRIVILINK_ALLOW_DEMO_SHORTCUTS) cannot be enabled in production."
        )
