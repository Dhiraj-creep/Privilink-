"""
Tests for Synthetic Dataset and Vertical Federated Learning (VFL) Engine.
Verifies reproducibility, zero train/test entity leakage, and model evaluation metrics.
"""

import numpy as np
import pytest
from backend.ml.dataset_generator import (
    generate_synthetic_data,
    split_train_val_test_entities,
)
from backend.ml.vfl_engine import VFLEngine


def test_synthetic_dataset_reproducibility():
    """Verify seeded generation produces deterministic datasets."""
    df1, _ = generate_synthetic_data(num_records=100, seed=42)
    df2, _ = generate_synthetic_data(num_records=100, seed=42)
    assert df1.equals(df2), "Dataset generation must be strictly deterministic with seed 42"


def test_zero_entity_overlap_in_splits():
    """Verify absolute train/validation/test entity isolation."""
    df, _ = generate_synthetic_data(num_records=500, seed=42)
    train_ids, val_ids, test_ids = split_train_val_test_entities(df, seed=42)

    train_set = set(train_ids)
    val_set = set(val_ids)
    test_set = set(test_ids)

    assert len(train_set.intersection(test_set)) == 0, "Train and Test sets must have 0 overlapping entities"
    assert len(train_set.intersection(val_set)) == 0, "Train and Val sets must have 0 overlapping entities"
    assert len(val_set.intersection(test_set)) == 0, "Val and Test sets must have 0 overlapping entities"
    assert "CUST-10482" in test_set, "Benchmark case CUST-10482 must be in the test set"


def test_vfl_model_evaluation_metrics():
    """Verify VFL model produces valid bounded evaluation metrics."""
    engine = VFLEngine()
    eval_res = engine.train_and_evaluate()

    metrics = eval_res["globalMetrics"]
    assert 0.0 <= metrics["precision"] <= 1.0
    assert 0.0 <= metrics["recall"] <= 1.0
    assert 0.0 <= metrics["f1Score"] <= 1.0
    assert 0.0 <= metrics["prAuc"] <= 1.0
    assert 0.0 <= metrics["rocAuc"] <= 1.0
    assert metrics["rocAuc"] > 0.80, "Collaborative model must achieve high discriminatory power"

    # Verify local comparison baselines are reported
    baselines = eval_res["localMetricsComparison"]
    assert len(baselines) == 4
    for b in baselines:
        assert "prAuc" in b
        assert "f1Score" in b
        assert "weakness" in b


def test_case_prediction_inference():
    """Verify inference produces explainability contribution scores."""
    engine = VFLEngine()
    engine.train_and_evaluate()

    sample_case = {
        "bank_repayment_behaviour_ratio": 0.78,
        "bank_transaction_velocity_anomaly": 0.8,
        "bank_account_tenure_months": 36,
        "bank_average_monthly_balance_tier": 2,
        "bank_payment_consistency_index": 0.74,
        "ins_claim_frequency_rate": 0.55,
        "ins_claim_anomaly_score": 42.0,
        "ins_policy_behaviour_tier": "Watch",
        "ins_policy_tenure_days": 240,
        "ins_loss_ratio_exposure": 0.58,
        "lender_loan_application_velocity": 2,
        "lender_repayment_stress_indicator": 48.0,
        "lender_borrowing_behaviour_deviation": 0.42,
        "lender_credit_utilization_trajectory": 58.0,
        "lender_dti_synthetic_band": "Tier C"
    }

    pred = engine.predict_case(sample_case)
    assert "collaborative_probability" in pred
    assert "risk_level" in pred
    assert len(pred["contributions"]) == 3

    total_contrib = sum(c["score"] for c in pred["contributions"])
    assert total_contrib == 100, f"Feature attribution percentages must sum to 100%, got {total_contrib}%"
