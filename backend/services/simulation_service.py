"""
PriviLink Simulation Service
Executes reproducible demonstration scenarios for hackathon presentations and testing.
Controls dynamic network state, quarantine flags, and case state transitions.
"""

import json
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from backend.config import COORDINATOR_DB_PATH
from backend.storage.audit_chain import AuditChain
from backend.storage.db import get_db_connection
from backend.ml.vfl_engine import VFLEngine


class SimulationService:
    def __init__(self, db_path=COORDINATOR_DB_PATH):
        self.db_path = db_path
        self.audit_chain = AuditChain(db_path)
        self.vfl_engine = VFLEngine()

    def get_network_state(self) -> Dict[str, Any]:
        with get_db_connection(self.db_path) as conn:
            cursor = conn.execute("SELECT * FROM network_state WHERE key = 'global_state'")
            row = cursor.fetchone()
            if row:
                return json.loads(row["value_json"])

        default_state = {
            "round": 27,
            "quarantined_lender": False,
            "connected_institutions": 3,
            "privacy_epsilon": 1.5,
            "active_scenario": "NORMAL"
        }
        self.save_network_state(default_state)
        return default_state

    def save_network_state(self, state: Dict[str, Any]) -> None:
        now = datetime.now(timezone.utc).isoformat()
        with get_db_connection(self.db_path) as conn:
            conn.execute("""
                INSERT OR REPLACE INTO network_state (key, value_json, updated_at)
                VALUES ('global_state', ?, ?)
            """, (json.dumps(state), now))
            conn.commit()

    def run_normal_baseline(self) -> Dict[str, Any]:
        state = self.get_network_state()
        state["active_scenario"] = "NORMAL"
        self.save_network_state(state)

        t = datetime.now().strftime("%H:%M:%S")
        timeline = [
            {"time": t, "label": "Initiating baseline synchronization", "status": "done", "detail": "All 3 participant nodes online and healthy"},
            {"time": t, "label": "Local model checks executed", "status": "done", "detail": "Bank A, Insurer B, Lender C passed gradient variance test"},
            {"time": t, "label": "Zero-knowledge aggregation complete", "status": "done", "detail": "Global model weights updated without error (Round 27)"},
            {"time": t, "label": "Risk Telemetry: 100% Nominal", "status": "done", "detail": "Zero unexpected escalations across population"}
        ]
        return {"scenario": "NORMAL", "timeline": timeline, "state": state}

    def run_cross_institution_anomaly(self) -> Dict[str, Any]:
        """
        Escalates benchmark CASE-10482 based on collaborative synthesis.
        Performs genuine model inference from VFLEngine and logs SHA-256 audit event.
        """
        now = datetime.now(timezone.utc).isoformat()
        t = datetime.now().strftime("%H:%M:%S")

        # Multi-institutional feature record for CASE-10482 in anomaly scenario
        anomaly_features = {
            "id": "CUST-10482",
            "bank_repayment_behaviour_ratio": 0.82,
            "bank_transaction_velocity_anomaly": 2.1,
            "bank_account_tenure_months": 18,
            "bank_average_monthly_balance_tier": 2,
            "bank_payment_consistency_index": 0.74,
            "ins_claim_frequency_rate": 3.2,
            "ins_claim_anomaly_score": 72.0,
            "ins_policy_tenure_days": 140,
            "ins_loss_ratio_exposure": 1.85,
            "ins_policy_behaviour_tier": "Watch",
            "lender_loan_application_velocity": 3,
            "lender_repayment_stress_indicator": 78.0,
            "lender_borrowing_behaviour_deviation": 0.81,
            "lender_credit_utilization_trajectory": 84.0,
            "lender_dti_synthetic_band": "Tier D"
        }

        # 1. Update sovereign records across participant nodes via authenticated RPC
        from backend.config import (
            BANK_A_URL, INSURER_B_URL, LENDER_C_URL,
            INTERNAL_SERVICE_KEY, PRIVILINK_ENV, PRIVILINK_MODE
        )
        is_test_adapter_allowed = (
            PRIVILINK_ENV != "production" and (
                PRIVILINK_MODE == "test_inprocess"
            )
        )

        node_mutations = [
            ("BANK_A", BANK_A_URL, "backend.nodes.bank_node", "BankNodeService", {
                "repayment_behaviour_ratio": 0.82,
                "transaction_velocity_anomaly": 2.1,
                "local_flag": "Weak Anomaly"
            }),
            ("INSURER_B", INSURER_B_URL, "backend.nodes.insurer_node", "InsurerNodeService", {
                "claim_frequency_rate": 3.2,
                "claim_anomaly_score": 72.0,
                "local_flag": "Weak Anomaly"
            }),
            ("LENDER_C", LENDER_C_URL, "backend.nodes.lender_node", "LenderNodeService", {
                "loan_application_velocity": 3,
                "repayment_stress_indicator": 78.0,
                "credit_utilization_trajectory": 84.0,
                "local_flag": "Weak Anomaly"
            })
        ]

        import httpx
        for inst_id, base_url, mod_path, cls_name, updates in node_mutations:
            if is_test_adapter_allowed:
                import importlib
                mod = importlib.import_module(mod_path)
                cls = getattr(mod, cls_name)
                cls().update_record("ENTITY-7F21", updates)
                continue

            success = False
            try:
                with httpx.Client(timeout=1.0) as client:
                    resp = client.post(
                        f"{base_url}/demo/inject-anomaly",
                        json={"entity_ref": "ENTITY-7F21", "updates": updates},
                        headers={"X-Internal-Service-Key": INTERNAL_SERVICE_KEY}
                    )
                    if resp.status_code == 200:
                        success = True
            except Exception:
                pass

            if not success:
                from fastapi import HTTPException
                raise HTTPException(
                    status_code=503,
                    detail=f"Distributed scenario aborted: Sovereign participant node {inst_id} at {base_url} is unreachable."
                )

        # 2. Run distributed VFL model inference across sovereign nodes (fails if any node is unreachable)
        if self.vfl_engine.vfl_model is None:
            self.vfl_engine.train_and_evaluate()

        prediction = self.vfl_engine.predict_distributed("ENTITY-7F21")
        score = float(prediction["score"])
        confidence = score
        risk_level = prediction["risk_level"]
        contributions = prediction["contributions"]

        # Escalate CASE-10482 in database with real model outputs
        with get_db_connection(self.db_path) as conn:
            conn.execute("""
                UPDATE cases
                SET risk_level = ?,
                    score = ?,
                    confidence = ?,
                    action = 'Step-up verification',
                    status = 'ESCALATED',
                    last_escalation = 'Just now',
                    contributions_json = ?,
                    updated_at = ?
                WHERE id = 'CASE-10482'
            """, (risk_level, score, confidence, json.dumps(contributions), now))

            conn.execute("""
                INSERT INTO case_history (case_id, timestamp, action, actor, details, previous_status, new_status)
                VALUES ('CASE-10482', ?, 'COLLABORATIVE_ESCALATION', 'VFL_INFERENCE_ENGINE',
                        '3 independent weak signals aligned across Bank, Insurer, and Lender.', 'NORMAL_PROCESSING', 'ESCALATED')
            """, (now,))
            conn.commit()

        # Append to Audit Ledger
        audit = self.audit_chain.append_event(
            actor="VFL_INFERENCE_ENGINE",
            role="SYSTEM",
            action="COLLABORATIVE_ANOMALY_ESCALATION",
            target_id="CASE-10482",
            details=f"Cross-institution pattern escalated for CASE-10482 via model inference: {risk_level} (Score {score}%).",
            institution="PriviLink Network",
            privacy_status="Zero-Knowledge Synthesis",
            result=f"{risk_level} Risk ({score}%)"
        )

        timeline = [
            {"time": t, "label": "Bank A processes local data", "status": "done", "detail": "Bank notes mild repayment delay (+6d) — alone below alarm threshold"},
            {"time": t, "label": "Insurer B processes local data", "status": "done", "detail": "Insurer notes recent borderline claim — alone below alarm threshold"},
            {"time": t, "label": "Lender C processes local data", "status": "done", "detail": "Lender notes two inquiries — alone below alarm threshold"},
            {"time": t, "label": "Privacy-preserving signals generated", "status": "done", "detail": "Differentially private latent embeddings broadcast (epsilon=1.5)"},
            {"time": t, "label": "Secure aggregation initiated", "status": "done", "detail": "Blinded aggregation computes cosine cross-similarity"},
            {"time": t, "label": "Cross-institution pattern detected!", "status": "warning", "detail": "CORRELATION DISCOVERED: 3 independent weak signals aligned"},
            {"time": t, "label": "Risk score escalated: CASE-10482", "status": "danger", "detail": f"Risk updated to {risk_level} (Confidence: {score}%)"},
            {"time": t, "label": "Explainable risk result generated", "status": "done", "detail": "Step-up verification advisory dispatched to analyst HUD"}
        ]

        state = self.get_network_state()
        state["active_scenario"] = "ANOMALY"
        self.save_network_state(state)

        return {
            "scenario": "ANOMALY",
            "target_case_id": "CASE-10482",
            "timeline": timeline,
            "audit_hash": audit["hash"],
            "state": state,
            "prediction": prediction
        }

    def run_privacy_attack_demo(self) -> Dict[str, Any]:
        t = datetime.now().strftime("%H:%M:%S")
        timeline = [
            {"time": t, "label": "Adversary launches Deep Leakage from Gradients (DLG)", "status": "warning", "detail": "Attempting to reconstruct training samples from gradient"},
            {"time": t, "label": "Differential Privacy barrier engaged", "status": "done", "detail": "Gaussian noise sigma=1.0 scrambles exact feature gradients"},
            {"time": t, "label": "Secure aggregation shielding active", "status": "done", "detail": "Adversary cannot isolate individual institution vector"},
            {"time": t, "label": "Reconstruction attack defeated", "status": "done", "detail": "Reconstruction error: 99.4% (Information leakage mathematically bounded)"}
        ]
        audit = self.audit_chain.append_event(
            actor="DEFENSE_MONITOR",
            role="SYSTEM",
            action="INFERENCE_ATTACK_MITIGATION",
            target_id="GLOBAL_MODEL_ROUND_27",
            details="Gradient inversion attack thwarted via DP Gaussian noise and pairwise blinding.",
            institution="PriviLink Network",
            privacy_status="Differential Privacy Active",
            result="Attack Defeated"
        )
        return {"scenario": "ATTACK", "timeline": timeline, "audit_hash": audit["hash"]}

    def run_malicious_participant_sim(self) -> Dict[str, Any]:
        """Triggers Byzantine outlier detection, slashing Lender C's trust score and isolating it."""
        t = datetime.now().strftime("%H:%M:%S")
        state = self.get_network_state()
        state["quarantined_lender"] = True
        state["active_scenario"] = "MALICIOUS"
        self.save_network_state(state)

        timeline = [
            {"time": t, "label": "Lender C submits abnormal gradient update", "status": "warning", "detail": "Gradient norm ||W_C|| = 14.8 (Threshold = 1.0)"},
            {"time": t, "label": "Byzantine anomaly detector triggered", "status": "danger", "detail": "Outlier gradient detected via coordinate-wise median filter"},
            {"time": t, "label": "Participant contribution reduced to 0%", "status": "danger", "detail": "Lender C trust score slashed: 89% -> 63%"},
            {"time": t, "label": "Lender C quarantined for forensic review", "status": "warning", "detail": "Status: Potentially compromised / anomalous participant"},
            {"time": t, "label": "Collaborative model protected", "status": "done", "detail": "Global Round 27 completed without corrupted weights"}
        ]

        audit = self.audit_chain.append_event(
            actor="BYZANTINE_FILTER",
            role="SYSTEM",
            action="PARTICIPANT_QUARANTINE",
            target_id="LENDER_C",
            details="Lender C submitted abnormal gradient update (Norm 14.8 > 1.0). Quarantined from aggregation.",
            institution="LENDER_C",
            privacy_status="Byzantine Filtering Active",
            result="Quarantined (Norm 14.8 > 1.0)"
        )

        return {"scenario": "MALICIOUS", "timeline": timeline, "audit_hash": audit["hash"], "state": state}

    def reset_simulation(self) -> Dict[str, Any]:
        """Restores demo state to initial clean baseline."""
        state = self.get_network_state()
        state["quarantined_lender"] = False
        state["active_scenario"] = "NORMAL"
        self.save_network_state(state)

        # Reset sovereign records across participant nodes
        from backend.config import (
            BANK_A_URL, INSURER_B_URL, LENDER_C_URL,
            INTERNAL_SERVICE_KEY, PRIVILINK_ENV, PRIVILINK_MODE
        )
        is_test_adapter_allowed = (
            PRIVILINK_ENV != "production" and (
                PRIVILINK_MODE == "test_inprocess"
            )
        )

        reset_mutations = [
            ("BANK_A", BANK_A_URL, "backend.nodes.bank_node", "BankNodeService", {
                "repayment_behaviour_ratio": 0.78,
                "transaction_velocity_anomaly": 0.8,
                "local_flag": "Normal"
            }),
            ("INSURER_B", INSURER_B_URL, "backend.nodes.insurer_node", "InsurerNodeService", {
                "claim_frequency_rate": 0.55,
                "claim_anomaly_score": 42.0,
                "local_flag": "Normal"
            }),
            ("LENDER_C", LENDER_C_URL, "backend.nodes.lender_node", "LenderNodeService", {
                "loan_application_velocity": 2,
                "repayment_stress_indicator": 48.0,
                "credit_utilization_trajectory": 58.0,
                "local_flag": "Normal"
            })
        ]

        import httpx
        for inst_id, base_url, mod_path, cls_name, updates in reset_mutations:
            if is_test_adapter_allowed:
                import importlib
                mod = importlib.import_module(mod_path)
                cls = getattr(mod, cls_name)
                cls().update_record("ENTITY-7F21", updates)
                continue

            try:
                with httpx.Client(timeout=1.0) as client:
                    client.post(
                        f"{base_url}/demo/inject-anomaly",
                        json={"entity_ref": "ENTITY-7F21", "updates": updates},
                        headers={"X-Internal-Service-Key": INTERNAL_SERVICE_KEY}
                    )
            except Exception:
                pass

        # Reset CASE-10482 to baseline review
        now = datetime.now(timezone.utc).isoformat()
        with get_db_connection(self.db_path) as conn:
            conn.execute("""
                UPDATE cases
                SET risk_level = 'MEDIUM',
                    score = 42.0,
                    confidence = 42.0,
                    action = 'Standard monitoring',
                    status = 'PENDING_REVIEW',
                    last_escalation = '14m ago',
                    updated_at = ?
                WHERE id = 'CASE-10482'
            """, (now,))
            conn.execute("""
                UPDATE verification_tasks
                SET status = 'CANCELLED', notes = 'Cancelled by simulation reset'
                WHERE case_id = 'CASE-10482' AND status = 'REQUESTED'
            """)
            conn.commit()

        return {"success": True, "message": "Demo state reset to baseline.", "state": state}
