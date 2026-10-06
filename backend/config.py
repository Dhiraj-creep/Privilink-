"""
TRUSTMESH Configuration
Centralized configuration parameters, directory paths, ports, seeds, and cryptographic constants.
"""

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

# Server Ports
COORDINATOR_PORT = 8000
BANK_A_PORT = 8001
INSURER_B_PORT = 8002
LENDER_C_PORT = 8003

# ML / Synthetic Data Parameters
SYNTHETIC_DATA_SEED = 42
TOTAL_SYNTHETIC_RECORDS = 1500  # Realistic laptop-friendly benchmark population
FEATURE_DIMS = {
    "BANK_A": 5,
    "INSURER_B": 5,
    "LENDER_C": 5,
}

# Cryptographic & Privacy Parameters
DEFAULT_EPSILON = 1.5
DEFAULT_DELTA = 1e-5
CLIP_NORM = 1.0

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

# JWT / Secret Key for local demo session
AUTH_SECRET_KEY = "trustmesh-local-evaluation-insecure-demo-secret-key-2026"
AUTH_ALGORITHM = "HS256"
