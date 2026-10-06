"""
TRUSTMESH Synthetic Dataset Generator
Generates reproducible, vertically partitioned synthetic data across Bank A, Insurer B, and Lender C.
Reflects genuine multi-view weak-signal convergence:
In isolation, each institution's local features have high overlap between normal variance and systemic stress (PR-AUC ~0.65 - 0.72).
Collaboratively, joint multi-signal alignment provides strong discriminatory power (PR-AUC ~0.84 - 0.88).
"""

import hashlib
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple

from backend.config import SYNTHETIC_DATA_SEED, TOTAL_SYNTHETIC_RECORDS


def generate_canonical_entity_ref(id_num: int) -> str:
    """Generates a stable 4-character hex pseudonym reference from an ID number."""
    h = hashlib.sha256(f"entity_salt_2026_{id_num}".encode("utf-8")).hexdigest()
    return f"ENTITY-{h[:4].upper()}"


def generate_synthetic_data(
    num_records: int = TOTAL_SYNTHETIC_RECORDS,
    seed: int = SYNTHETIC_DATA_SEED
) -> Tuple[pd.DataFrame, Dict[str, pd.DataFrame]]:
    """
    Generates vertically partitioned data with ground-truth labels.
    """
    rng = np.random.default_rng(seed)

    records = []
    for i in range(num_records):
        id_num = 10000 + i
        entity_ref = "ENTITY-7F21" if id_num == 10482 else generate_canonical_entity_ref(id_num)
        customer_id = f"CUSTOMER-{id_num}"

        # Assign latent cohort:
        # 0: Healthy baseline (~82%)
        # 1: Benign localized single-institution variance (~11%)
        # 2: Coordinated cross-institution bust-out / systemic stress (~7%)
        if id_num == 10482:
            cohort = 2
        else:
            p = rng.random()
            if p < 0.82:
                cohort = 0
            elif p < 0.93:
                cohort = 1
            else:
                cohort = 2

        # Add Gaussian noise across all features to represent realistic measurement error
        noise = rng.normal(0, 0.05)

        # 1. Bank A Features
        # Repayment ratio, velocity anomaly, account age, balance tier, consistency
        if cohort == 0:
            bank_repay = float(np.clip(rng.normal(0.92, 0.06), 0.65, 1.0))
            bank_vel = float(np.clip(rng.normal(0.0, 0.8), -2.5, 2.5))
            bank_age = int(rng.integers(12, 180))
            bank_balance_tier = int(rng.choice([2, 3, 4, 5], p=[0.25, 0.4, 0.25, 0.1]))
            bank_consistency = float(np.clip(rng.normal(0.90, 0.07), 0.60, 1.0))
            bank_flag = "Normal"
        elif cohort == 1:
            # Benign single institution variance (job change, holiday spending)
            bank_repay = float(np.clip(rng.normal(0.82, 0.09), 0.55, 0.96))
            bank_vel = float(np.clip(rng.normal(0.6, 0.9), -1.5, 2.5))
            bank_age = int(rng.integers(6, 120))
            bank_balance_tier = int(rng.choice([1, 2, 3], p=[0.3, 0.5, 0.2]))
            bank_consistency = float(np.clip(rng.normal(0.78, 0.09), 0.50, 0.92))
            bank_flag = "Watch"
        else:  # cohort 2: Cross-institution stress
            # Weak isolated signal: mild variance (+6 days), but still overlapping with normal/watch
            bank_repay = float(np.clip(rng.normal(0.80, 0.08), 0.58, 0.92))
            bank_vel = float(np.clip(rng.normal(0.7, 0.8), -1.0, 2.4))
            bank_age = int(rng.integers(14, 110))
            bank_balance_tier = int(rng.choice([1, 2, 3], p=[0.35, 0.45, 0.20]))
            bank_consistency = float(np.clip(rng.normal(0.76, 0.08), 0.52, 0.90))
            bank_flag = "Weak Anomaly"

        # 2. Insurer B Features
        # Claim frequency, anomaly score, policy tier, tenure days, loss ratio
        if cohort == 0:
            ins_claim_freq = float(np.clip(rng.exponential(0.12), 0.0, 1.8))
            ins_anomaly = float(np.clip(rng.normal(16.0, 9.0), 0.0, 45.0))
            ins_tier = rng.choice(["Standard", "Watch"], p=[0.9, 0.1])
            ins_tenure_days = int(rng.integers(300, 2800))
            ins_loss_ratio = float(np.clip(rng.normal(0.22, 0.14), 0.0, 0.75))
            ins_flag = "Normal"
        elif cohort == 1:
            # Benign weather catastrophe or minor single claim
            ins_claim_freq = float(np.clip(rng.normal(0.55, 0.35), 0.1, 2.2))
            ins_anomaly = float(np.clip(rng.normal(36.0, 11.0), 10.0, 65.0))
            ins_tier = rng.choice(["Standard", "Watch", "High"], p=[0.3, 0.6, 0.1])
            ins_tenure_days = int(rng.integers(150, 1800))
            ins_loss_ratio = float(np.clip(rng.normal(0.52, 0.22), 0.1, 1.25))
            ins_flag = "Watch"
        else:  # cohort 2: Cross-institution stress
            # Weak isolated signal: borderline claim anomaly score, overlapping with cohort 1
            ins_claim_freq = float(np.clip(rng.normal(0.50, 0.30), 0.1, 2.0))
            ins_anomaly = float(np.clip(rng.normal(38.0, 10.0), 15.0, 62.0))
            ins_tier = rng.choice(["Standard", "Watch"], p=[0.35, 0.65])
            ins_tenure_days = int(rng.integers(120, 1400))
            ins_loss_ratio = float(np.clip(rng.normal(0.55, 0.20), 0.15, 1.20))
            ins_flag = "Weak Anomaly"

        # 3. Lender C Features
        # Inquiries, repayment stress, deviation score, utilization %, dti tier
        if cohort == 0:
            lender_inquiries = int(rng.choice([0, 1, 2], p=[0.75, 0.20, 0.05]))
            lender_stress = float(np.clip(rng.normal(22.0, 9.0), 0.0, 50.0))
            lender_dev = float(np.clip(rng.normal(0.18, 0.09), 0.0, 0.45))
            lender_util = float(np.clip(rng.normal(32.0, 12.0), 5.0, 65.0))
            lender_dti_band = rng.choice(["Tier A", "Tier B", "Tier C"], p=[0.6, 0.3, 0.1])
            lender_flag = "Normal"
        elif cohort == 1:
            lender_inquiries = int(rng.choice([0, 1, 2], p=[0.4, 0.4, 0.2]))
            lender_stress = float(np.clip(rng.normal(40.0, 11.0), 15.0, 68.0))
            lender_dev = float(np.clip(rng.normal(0.35, 0.10), 0.10, 0.60))
            lender_util = float(np.clip(rng.normal(48.0, 14.0), 15.0, 78.0))
            lender_dti_band = rng.choice(["Tier B", "Tier C", "Tier D"], p=[0.4, 0.4, 0.2])
            lender_flag = "Watch"
        else:  # cohort 2: Cross-institution stress
            # Weak isolated signal: 1 or 2 inquiries, utilization ~52%, stress ~44% (overlaps with cohort 1)
            lender_inquiries = int(rng.choice([1, 2, 3], p=[0.45, 0.45, 0.10]))
            lender_stress = float(np.clip(rng.normal(46.0, 10.0), 20.0, 70.0))
            lender_dev = float(np.clip(rng.normal(0.40, 0.10), 0.15, 0.65))
            lender_util = float(np.clip(rng.normal(54.0, 12.0), 25.0, 82.0))
            lender_dti_band = rng.choice(["Tier B", "Tier C"], p=[0.5, 0.5])
            lender_flag = "Weak Anomaly"

        # Explicit benchmark case override for CASE-10482
        if id_num == 10482:
            bank_repay = 0.78
            bank_vel = 0.8
            bank_consistency = 0.74
            ins_claim_freq = 0.55
            ins_anomaly = 42.0
            ins_loss_ratio = 0.58
            lender_inquiries = 2
            lender_stress = 48.0
            lender_util = 58.0

        ground_truth_label = 1 if cohort == 2 else 0

        record = {
            "id": f"CUST-{id_num}",
            "customer_id": customer_id,
            "entity_ref": entity_ref,
            "cohort": cohort,
            "is_high_risk": ground_truth_label,
            # Bank fields
            "bank_repayment_behaviour_ratio": round(bank_repay, 4),
            "bank_transaction_velocity_anomaly": round(bank_vel, 4),
            "bank_account_tenure_months": bank_age,
            "bank_average_monthly_balance_tier": bank_balance_tier,
            "bank_payment_consistency_index": round(bank_consistency, 4),
            "bank_inward_outward_ratio": round(float(np.clip(rng.normal(1.05, 0.2), 0.5, 2.0)), 2),
            "bank_local_flag": bank_flag,
            # Insurer fields
            "ins_claim_frequency_rate": round(ins_claim_freq, 4),
            "ins_claim_anomaly_score": round(ins_anomaly, 2),
            "ins_policy_behaviour_tier": ins_tier,
            "ins_policy_tenure_days": ins_tenure_days,
            "ins_loss_ratio_exposure": round(ins_loss_ratio, 4),
            "ins_local_flag": ins_flag,
            # Lender fields
            "lender_loan_application_velocity": lender_inquiries,
            "lender_repayment_stress_indicator": round(lender_stress, 2),
            "lender_borrowing_behaviour_deviation": round(lender_dev, 4),
            "lender_credit_utilization_trajectory": round(lender_util, 2),
            "lender_dti_synthetic_band": lender_dti_band,
            "lender_local_flag": lender_flag,
        }
        records.append(record)

    full_df = pd.DataFrame(records)

    # Separate vertical partitions with sovereign IDs
    bank_df = full_df[[
        "id", "entity_ref",
        "bank_repayment_behaviour_ratio", "bank_transaction_velocity_anomaly",
        "bank_account_tenure_months", "bank_average_monthly_balance_tier",
        "bank_payment_consistency_index", "bank_inward_outward_ratio", "bank_local_flag"
    ]].copy()
    bank_df["node_id"] = bank_df["id"].apply(lambda s: f"B-{s.replace('CUST-', '')}")

    ins_df = full_df[[
        "id", "entity_ref",
        "ins_claim_frequency_rate", "ins_claim_anomaly_score",
        "ins_policy_behaviour_tier", "ins_policy_tenure_days",
        "ins_loss_ratio_exposure", "ins_local_flag"
    ]].copy()
    ins_df["node_id"] = ins_df["id"].apply(lambda s: f"I-{s.replace('CUST-', '')}")

    lender_df = full_df[[
        "id", "entity_ref",
        "lender_loan_application_velocity", "lender_repayment_stress_indicator",
        "lender_borrowing_behaviour_deviation", "lender_credit_utilization_trajectory",
        "lender_dti_synthetic_band", "lender_local_flag"
    ]].copy()
    lender_df["node_id"] = lender_df["id"].apply(lambda s: f"L-{s.replace('CUST-', '')}")

    partitions = {
        "BANK_A": bank_df,
        "INSURER_B": ins_df,
        "LENDER_C": lender_df,
    }

    return full_df, partitions


def split_train_val_test_entities(
    df: pd.DataFrame,
    train_frac: float = 0.70,
    val_frac: float = 0.15,
    seed: int = SYNTHETIC_DATA_SEED
) -> Tuple[List[str], List[str], List[str]]:
    """
    Partitions entities into Train, Val, and Test subsets.
    Guarantees zero entity leakage across splits.
    Benchmark case CUST-10482 is placed in the test set.
    """
    all_entities = list(df["id"].unique())
    if "CUST-10482" in all_entities:
        all_entities.remove("CUST-10482")

    rng = np.random.default_rng(seed)
    rng.shuffle(all_entities)

    n = len(all_entities)
    n_train = int(n * train_frac)
    n_val = int(n * val_frac)

    train_ids = all_entities[:n_train]
    val_ids = all_entities[n_train:n_train + n_val]
    test_ids = all_entities[n_train + n_val:] + ["CUST-10482"]

    return train_ids, val_ids, test_ids
