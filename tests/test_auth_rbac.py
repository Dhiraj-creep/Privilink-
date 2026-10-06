"""
Tests for Authentication and Role-Based Access Control (RBAC).
Verifies password verification, session tokens, and cross-institution boundary protection (HTTP 403).
"""

import pytest
from fastapi.testclient import TestClient

from backend.auth.security import (
    DEMO_USERS,
    create_session_token,
    hash_password,
    verify_institution_boundary_access,
    verify_password,
    verify_session_token,
)
from backend.main import app

client = TestClient(app)


def test_password_hashing_and_verification():
    raw_pwd = "TestPassword2026!"
    pwd_hash, salt = hash_password(raw_pwd)

    assert verify_password(raw_pwd, pwd_hash, salt) is True
    assert verify_password("WrongPassword!", pwd_hash, salt) is False


def test_session_token_lifecycle():
    user = DEMO_USERS[0]
    token = create_session_token(user)
    payload = verify_session_token(token)

    assert payload is not None
    assert payload["sub"] == user["username"]
    assert payload["role"] == user["role"]


def test_login_api_endpoint():
    res = client.post("/api/auth/login", json={"username": "analyst", "password": "Analyst2026!"})
    assert res.status_code == 200
    data = res.json()
    assert "token" in data
    assert data["user"]["role"] == "RISK_ANALYST"


def test_unauthorized_token_rejection():
    """Verify that missing or malformed tokens return HTTP 401 Unauthorized."""
    # 1. Missing token
    res_no_token = client.get("/api/cases")
    assert res_no_token.status_code == 401

    # 2. Invalid/tampered token
    res_bad_token = client.get("/api/cases", headers={"Authorization": "Bearer invalid.fake.token"})
    assert res_bad_token.status_code == 401


def test_cross_institution_access_rejection():
    """Verify that Institution Admin for Bank A is forbidden (403) from accessing Insurer B records."""
    bank_admin = next(u for u in DEMO_USERS if u["username"] == "bank_admin")
    bank_token = create_session_token(bank_admin)

    # 1. Bank Admin can access Bank A records
    res_bank = client.get("/api/nodes/BANK_A/records", headers={"Authorization": f"Bearer {bank_token}"})
    assert res_bank.status_code == 200

    # 2. Bank Admin is STRICTLY FORBIDDEN from accessing Insurer B records
    res_ins = client.get("/api/nodes/INSURER_B/records", headers={"Authorization": f"Bearer {bank_token}"})
    assert res_ins.status_code == 403
    assert "Institutional Boundary Violation" in res_ins.json()["detail"]

    # 3. Bank Admin is STRICTLY FORBIDDEN from accessing Lender C records
    res_lender = client.get("/api/nodes/LENDER_C/records", headers={"Authorization": f"Bearer {bank_token}"})
    assert res_lender.status_code == 403
    assert "Institutional Boundary Violation" in res_lender.json()["detail"]


def test_audit_tamper_permission_enforcement():
    """Verify that only Compliance Officer or Network Admin can simulate audit tampering."""
    analyst_user = next(u for u in DEMO_USERS if u["username"] == "analyst")
    analyst_token = create_session_token(analyst_user)

    # Risk analyst is rejected with 403 Forbidden
    res_analyst = client.post(
        "/api/audit/simulate-tamper",
        json={"target_idx": 1},
        headers={"Authorization": f"Bearer {analyst_token}"}
    )
    assert res_analyst.status_code == 403

    compliance_user = next(u for u in DEMO_USERS if u["username"] == "compliance")
    compliance_token = create_session_token(compliance_user)

    # Compliance officer is authorized
    res_comp = client.post(
        "/api/audit/simulate-tamper",
        json={"target_idx": 1},
        headers={"Authorization": f"Bearer {compliance_token}"}
    )
    assert res_comp.status_code == 200
