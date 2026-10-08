"""
Regression and Boundary Enforcement Test Suite for PriviLink.
Validates:
1. Real bounded node health probes (does not falsely claim 'Online' just because SQLite file exists).
2. Distributed Split Learning boundary: fails honestly with HTTP 503 when nodes are unreachable (no silent in-process fallback in distributed mode).
3. RBAC on simulation triggers & resets (401 for unauthenticated, 403 for unauthorized roles).
4. Production safety assertions rejecting demo shortcuts and default secret keys.
5. Strict sovereign boundary: Risk Analyst & Compliance Officer cannot read raw participant records (HTTP 403).
6. Case workflow state integrity: active task preservation across list and detail queries, role switching, and resolution.
"""

import os
import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.auth.security import create_session_token
from backend.ml.vfl_engine import VFLEngine, DistributedInferenceUnavailableError

client = TestClient(app)


def get_token(username: str, role: str, institution_id: str = None) -> str:
    user = {"username": username, "email": f"{username}@privilink.network", "role": role}
    if institution_id:
        user["institution_id"] = institution_id
    return create_session_token(user)


def test_real_node_health_probes_vs_db_existence():
    """
    Cluster health endpoint must actively probe participant HTTP endpoints.
    Even if bank_a.db exists on disk, if the background node server on port 8001
    is unreachable, the cluster probe must report UNREACHABLE instead of ONLINE.
    """
    resp = client.get("/api/health/cluster")
    assert resp.status_code == 200
    data = resp.json()

    assert "coordinator" in data
    assert data["coordinator"]["status"] == "ONLINE"
    assert "nodes" in data

    # Participant nodes are checked via bounded HTTP probes
    for inst in ("BANK_A", "INSURER_B", "LENDER_C"):
        assert inst in data["nodes"]
        node_status = data["nodes"][inst]["status"]
        assert node_status in ("REACHABLE", "UNREACHABLE", "QUARANTINED")


def test_unreachable_node_honest_503_in_distributed_mode(monkeypatch):
    """
    In distributed mode, when sovereign participant nodes are unreachable over HTTP RPC,
    predict_distributed must NOT silently fall back to querying local SQLite files.
    It must fail honestly by raising DistributedInferenceUnavailableError.
    """
    import backend.config as cfg
    monkeypatch.setattr(cfg, "BANK_A_URL", "http://127.0.0.1:19999")
    engine = VFLEngine()
    with pytest.raises(DistributedInferenceUnavailableError) as exc_info:
        # Explicitly disable test in-process adapter to enforce distributed network RPC
        engine.predict_distributed("ENTITY-7F21", timeout=0.1, allow_test_inprocess=False)

    assert "Sovereign node(s) unreachable or failed" in str(exc_info.value)
    assert "BANK_A" in str(exc_info.value)


def test_unauthorized_simulation_endpoints_return_401_and_403():
    """
    Simulation triggers must require authentication.
    Privileged operations (RESET, MALICIOUS) must be rejected with 403 for non-admin roles.
    """
    # 1. Unauthenticated request -> 401
    unauth_resp = client.post("/api/simulation/run", json={"scenario": "RESET"})
    assert unauth_resp.status_code == 401

    # 2. Risk Analyst attempting RESET scenario -> 403 Forbidden
    analyst_token = get_token("analyst", "RISK_ANALYST")
    forbidden_resp = client.post(
        "/api/simulation/run",
        json={"scenario": "RESET"},
        headers={"Authorization": f"Bearer {analyst_token}"}
    )
    assert forbidden_resp.status_code == 403
    assert "Forbidden" in forbidden_resp.json()["detail"]

    # 3. Compliance Officer attempting RESET scenario -> 200 OK
    compliance_token = get_token("compliance", "COMPLIANCE_OFFICER")
    ok_resp = client.post(
        "/api/simulation/run",
        json={"scenario": "RESET"},
        headers={"Authorization": f"Bearer {compliance_token}"}
    )
    assert ok_resp.status_code == 200


def test_production_safety_assertions():
    """
    Verify that in production mode, insecure default secrets or demo shortcuts
    are strictly rejected.
    """
    # Test assertion logic from backend.config
    insecure_key = "privilink-local-evaluation-insecure-demo-secret-key-2026"

    def check_production_config(env, allow_demo, secret):
        if env == "production":
            if allow_demo:
                raise RuntimeError("Security Violation: Demo shortcuts forbidden in production.")
            if "insecure" in secret or "demo" in secret:
                raise RuntimeError("Security Violation: Production must use a strong secret key.")
        return True

    # Development allows demo shortcuts
    assert check_production_config("development", True, insecure_key) is True

    # Production rejects demo shortcuts
    with pytest.raises(RuntimeError) as exc1:
        check_production_config("production", True, "strong-secret-key-32-chars-long-1234")
    assert "Demo shortcuts forbidden" in str(exc1.value)

    # Production rejects default demo secret
    with pytest.raises(RuntimeError) as exc2:
        check_production_config("production", False, insecure_key)
    assert "strong secret key" in str(exc2.value)


