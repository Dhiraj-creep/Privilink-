"""
TRUSTMESH Authentication & Role-Based Access Control (RBAC)
Enforces server-side authorization across Risk Analyst, Institution Admin, Compliance Officer, and Network Admin.
Prevents cross-institution data retrieval by unauthorized institution admins (HTTP 403 Forbidden).
"""

import hashlib
import hmac
import json
import secrets
import time
from typing import Any, Dict, Optional

from backend.config import AUTH_ALGORITHM, AUTH_SECRET_KEY, COORDINATOR_DB_PATH
from backend.storage.db import get_db_connection

# Pre-configured demo accounts
DEMO_USERS = [
    {
        "id": 1,
        "username": "analyst",
        "email": "analyst@trustmesh.local",
        "password": "Analyst2026!",
        "role": "RISK_ANALYST",
        "institution_id": None,
        "title": "Risk Analyst",
        "desc": "Cross-institution case investigations & explainability HUD"
    },
    {
        "id": 2,
        "username": "bank_admin",
        "email": "bank_admin@bank-a.local",
        "password": "BankAdmin2026!",
        "role": "INSTITUTION_ADMIN",
        "institution_id": "BANK_A",
        "title": "Institution Admin (Bank A)",
        "desc": "Local private schema & sovereign Bank A records only"
    },
    {
        "id": 3,
        "username": "insurer_admin",
        "email": "insurer_admin@insurer-b.local",
        "password": "InsurerAdmin2026!",
        "role": "INSTITUTION_ADMIN",
        "institution_id": "INSURER_B",
        "title": "Institution Admin (Insurer B)",
        "desc": "Local private schema & sovereign Insurer B policies only"
    },
    {
        "id": 4,
        "username": "lender_admin",
        "email": "lender_admin@lender-c.local",
        "password": "LenderAdmin2026!",
        "role": "INSTITUTION_ADMIN",
        "institution_id": "LENDER_C",
        "title": "Institution Admin (Lender C)",
        "desc": "Local private schema & sovereign Lender C credit records only"
    },
    {
        "id": 5,
        "username": "compliance",
        "email": "compliance@trustmesh.local",
        "password": "Compliance2026!",
        "role": "COMPLIANCE_OFFICER",
        "institution_id": None,
        "title": "Compliance Officer",
        "desc": "Privacy budget epsilon, zero-knowledge proofs & audit log verification"
    },
    {
        "id": 6,
        "username": "admin",
        "email": "admin@trustmesh.local",
        "password": "NetworkAdmin2026!",
        "role": "NETWORK_ADMIN",
        "institution_id": None,
        "title": "Network Admin",
        "desc": "Global topology, Byzantine defense & aggregation rounds"
    }
]


def hash_password(password: str, salt: Optional[str] = None) -> Tuple[str, str]:
    """Hashes password using PBKDF2-HMAC-SHA256 with 100,000 iterations."""
    if not salt:
        salt = secrets.token_hex(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000)
    return dk.hex(), salt


def verify_password(password: str, stored_hash: str, salt: Optional[str] = None) -> bool:
    """Verifies plain password against stored PBKDF2 hash (supports 'hash:salt' or separate args)."""
    try:
        if salt:
            computed_hash, _ = hash_password(password, salt)
            return hmac.compare_digest(computed_hash, stored_hash)
        if ":" in stored_hash:
            p_hash, s = stored_hash.split(":", 1)
            computed_hash, _ = hash_password(password, s)
            return hmac.compare_digest(computed_hash, p_hash)
        return False
    except Exception:
        return False


# Initialize deterministic salted password hashes for in-memory demo users
for u in DEMO_USERS:
    h, s = hash_password(u["password"], salt=f"trustmesh_salt_{u['username']}")
    u["password_hash"] = f"{h}:{s}"
    u["salt"] = s


def create_session_token(user: Dict[str, Any]) -> str:
    """Creates a signed, time-limited demo bearer token (8 hours validity)."""
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "sub": user["username"],
        "email": user["email"],
        "role": user["role"],
        "institution_id": user.get("institution_id"),
        "exp": int(time.time()) + 28800  # 8 hours
    }
    h_str = json.dumps(header, separators=(",", ":"))
    p_str = json.dumps(payload, separators=(",", ":"))

    h_b64 = h_str.encode("utf-8").hex()
    p_b64 = p_str.encode("utf-8").hex()

    msg = f"{h_b64}.{p_b64}".encode("utf-8")
    sig = hmac.new(AUTH_SECRET_KEY.encode("utf-8"), msg, hashlib.sha256).hexdigest()

    return f"{h_b64}.{p_b64}.{sig}"


def verify_session_token(token: str) -> Optional[Dict[str, Any]]:
    """Verifies and decodes token. Returns payload dict or None if invalid or expired."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        h_b64, p_b64, sig = parts
        msg = f"{h_b64}.{p_b64}".encode("utf-8")
        expected_sig = hmac.new(AUTH_SECRET_KEY.encode("utf-8"), msg, hashlib.sha256).hexdigest()

        if not hmac.compare_digest(sig, expected_sig):
            return None

        p_str = bytes.fromhex(p_b64).decode("utf-8")
        payload = json.loads(p_str)

        if payload.get("exp", 0) < time.time():
            return None

        return payload
    except Exception:
        return None


def get_user_by_username(username: str) -> Optional[Dict[str, Any]]:
    """Looks up user by username/email from coordinator database or in-memory demo records."""
    if COORDINATOR_DB_PATH.exists():
        try:
            with get_db_connection(COORDINATOR_DB_PATH) as conn:
                cur = conn.execute(
                    "SELECT id, username, email, password_hash, role, institution_id FROM users WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)",
                    (username, username)
                )
                row = cur.fetchone()
                if row:
                    meta = next((d for d in DEMO_USERS if d["username"].lower() == row["username"].lower()), {})
                    return {
                        "id": row["id"],
                        "username": row["username"],
                        "email": row["email"],
                        "password_hash": row["password_hash"],
                        "role": row["role"],
                        "institution_id": row["institution_id"],
                        "title": meta.get("title", row["role"]),
                        "desc": meta.get("desc", "")
                    }
        except Exception:
            pass

    for u in DEMO_USERS:
        if u["username"].lower() == username.lower() or u["email"].lower() == username.lower():
            return u
    return None


def verify_institution_boundary_access(user: Dict[str, Any], requested_institution_id: str) -> Tuple[bool, Optional[str]]:
    """
    Strict server-enforced boundary check.
    If user is an INSTITUTION_ADMIN, they can ONLY access their own institution.
    Returns (allowed: bool, error_message: Optional[str]).
    """
    user_role = user.get("role")
    user_inst = user.get("institution_id")

    # Global roles can view metadata, but institution admins are restricted
    if user_role == "INSTITUTION_ADMIN":
        if user_inst != requested_institution_id:
            return False, (
                f"403 Forbidden: Institutional Boundary Violation. Admin for {user_inst} "
                f"cannot access sovereign private data of {requested_institution_id}."
            )

    return True, None
