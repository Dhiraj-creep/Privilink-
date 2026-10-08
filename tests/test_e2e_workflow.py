"""
TRUSTMESH End-to-End Core Workflow Smoke Test
Validates the complete 6-stage user journey and security boundaries:
1. Institution collaboration & cluster health check
2. Permitted entity matching (Diffie-Hellman PSI)
3. Collaborative risk inference (Split Learning / VFL)
4. Case investigation (Feature attribution & Minimum Necessary Disclosure)
5. Accountable action (Step-Up Verification & Resolution with SQLite persistence)
6. Cryptographic audit chain verification & sandbox tamper detection
7. Strict Institutional RBAC Boundary Enforcement (HTTP 403 on peer ledgers)
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.auth.security import DEMO_USERS, create_session_token

client = TestClient(app)


def get_token_for(username: str) -> str:
    user = next((u for u in DEMO_USERS if u["username"] == username), None)
    assert user is not None, f"Demo user {username} not found"
    return create_session_token(user)


def test_e2e_full_workflow():
    analyst_token = get_token_for("analyst")
    compliance_token = get_token_for("compliance")
    bank_admin_token = get_token_for("bank_admin")
    insurer_admin_token = get_token_for("insurer_admin")

    # -------------------------------------------------------------
    # 1. INSTITUTION COLLABORATION & CLUSTER HEALTH
    # -------------------------------------------------------------
    health_res = client.get("/api/health")
    assert health_res.status_code == 200
    assert health_res.json()["status"] == "healthy"

    cluster_res = client.get("/api/health/cluster")
    assert cluster_res.status_code == 200
    cluster_data = cluster_res.json()
    assert cluster_data["coordinator"]["status"] == "ONLINE"
    assert "BANK_A" in cluster_data["nodes"]
    assert "INSURER_B" in cluster_data["nodes"]
    assert "LENDER_C" in cluster_data["nodes"]

    # -------------------------------------------------------------
    # 2. PERMITTED ENTITY MATCHING (DIFFIE-HELLMAN PSI)
    # -------------------------------------------------------------
    psi_res = client.post("/api/crypto/psi/simulate", json={
        "party_a": "BANK_A",
        "party_b": "INSURER_B",
        "sample_size": 25
    })
    assert psi_res.status_code == 200
    psi_data = psi_res.json()
    assert psi_data["intersection_size"] >= 3
    assert len(psi_data["intersection_canonical_tokens"]) >= 3
    assert "leakage_guarantee" in psi_data

    # -------------------------------------------------------------
    # 3. COLLABORATIVE RISK INFERENCE (VFL / Split Learning)
    # -------------------------------------------------------------
    # Initial state of benchmark case
    case_initial_res = client.get(
        "/api/cases/CASE-10482",
        headers={"Authorization": f"Bearer {analyst_token}"}
    )
    assert case_initial_res.status_code == 200

    # Run anomaly synthesis scenario
    sim_res = client.post(
        "/api/simulation/run",
        json={"scenario": "ANOMALY"},
        headers={"Authorization": f"Bearer {analyst_token}"}
    )
    assert sim_res.status_code == 200
    sim_data = sim_res.json()
    assert sim_data["scenario"] == "ANOMALY"

    # Verify CASE-10482 escalated after collaborative synthesis
    case_after_sim = client.get(
        "/api/cases/CASE-10482",
        headers={"Authorization": f"Bearer {analyst_token}"}
    )
    assert case_after_sim.status_code == 200
    case_data = case_after_sim.json()
    assert case_data["riskLevel"] == "HIGH"
    assert case_data["score"] > 80.0

    # -------------------------------------------------------------
    # 4. CASE INVESTIGATION (Feature Attribution & Disclosure)
    # -------------------------------------------------------------
    # Verify 3 sovereign signal partitions are present
    assert "bank" in case_data["localEvidence"]
    assert "insurer" in case_data["localEvidence"]
    assert "lender" in case_data["localEvidence"]

    # Verify minimum disclosure rules
    assert "disclosedToAnalyst" in case_data["minimumDisclosure"]
    assert "strictlyProtected" in case_data["minimumDisclosure"]
    assert len(case_data["minimumDisclosure"]["strictlyProtected"]) > 0

    # -------------------------------------------------------------
    # 5. ACCOUNTABLE ACTION (Step-Up Verification & Resolution)
    # -------------------------------------------------------------
    # Reset case to standard monitoring if needed
    client.post(
        "/api/simulation/run",
        json={"scenario": "RESET"},
        headers={"Authorization": f"Bearer {compliance_token}"}
    )

    # Trigger Step-Up Verification as Risk Analyst
    verify_res = client.post(
        "/api/cases/CASE-10482/verify",
        json={"actor": "analyst", "role": "RISK_ANALYST"},
        headers={"Authorization": f"Bearer {analyst_token}"}
    )
    assert verify_res.status_code == 200
    verify_data = verify_res.json()
    assert verify_data["new_status"] == "VERIFICATION_REQUESTED"
    task_id = verify_data["task_id"]
    assert task_id.startswith("TASK-CASE-10482")

    # Verify case state persisted in coordinator database
    case_check = client.get(
        "/api/cases/CASE-10482",
        headers={"Authorization": f"Bearer {analyst_token}"}
    )
    assert case_check.json()["status"] == "VERIFICATION_REQUESTED"

    # Unauthorized role (e.g. Risk Analyst) cannot resolve case (RBAC check)
    unauth_resolve = client.post(
        "/api/cases/CASE-10482/resolve",
        json={
            "task_id": task_id,
            "resolution_notes": "Attempt by analyst to self-resolve",
            "actor": "analyst",
            "role": "RISK_ANALYST"
        },
        headers={"Authorization": f"Bearer {analyst_token}"}
    )
    assert unauth_resolve.status_code == 403

    # Authorized Compliance Officer resolves case
    resolve_res = client.post(
        "/api/cases/CASE-10482/resolve",
        json={
            "task_id": task_id,
            "resolution_notes": "Customer submitted verified payroll proof & KYC documentation.",
            "actor": "compliance",
            "role": "COMPLIANCE_OFFICER"
        },
        headers={"Authorization": f"Bearer {compliance_token}"}
    )
    assert resolve_res.status_code == 200
    assert resolve_res.json()["new_status"] == "RESOLVED"

    # Verify persistent RESOLVED status
    case_resolved = client.get(
        "/api/cases/CASE-10482",
        headers={"Authorization": f"Bearer {analyst_token}"}
    )
    assert case_resolved.json()["status"] == "RESOLVED"

    # -------------------------------------------------------------
    # 6. AUDIT CHAIN VERIFICATION & SANDBOX TAMPER DETECTION
    # -------------------------------------------------------------
    # Operational ledger verification: Genesis to Head
    audit_verify_res = client.get("/api/audit/verify")
    assert audit_verify_res.status_code == 200
    assert audit_verify_res.json()["valid"] is True
    assert audit_verify_res.json()["total_events"] >= 5

    # Sandbox Tamper Detection Test
    sandbox_tamper = client.post(
        "/api/audit/sandbox/tamper",
        json={"target_idx": 1},
        headers={"Authorization": f"Bearer {compliance_token}"}
    )
    assert sandbox_tamper.status_code == 200

    sandbox_verify = client.get("/api/audit/sandbox/verify")
    assert sandbox_verify.status_code == 200
    assert sandbox_verify.json()["valid"] is False
    assert "broken_index" in sandbox_verify.json()

    # Reset Sandbox
    sandbox_reset = client.post(
        "/api/audit/sandbox/reset",
        headers={"Authorization": f"Bearer {compliance_token}"}
    )
    assert sandbox_reset.status_code == 200

    sandbox_verify_after = client.get("/api/audit/sandbox/verify")
    assert sandbox_verify_after.status_code == 200
    assert sandbox_verify_after.json()["valid"] is True

    # -------------------------------------------------------------
    # 7. STRICT INSTITUTIONAL BOUNDARY ENFORCEMENT (HTTP 403)
    # -------------------------------------------------------------
    # Bank Admin CAN access Bank A records
    bank_own = client.get(
        "/api/nodes/BANK_A/records",
        headers={"Authorization": f"Bearer {bank_admin_token}"}
    )
    assert bank_own.status_code == 200

    # Bank Admin CANNOT access Insurer B records -> HTTP 403
    bank_cross = client.get(
        "/api/nodes/INSURER_B/records",
        headers={"Authorization": f"Bearer {bank_admin_token}"}
    )
    assert bank_cross.status_code == 403

    # Insurer Admin CANNOT access Lender C records -> HTTP 403
    insurer_cross = client.get(
        "/api/nodes/LENDER_C/records",
        headers={"Authorization": f"Bearer {insurer_admin_token}"}
    )
    assert insurer_cross.status_code == 403
