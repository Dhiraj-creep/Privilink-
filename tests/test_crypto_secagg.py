"""
Tests for Secure Aggregation (SecAgg v2.1).
Verifies numerical zero-sum masking, exact unmasked reconstruction, and dropout abort handling.
"""

import numpy as np
import pytest
from backend.crypto.secagg import CentralSecAggCoordinator, ParticipantNodeSecAgg


def test_secagg_zero_sum_masking():
    """Verify that pairwise random masks sum exactly to zero across all participants."""
    participants = ["BANK_A", "INSURER_B", "LENDER_C"]
    shared_secrets = {
        "BANK_A:INSURER_B": "key_ab_test",
        "BANK_A:LENDER_C": "key_ac_test",
        "INSURER_B:LENDER_C": "key_bc_test"
    }

    raw_vectors = {
        "BANK_A": np.array([1.5, -2.0, 3.2, 0.4]),
        "INSURER_B": np.array([0.5, 4.0, -1.2, 2.1]),
        "LENDER_C": np.array([-1.0, 1.0, 0.5, -1.5])
    }

    blinded_submissions = {}
    masks = []

    for pid in participants:
        node = ParticipantNodeSecAgg(
            node_id=pid,
            all_participant_ids=participants,
            shared_secrets={
                "INSURER_B": shared_secrets["BANK_A:INSURER_B"] if pid == "BANK_A" else shared_secrets.get("INSURER_B:LENDER_C"),
                "BANK_A": shared_secrets["BANK_A:INSURER_B"] if pid == "INSURER_B" else shared_secrets.get("BANK_A:LENDER_C"),
                "LENDER_C": shared_secrets["BANK_A:LENDER_C"] if pid == "BANK_A" else shared_secrets.get("INSURER_B:LENDER_C")
            }
        )
        blinded, mask = node.compute_blinded_update(raw_vectors[pid], round_id=1)
        blinded_submissions[pid] = blinded
        masks.append(mask)

    # 1. Verify mask cancellation
    mask_sum = np.sum(masks, axis=0)
    np.testing.assert_allclose(mask_sum, 0.0, atol=1e-12, err_msg="Sum of pairwise masks must equal 0.0")

    # 2. Verify coordinator aggregate matches expected unmasked average
    coordinator = CentralSecAggCoordinator(expected_participant_ids=participants)
    res = coordinator.aggregate(blinded_submissions, round_id=1)

    assert res["success"] is True
    expected_avg = np.mean(list(raw_vectors.values()), axis=0)
    np.testing.assert_allclose(
        res["aggregated_vector"],
        expected_avg,
        atol=1e-10,
        err_msg="Decrypted average must match true unmasked average"
    )


def test_secagg_dropout_abort_handling():
    """Verify that a missing participant immediately triggers a fail-safe abort."""
    participants = ["BANK_A", "INSURER_B", "LENDER_C"]
    coordinator = CentralSecAggCoordinator(expected_participant_ids=participants)

    # Simulate only 2 of 3 participants submitting (Lender C dropped out)
    partial_submissions = {
        "BANK_A": np.array([1.0, 2.0]),
        "INSURER_B": np.array([3.0, 4.0])
    }

    res = coordinator.aggregate(partial_submissions, round_id=1)
    assert res["success"] is False
    assert "Missing participants" in res["error"]
    assert res["aggregated_vector"] is None, "Aggregator must never release uncancelled masked vectors"
