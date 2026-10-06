"""
Tests for Differential Privacy and Byzantine Robustness.
Verifies Gaussian mechanism noise scale, L2 norm clipping, and coordinate-wise median filtering.
"""

import numpy as np
import pytest
from backend.crypto.dp_engine import (
    apply_gaussian_dp,
    byzantine_filter_updates,
    calculate_gaussian_sigma,
    clip_vector_l2,
    coordinate_wise_median,
)


def test_gaussian_sigma_scaling():
    """Verify that smaller epsilon (stronger privacy) produces larger noise sigma."""
    sigma_high_eps = calculate_gaussian_sigma(epsilon=4.5, delta=1e-5, clip_norm=1.0)
    sigma_mid_eps = calculate_gaussian_sigma(epsilon=1.5, delta=1e-5, clip_norm=1.0)
    sigma_low_eps = calculate_gaussian_sigma(epsilon=0.3, delta=1e-5, clip_norm=1.0)

    assert sigma_high_eps < sigma_mid_eps < sigma_low_eps, "Noise sigma must increase as epsilon decreases"


def test_l2_norm_clipping():
    """Verify that vector norms are strictly bounded by clip_norm."""
    large_vec = np.array([3.0, 4.0, 5.0])  # norm = sqrt(50) ~ 7.07
    clipped, original_norm = clip_vector_l2(large_vec, clip_norm=1.0)

    clipped_norm = np.linalg.norm(clipped)
    assert np.isclose(clipped_norm, 1.0, atol=1e-6)
    assert original_norm > 7.0


def test_byzantine_outlier_detection_and_quarantine():
    """Verify that anomalous gradient updates exceeding norm threshold are quarantined."""
    normal_a = np.array([0.2, -0.3, 0.4])
    normal_b = np.array([0.1, -0.2, 0.3])
    malicious_c = np.array([8.5, -12.0, 14.0])  # Massive norm outlier

    updates = {
        "BANK_A": normal_a,
        "INSURER_B": normal_b,
        "LENDER_C": malicious_c
    }

    res = byzantine_filter_updates(updates, norm_threshold=1.0)
    assert "LENDER_C" in res["quarantined_nodes"]
    assert "BANK_A" in res["accepted_nodes"]
    assert "INSURER_B" in res["accepted_nodes"]

    # Check median aggregate computed only from accepted nodes
    expected_median = np.median([normal_a, normal_b], axis=0)
    np.testing.assert_allclose(res["robust_aggregate"], expected_median)
