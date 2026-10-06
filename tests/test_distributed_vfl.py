"""
Tests for True Distributed Split Learning (Vertical Federated Learning).
Verifies sovereign node process isolation, partial logit computation,
privacy shielding (raw features never emitted), exact 100% contribution normalization,
and scenario escalation.
"""

import pytest
from backend.nodes.bank_node import BankNodeService
from backend.nodes.insurer_node import InsurerNodeService
from backend.nodes.lender_node import LenderNodeService
from backend.ml.vfl_engine import VFLEngine
from backend.services.simulation_service import SimulationService
from backend.services.case_service import CaseService


def test_sovereign_node_partial_logits():
    """
    Test that each sovereign node computes its local partial logit
    without exposing raw feature vectors outside its boundary.
    """
    bank_service = BankNodeService()
    ins_service = InsurerNodeService()
    lender_service = LenderNodeService()

    # Benchmark entity
    entity_ref = "ENTITY-7F21"

    b_res = bank_service.compute_partial_logit(entity_ref)
    assert b_res["institution_id"] == "BANK_A"
    assert "partial_logit" in b_res
    assert isinstance(b_res["partial_logit"], float)
    assert "local_probability" in b_res
    assert b_res["status"] == "COMPUTED"
    # Verify raw database columns are NOT exposed in inference response
    for forbidden in ["repayment_behaviour_ratio", "average_monthly_balance_tier", "transaction_velocity_anomaly"]:
        assert forbidden not in b_res

    i_res = ins_service.compute_partial_logit(entity_ref)
    assert i_res["institution_id"] == "INSURER_B"
    assert "partial_logit" in i_res
    assert isinstance(i_res["partial_logit"], float)
    for forbidden in ["claim_frequency_rate", "loss_ratio_exposure"]:
        assert forbidden not in i_res

    l_res = lender_service.compute_partial_logit(entity_ref)
    assert l_res["institution_id"] == "LENDER_C"
    assert "partial_logit" in l_res
    assert isinstance(l_res["partial_logit"], float)
    for forbidden in ["loan_application_velocity", "credit_utilization_trajectory"]:
        assert forbidden not in l_res


def test_vfl_predict_distributed_synthesis():
    """
    Test that coordinator combines partial logits and computes
    mathematically exact normalized contributions summing to 100%.
    """
    engine = VFLEngine()
    pred = engine.predict_distributed("ENTITY-7F21")

    assert "collaborative_probability" in pred
    assert "collaborative_confidence" in pred
    assert "risk_level" in pred
    assert pred["risk_level"] in ("HIGH", "MEDIUM", "LOW")
    assert 0.0 <= pred["collaborative_probability"] <= 1.0

    contributions = pred["contributions"]
    assert len(contributions) == 3
    total_score = sum(c["score"] for c in contributions)
    assert total_score == 100, f"Normalized contributions must sum to exactly 100%, got {total_score}%"

    assert "node_execution_telemetry" in pred
    telemetry = pred["node_execution_telemetry"]
    for inst in ["BANK_A", "INSURER_B", "LENDER_C"]:
        assert inst in telemetry
        assert "channel" in telemetry[inst]
        assert "partial_logit" in telemetry[inst]


def test_simulation_scenario_state_transition():
    """
    Test that running the cross-institution anomaly scenario triggers
    authentic model inference, escalates CASE-10482 in SQLite, and resets cleanly.
    """
    sim_service = SimulationService()
    case_service = CaseService()

    # 1. Reset first to guarantee baseline
    reset_res = sim_service.reset_simulation()
    assert reset_res["success"] is True

    base_case = case_service.get_case_by_id("CASE-10482")
    assert base_case["riskLevel"] == "MEDIUM"
    assert base_case["status"] == "PENDING_REVIEW"
    assert base_case["score"] == 42.0

    # 2. Run Anomaly Scenario
    scen_res = sim_service.run_cross_institution_anomaly()
    assert scen_res["scenario"] == "ANOMALY"
    assert "audit_hash" in scen_res
    assert len(scen_res["audit_hash"]) == 64

    # 3. Verify authoritative escalation in DB
    escalated_case = case_service.get_case_by_id("CASE-10482")
    assert escalated_case["riskLevel"] == "HIGH"
    assert escalated_case["status"] == "ESCALATED"
    assert escalated_case["score"] > 80.0
    assert sum(c["score"] for c in escalated_case["contributions"]) == 100

    # 4. Reset simulation back to clean baseline
    reset_res2 = sim_service.reset_simulation()
    assert reset_res2["success"] is True
    restored_case = case_service.get_case_by_id("CASE-10482")
    assert restored_case["riskLevel"] == "MEDIUM"
    assert restored_case["status"] == "PENDING_REVIEW"