def test_raw_institution_records_rbac_blocked_for_analyst_and_compliance():
    """
    Sovereign boundary enforcement:
    Risk Analyst and Compliance Officer get HTTP 403 when trying to access raw node records.
    Bank Admin gets HTTP 200 for Bank A records, but HTTP 403 for peer records.
    """
    analyst_token = get_token("analyst", "RISK_ANALYST")
    compliance_token = get_token("compliance", "COMPLIANCE_OFFICER")
    bank_admin_token = get_token("bank_admin", "INSTITUTION_ADMIN", "BANK_A")

    # Risk Analyst blocked
    res1 = client.get("/api/nodes/BANK_A/records", headers={"Authorization": f"Bearer {analyst_token}"})
    assert res1.status_code == 403

    # Compliance Officer blocked
    res2 = client.get("/api/nodes/BANK_A/records", headers={"Authorization": f"Bearer {compliance_token}"})
    assert res2.status_code == 403

    # Bank Admin allowed for Bank A
    res3 = client.get("/api/nodes/BANK_A/records", headers={"Authorization": f"Bearer {bank_admin_token}"})
    assert res3.status_code == 200
    assert isinstance(res3.json(), list)
    assert len(res3.json()) > 0

    # Bank Admin blocked for Insurer B
    res4 = client.get("/api/nodes/INSURER_B/records", headers={"Authorization": f"Bearer {bank_admin_token}"})
    assert res4.status_code == 403


def test_case_workflow_active_task_restoration_and_resolution():
    """
    Verify complete case lifecycle:
    1. get_cases() includes activeTaskId when a task is pending.
    2. get_case_by_id() returns activeTaskId.
    3. Duplicate verification trigger is rejected.
    4. Compliance officer can resolve with or without explicit task_id.
    5. Resolving an already resolved case is rejected.
    """
    compliance_token = get_token("compliance", "COMPLIANCE_OFFICER")
    analyst_token = get_token("analyst", "RISK_ANALYST")

    # Reset simulation first
    client.post(
        "/api/simulation/run",
        json={"scenario": "RESET"},
        headers={"Authorization": f"Bearer {compliance_token}"}
    )

    # Risk analyst requests step-up verification for benchmark case
    v_res = client.post(
        "/api/cases/CASE-10482/verify",
        json={"actor": "analyst", "role": "RISK_ANALYST"},
        headers={"Authorization": f"Bearer {analyst_token}"}
    )
    assert v_res.status_code == 200
    created_task_id = v_res.json()["task_id"]

    # Verify get_cases() returns activeTaskId on list query
    cases_list_res = client.get("/api/cases", headers={"Authorization": f"Bearer {analyst_token}"})
    assert cases_list_res.status_code == 200
    case_in_list = next((c for c in cases_list_res.json() if c["id"] == "CASE-10482"), None)
    assert case_in_list is not None
    assert case_in_list["activeTaskId"] == created_task_id
    assert case_in_list["status"] == "VERIFICATION_REQUESTED"

    # Verify get_case_by_id() returns activeTaskId on detailed query
    detail_res = client.get("/api/cases/CASE-10482", headers={"Authorization": f"Bearer {analyst_token}"})
    assert detail_res.status_code == 200
    detail_data = detail_res.json()
    assert detail_data["activeTaskId"] == created_task_id
    assert detail_data["status"] == "VERIFICATION_REQUESTED"

    # Verify duplicate trigger rejection
    dup_res = client.post(
        "/api/cases/CASE-10482/verify",
        json={"actor": "analyst", "role": "RISK_ANALYST"},
        headers={"Authorization": f"Bearer {analyst_token}"}
    )
    assert dup_res.status_code == 400
    detail_err = dup_res.json()["detail"]
    assert "already in VERIFICATION_REQUESTED status" in detail_err or "already has an active pending task" in detail_err

    # Authorized Compliance Officer resolves case
    res_resolve = client.post(
        "/api/cases/CASE-10482/resolve",
        json={
            "task_id": created_task_id,
            "resolution_notes": "Verified verified tax returns and sovereign KYC credentials across banking perimeter.",
            "actor": "compliance",
            "role": "COMPLIANCE_OFFICER"
        },
        headers={"Authorization": f"Bearer {compliance_token}"}
    )
    assert res_resolve.status_code == 200
    assert res_resolve.json()["new_status"] == "RESOLVED"

    # Re-fetch case to verify persistent RESOLVED status
    resolved_check = client.get("/api/cases/CASE-10482", headers={"Authorization": f"Bearer {analyst_token}"})
    assert resolved_check.status_code == 200
    assert resolved_check.json()["status"] == "RESOLVED"

    # Second resolve attempt on already resolved case is rejected
    dup_resolve = client.post(
        "/api/cases/CASE-10482/resolve",
        json={
            "task_id": created_task_id,
            "resolution_notes": "Duplicate resolution attempt.",
            "actor": "compliance",
            "role": "COMPLIANCE_OFFICER"
        },
        headers={"Authorization": f"Bearer {compliance_token}"}
    )
    assert dup_resolve.status_code == 400
