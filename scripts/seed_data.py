"""
TRUSTMESH Seed & Reset Script
Populates coordinator database, independent participant node databases (Bank A, Insurer B, Lender C),
trains the VFL model, evaluates real metrics, and generates a tamper-evident audit ledger.
Run anytime to restore the judges' demo to a known, pristine state.
"""

import json
import sqlite3
from datetime import datetime, timezone
import sys
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.auth.security import DEMO_USERS, hash_password
from backend.config import (
    BANK_A_DB_PATH,
    COORDINATOR_DB_PATH,
    INSURER_B_DB_PATH,
    LENDER_C_DB_PATH,
)
from backend.ml.dataset_generator import generate_synthetic_data
from backend.ml.vfl_engine import VFLEngine
from backend.storage.audit_chain import AuditChain
from backend.storage.db import (
    get_db_connection,
    init_all_databases,
)


def seed_databases():
    print("[1/5] Initializing database schemas...")
    init_all_databases()

    print("[2/5] Generating vertically partitioned synthetic data...")
    full_df, partitions = generate_synthetic_data()

    # Populate Bank A node
    print("      Populating Bank A sovereign database...")
    bank_df = partitions["BANK_A"]
    with get_db_connection(BANK_A_DB_PATH) as conn:
        conn.execute("DELETE FROM bank_customers")
        for _, row in bank_df.iterrows():
            conn.execute("""
                INSERT INTO bank_customers (
                    id, customer_ref, entity_ref, repayment_behaviour_ratio,
                    transaction_velocity_anomaly, account_tenure_months,
                    average_monthly_balance_tier, payment_consistency_index,
                    inward_outward_ratio, local_flag
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                row["node_id"], row["id"], row["entity_ref"],
                row["bank_repayment_behaviour_ratio"], row["bank_transaction_velocity_anomaly"],
                row["bank_account_tenure_months"], row["bank_average_monthly_balance_tier"],
                row["bank_payment_consistency_index"], row["bank_inward_outward_ratio"],
                row["bank_local_flag"]
            ))
        conn.commit()

    # Populate Insurer B node
    print("      Populating Insurer B sovereign database...")
    ins_df = partitions["INSURER_B"]
    with get_db_connection(INSURER_B_DB_PATH) as conn:
        conn.execute("DELETE FROM insurer_policies")
        for _, row in ins_df.iterrows():
            conn.execute("""
                INSERT INTO insurer_policies (
                    id, customer_ref, entity_ref, claim_frequency_rate,
                    claim_anomaly_score, policy_behaviour_tier,
                    policy_tenure_days, loss_ratio_exposure, local_flag
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                row["node_id"], row["id"], row["entity_ref"],
                row["ins_claim_frequency_rate"], row["ins_claim_anomaly_score"],
                row["ins_policy_behaviour_tier"], row["ins_policy_tenure_days"],
                row["ins_loss_ratio_exposure"], row["ins_local_flag"]
            ))
        conn.commit()

    # Populate Lender C node
    print("      Populating Lender C sovereign database...")
    lender_df = partitions["LENDER_C"]
    with get_db_connection(LENDER_C_DB_PATH) as conn:
        conn.execute("DELETE FROM lender_facilities")
        for _, row in lender_df.iterrows():
            conn.execute("""
                INSERT INTO lender_facilities (
                    id, customer_ref, entity_ref, loan_application_velocity,
                    repayment_stress_indicator, borrowing_behaviour_deviation,
                    credit_utilization_trajectory, dti_synthetic_band, local_flag
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                row["node_id"], row["id"], row["entity_ref"],
                row["lender_loan_application_velocity"], row["lender_repayment_stress_indicator"],
                row["lender_borrowing_behaviour_deviation"], row["lender_credit_utilization_trajectory"],
                row["lender_dti_synthetic_band"], row["lender_local_flag"]
            ))
        conn.commit()

    print("[3/5] Training Vertical Federated Learning (VFL) model on partitions...")
    engine = VFLEngine()
    eval_results = engine.train_and_evaluate()
    print(f"      VFL Evaluation complete: Collaborative PR-AUC={eval_results['globalMetrics']['prAuc']}, ROC-AUC={eval_results['globalMetrics']['rocAuc']}")

    print("[4/5] Populating Coordinator cases and users...")
    now = datetime.now(timezone.utc).isoformat()

    # Seed benchmark cases
    benchmark_cases = [
        {
            "id": "CASE-10482",
            "customer_id": "CUSTOMER-10482",
            "entity_ref": "ENTITY-7F21",
            "risk_level": "MEDIUM",  # Starts in baseline state; escalates to HIGH in simulation scenario
            "confidence": 42.0,
            "score": 42.0,
            "action": "Standard monitoring",
            "status": "PENDING_REVIEW",
            "last_escalation": "14 mins ago",
            "explanation": "Multiple weak, independent signals observed across banking, insurance, and lending vectors.",
            "local_evidence": {
                "bank": {
                    "signalText": "Repayment behaviour changed mildly.",
                    "severity": "Weak / Moderate (Score: 0.42)",
                    "detail": "Mild variance in usual payment date (+6 days), but still within standard grace window."
                },
                "insurer": {
                    "signalText": "Privacy-preserving external anomaly signal received.",
                    "severity": "Weak / Inconclusive (Score: 0.38)",
                    "detail": "Recent first-time claim submission following policy update, borderline deviation score."
                },
                "lender": {
                    "signalText": "Borrowing behaviour differs from historical baseline.",
                    "severity": "Weak / Emerging (Score: 0.45)",
                    "detail": "Two short-term facility inquiries within 14 days; standalone lender threshold not breached."
                }
            },
            "contributions": [
                {"name": "Local financial behaviour", "score": 35, "color": "#12372A"},
                {"name": "Cross-institution signal alignment", "score": 28, "color": "#2F6B4F"},
                {"name": "Behavioural deviation index", "score": 25, "color": "#8FAF9D"},
                {"name": "Temporal anomaly velocity", "score": 12, "color": "#66736B"}
            ],
            "disclosure": {
                "disclosedToAnalyst": [
                    "Composite Risk Score: MEDIUM (42%) -> Candidate for cross-institution synthesis",
                    "Primary Risk Archetype: Independent multi-vector signal alignment",
                    "Recommended Protocol: Standard monitoring until federated round evaluates"
                ],
                "strictlyProtected": [
                    "Customer Legal Name, National ID, Phone, Email, Residential Address",
                    "Specific Bank Account numbers, exact transactional counter-parties and balances",
                    "Insurer claim documentation, medical/property details, policy payout amounts",
                    "Lending contract agreements, specific repayment calendar dates, employer references"
                ]
            }
        },
        {
            "id": "CASE-10491",
            "customer_id": "CUSTOMER-10491",
            "entity_ref": "ENTITY-3A09",
            "risk_level": "LOW",
            "confidence": 96.0,
            "score": 12.0,
            "action": "Normal processing",
            "status": "NORMAL_PROCESSING",
            "last_escalation": "18 mins ago",
            "explanation": "All institutions reflect baseline transactional and underwriting consistency.",
            "local_evidence": {
                "bank": {"signalText": "Repayment regular, liquidity healthy.", "severity": "Normal", "detail": "Consistent deposits."},
                "insurer": {"signalText": "Zero recent claim activities.", "severity": "Normal", "detail": "Tenured policyholder."},
                "lender": {"signalText": "Zero unusual credit inquiries.", "severity": "Normal", "detail": "Low debt utilization."}
            },
            "contributions": [
                {"name": "Local financial behaviour", "score": 70, "color": "#3F7D5A"},
                {"name": "Cross-institution consistency", "score": 20, "color": "#2F6B4F"},
                {"name": "Historical stability", "score": 10, "color": "#8FAF9D"}
            ],
            # Dynamically matching LOW risk disclosure matrix!
            "disclosure": {
                "disclosedToAnalyst": [
                    "Composite Risk Score: LOW (Confidence: 96%)",
                    "Primary Archetype: Consistent multi-institutional stability",
                    "Workflow: Automated straight-through clearance"
                ],
                "strictlyProtected": [
                    "Customer Legal Name, National ID, Phone, Email, Residential Address",
                    "All underlying account numbers, transactions, and insurance records"
                ]
            }
        },
        {
            "id": "CASE-10503",
            "customer_id": "CUSTOMER-10503",
            "entity_ref": "ENTITY-9D44",
            "risk_level": "MEDIUM",
            "confidence": 74.0,
            "score": 52.0,
            "action": "Additional verification",
            "status": "PENDING_REVIEW",
            "last_escalation": "26 mins ago",
            "explanation": "Bank deposit velocity drop paired with lender credit utilization escalation.",
            "local_evidence": {
                "bank": {"signalText": "Deposit regularity softened.", "severity": "Moderate (0.51)", "detail": "Intermittent income cadence."},
                "insurer": {"signalText": "No anomalous claim records.", "severity": "Normal", "detail": "Stable auto policy."},
                "lender": {"signalText": "Credit utilization climbed from 22% to 68%.", "severity": "Moderate (0.55)", "detail": "Short-term liquidity need."}
            },
            "contributions": [
                {"name": "Credit utilization trajectory", "score": 40, "color": "#C58A32"},
                {"name": "Cashflow regularity index", "score": 38, "color": "#12372A"},
                {"name": "Cross-institution correlation", "score": 22, "color": "#2F6B4F"}
            ],
            "disclosure": {
                "disclosedToAnalyst": [
                    "Composite Risk Score: MEDIUM (Confidence: 74%)",
                    "Archetype: Dual-vector cashflow variance",
                    "Recommended Action: Secondary liquidity review"
                ],
                "strictlyProtected": [
                    "Specific pay stubs, bank statements, and credit line numbers"
                ]
            }
        },
        {
            "id": "CASE-10518",
            "customer_id": "CUSTOMER-10518",
            "entity_ref": "ENTITY-5B12",
            "risk_level": "LOW",
            "confidence": 94.0,
            "score": 14.0,
            "action": "Normal processing",
            "status": "NORMAL_PROCESSING",
            "last_escalation": "35 mins ago",
            "explanation": "Isolated single inquiry at lender; bank and insurer indicate strong multi-year stability.",
            "local_evidence": {
                "bank": {"signalText": "Prime payroll stability.", "severity": "Normal", "detail": "Stable tier-1 balance."},
                "insurer": {"signalText": "Tenured policy, 0 claims in 36m.", "severity": "Normal", "detail": "Low risk tier."},
                "lender": {"signalText": "Single mortgage pre-approval check.", "severity": "Normal", "detail": "Single inquiry."}
            },
            "contributions": [
                {"name": "Historical stability", "score": 65, "color": "#3F7D5A"},
                {"name": "Cross-institution validation", "score": 35, "color": "#2F6B4F"}
            ],
            "disclosure": {
                "disclosedToAnalyst": [
                    "Composite Risk Score: LOW (Confidence: 94%)",
                    "Archetype: Benign single inquiry verified by network history",
                    "Workflow: Automated clearance"
                ],
                "strictlyProtected": [
                    "Mortgage property appraisal details and personal banking records"
                ]
            }
        },
        {
            "id": "CASE-10522",
            "customer_id": "CUSTOMER-10522",
            "entity_ref": "ENTITY-8E66",
            "risk_level": "HIGH",
            "confidence": 89.0,
            "score": 89.0,
            "action": "Enhanced verification",
            "status": "ESCALATED",
            "last_escalation": "48 mins ago",
            "explanation": "Simultaneous small claims submission, newly opened secondary loan, and account withdrawal surge.",
            "local_evidence": {
                "bank": {"signalText": "Rapid capital reallocation.", "severity": "Weak/Moderate", "detail": "Higher than normal wire volume."},
                "insurer": {"signalText": "New claim filed 12 days after endorsement.", "severity": "Weak", "detail": "Edge-case timeline."},
                "lender": {"signalText": "Second consumer credit application.", "severity": "Weak", "detail": "Parallel inquiry."}
            },
            "contributions": [
                {"name": "Cross-institution signal alignment", "score": 42, "color": "#B64A45"},
                {"name": "Temporal velocity deviation", "score": 31, "color": "#C58A32"},
                {"name": "Local banking anomaly", "score": 27, "color": "#12372A"}
            ],
            "disclosure": {
                "disclosedToAnalyst": [
                    "Composite Risk Score: HIGH (Confidence: 89%)",
                    "Archetype: Multi-institution velocity burst (potential bust-out)",
                    "Recommended Protocol: Source of funds and enhanced KYC audit"
                ],
                "strictlyProtected": [
                    "Customer identity documents, bank wire recipients, vehicle registration data"
                ]
            }
        },
        {
            "id": "CASE-10530",
            "customer_id": "CUSTOMER-10530",
            "entity_ref": "ENTITY-1C77",
            "risk_level": "MEDIUM",
            "confidence": 72.0,
            "score": 48.0,
            "action": "Standard monitoring",
            "status": "PENDING_REVIEW",
            "last_escalation": "1 hour ago",
            "explanation": "Insurer reports property claim after regional weather event; bank and lender reflect normal profile.",
            "local_evidence": {
                "bank": {"signalText": "Normal balance and repayments.", "severity": "Normal", "detail": "Standard payroll deposits."},
                "insurer": {"signalText": "Weather catastrophe claim registered.", "severity": "Moderate", "detail": "Zipcode group event."},
                "lender": {"signalText": "Zero new applications.", "severity": "Normal", "detail": "Low debt balance."}
            },
            "contributions": [
                {"name": "Macro-environmental correlation", "score": 55, "color": "#12372A"},
                {"name": "Baseline stability validation", "score": 45, "color": "#3F7D5A"}
            ],
            "disclosure": {
                "disclosedToAnalyst": [
                    "Composite Risk Score: MEDIUM (Confidence: 72%)",
                    "Archetype: Non-adversarial macro cluster variance",
                    "Action: Continue routine baseline monitoring"
                ],
                "strictlyProtected": [
                    "Insured property address, adjuster photos, damages itemization"
                ]
            }
        }
    ]

    with get_db_connection(COORDINATOR_DB_PATH) as conn:
        conn.execute("DELETE FROM cases")
        conn.execute("DELETE FROM case_history")
        conn.execute("DELETE FROM verification_tasks")
        conn.execute("DELETE FROM users")

        # Seed Users
        for u in DEMO_USERS:
            pwd_hash, salt = hash_password(u["password"])
            stored_val = f"{pwd_hash}:{salt}"
            conn.execute("""
                INSERT INTO users (id, username, email, password_hash, role, institution_id)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (u["id"], u["username"], u["email"], stored_val, u["role"], u.get("institution_id")))

        # Seed Cases
        for c in benchmark_cases:
            conn.execute("""
                INSERT INTO cases (
                    id, customer_id, entity_ref, risk_level, confidence, score,
                    action, status, last_escalation, explanation,
                    local_evidence_json, contributions_json, disclosure_json,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                c["id"], c["customer_id"], c["entity_ref"], c["risk_level"], c["confidence"], c["score"],
                c["action"], c["status"], c["last_escalation"], c["explanation"],
                json.dumps(c["local_evidence"]), json.dumps(c["contributions"]), json.dumps(c["disclosure"]),
                now, now
            ))
            conn.execute("""
                INSERT INTO case_history (case_id, timestamp, action, actor, details, previous_status, new_status)
                VALUES (?, ?, 'CASE_INITIALIZED', 'SYSTEM', 'Initial baseline benchmark profile registered', 'NEW', ?)
            """, (c["id"], now, c["status"]))

        # Seed Network State
        conn.execute("""
            INSERT OR REPLACE INTO network_state (key, value_json, updated_at)
            VALUES ('global_state', ?, ?)
        """, (json.dumps({
            "round": 27,
            "quarantined_lender": False,
            "connected_institutions": 3,
            "privacy_epsilon": 1.5,
            "active_scenario": "NORMAL"
        }), now))

        conn.commit()

    print("[5/5] Initializing cryptographic SHA-256 audit chain...")
    audit_chain = AuditChain(COORDINATOR_DB_PATH)
    # Clear and rebuild audit chain
    with get_db_connection(COORDINATOR_DB_PATH) as conn:
        conn.execute("DELETE FROM audit_events")
        conn.commit()

    audit_chain._create_genesis()
    initial_events = [
        {"actor": "BANK_A_NODE", "role": "NODE", "action": "LOCAL_MODEL_UPDATE_GENERATED", "target": "BANK_A", "details": "Local model update generated with DP-SGD noise (epsilon=1.5, clip=1.0)", "inst": "BANK_A", "privacy": "Protected (DP epsilon=1.5)", "result": "Accepted (Norm 0.82 <= 1.0)"},
        {"actor": "SECAGG_COORDINATOR", "role": "COORDINATOR", "action": "SECURE_AGGREGATION_COMPLETED", "target": "GLOBAL_ROUND_27", "details": "Zero-knowledge blinded aggregation finalized: Pairwise masks canceled (sum M_i = 0)", "inst": "TRUSTMESH Aggregator", "privacy": "Zero-Knowledge Blind Aggregation", "result": "Success (Round 27 consolidated)"},
        {"actor": "INSURER_B_NODE", "role": "NODE", "action": "RISK_SIGNAL_RECEIVED", "target": "INSURER_B", "details": "Differentially private latent embedding broadcast", "inst": "INSURER_B", "privacy": "Protected (Encrypted representation)", "result": "Accepted (Cosine similarity nominal)"},
        {"actor": "TRUSTMESH_NETWORK", "role": "SYSTEM", "action": "BENCHMARK_INITIALIZATION", "target": "POPULATION", "details": "1,500 synthetic entities registered across 3 connected institutions", "inst": "TRUSTMESH Network", "privacy": "Minimum Disclosure Rule Applied", "result": "Telemetry Nominal"}
    ]
    for ev in initial_events:
        audit_chain.append_event(
            actor=ev["actor"],
            role=ev["role"],
            action=ev["action"],
            target_id=ev["target"],
            details=ev["details"],
            institution=ev["inst"],
            privacy_status=ev["privacy"],
            result=ev["result"]
        )

    verify_res = audit_chain.verify_chain()
    print(f"      Audit chain initialized and verified: {verify_res['message']} (Total Events: {verify_res['total_events']})")
    print("\nSUCCESS: All TRUSTMESH databases and model artifacts have been seeded successfully!")


seed_all = seed_databases

if __name__ == "__main__":
    seed_databases()
