"""
Tests for Case Workflow, Step-Up Verification, and Dynamic Disclosures.
Verifies case listing, detail retrieval, escalation, task creation, and dynamic disclosure matrices.
"""

import pytest
from fastapi.testclient import TestClient
from backend.auth.security import DEMO_USERS, create_session_token
from backend.main import app

client = TestClient(app)

# Helper tokens for different roles
analyst_user = next(u for u in DEMO_USERS if u["username"] == "analyst")
analyst_token = create_session_token(analyst_user)
analyst_headers = {"Authorization": f"Bearer {analyst_token}"}

compliance_user = next(u for u in DEMO_USERS if u["username"] == "compliance")
compliance_token = create_session_token(compliance_user)
compliance_headers = {"Authorization": f"Bearer {compliance_token}"}


def test_case_list_and_filters():
    # 1. Missing auth returns 401 Unauthorized
    unauth_res = client.get("/api/cases?risk=ALL")
    assert unauth_res.status_code == 401

    # 2. Authenticated request succeeds
    res = client.get("/api/cases?risk=ALL", headers=analyst_headers)
    assert res.status_code == 200
    cases = res.json()
    assert len(cases) >= 6

    # 3. Test filtering by HIGH
    res_high = client.get("/api/cases?risk=HIGH", headers=analyst_headers)
    assert res_high.status_code == 200
    for c in res_high.json():
        assert c["riskLevel"] == "HIGH"


def test_dynamic_disclosure_matrix_accuracy():
    """Verify CASE-10491 (LOW risk) shows LOW risk disclosures, not hardcoded HIGH values."""
    res = client.get("/api/cases/CASE-10491", headers=analyst_headers)
    assert res.status_code == 200
    case = res.json()

    assert case["riskLevel"] == "LOW"
    disclosed = case["minimumDisclosure"]["disclosedToAnalyst"]
    # Verify no hardcoded HIGH / 87% in disclosure
    assert any("LOW" in line for line in disclosed)
    assert not any("HIGH (87%)" in line for line in disclosed)


def test_step_up_verification_workflow():
    """Verify triggering step-up verification updates case status and creates persistent task."""
    # Reset case to NORMAL_PROCESSING before testing if needed
    # Compliance officer cannot trigger step-up verification (strictly Analyst/Admin)
    res_forbidden = client.post(
        "/api/cases/CASE-10482/verify",
        json={"actor": "COMPLIANCE_OFFICER", "role": "COMPLIANCE_OFFICER"},
        headers=compliance_headers
    )
    assert res_forbidden.status_code == 403

    # Analyst triggers step-up verification
    res = client.post(
        "/api/cases/CASE-10482/verify",
        json={"actor": "RISK_ANALYST", "role": "RISK_ANALYST"},
        headers=analyst_headers
    )
    assert res.status_code in (200, 400)  # 400 if already in VERIFICATION_REQUESTED

    # Re-fetch case to verify persistent state
    res_detail = client.get("/api/cases/CASE-10482", headers=analyst_headers)
    c = res_detail.json()
    assert c["status"] == "VERIFICATION_REQUESTED"
    assert c["verificationTask"] is not None
    assert c["verificationTask"]["status"] == "REQUESTED"
    task_id = c["verificationTask"]["id"]

    # Analyst cannot resolve case (strictly Compliance/Admin)
    res_analyst_resolve = client.post(
        "/api/cases/CASE-10482/resolve",
        json={
            "task_id": task_id,
            "resolution_notes": "Attempted resolution by analyst.",
            "actor": "RISK_ANALYST"
        },
        headers=analyst_headers
    )
    assert res_analyst_resolve.status_code == 403

    # Attempt resolution with invalid task ID returns 400
    res_invalid_task = client.post(
        "/api/cases/CASE-10482/resolve",
        json={
            "task_id": "TASK-INVALID-9999",
            "resolution_notes": "Attempt with invalid task ID.",
            "actor": "COMPLIANCE_OFFICER"
        },
        headers=compliance_headers
    )
    assert res_invalid_task.status_code == 400

    # Authorized Compliance Officer resolves case
    res_resolve = client.post(
        "/api/cases/CASE-10482/resolve",
        json={
            "task_id": task_id,
            "resolution_notes": "Customer submitted satisfactory proof of funds.",
            "actor": "COMPLIANCE_OFFICER"
        },
        headers=compliance_headers
    )
    assert res_resolve.status_code == 200
    assert res_resolve.json()["status"] == "RESOLVED"

    # Verify audit event was logged
    audit_res = client.get("/api/audit/logs?limit=5")
    latest_event = audit_res.json()[0]
    assert latest_event["target_id"] == "CASE-10482"
    assert "RESOLVE_VERIFICATION" in latest_event["action"]


def test_simulation_scenario_escalation():
    """Verify running cross-institution anomaly scenario transitions CASE-10482 to HIGH."""
    res = client.post("/api/simulation/run", json={"scenario": "ANOMALY"})
    assert res.status_code == 200
    data = res.json()
    assert data["target_case_id"] == "CASE-10482"

    # Re-fetch case with authenticated token
    res_case = client.get("/api/cases/CASE-10482", headers=analyst_headers)
    assert res_case.status_code == 200
    c = res_case.json()
    assert c["riskLevel"] == "HIGH"
    assert c["score"] >= 80.0
