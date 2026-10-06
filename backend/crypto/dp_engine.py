"""
TRUSTMESH Differential Privacy Engine & Byzantine Defense
Implements formal Differential Privacy (DP-SGD / Gaussian release mechanism) and
Byzantine robustness (L2-norm clamping & Coordinate-Wise Median).
"""

import math
import numpy as np
from typing import Dict, List, Optional, Tuple


def calculate_gaussian_sigma(epsilon: float, delta: float = 1e-5, clip_norm: float = 1.0) -> float:
    """
    Computes standard deviation sigma for Gaussian Mechanism satisfying (epsilon, delta)-DP.
    Formula: sigma = clip_norm * sqrt(2 * ln(1.25 / delta)) / epsilon
    """
    if epsilon <= 0:
        raise ValueError("Epsilon must be strictly positive")
    if delta <= 0 or delta >= 1:
        raise ValueError("Delta must be strictly between 0 and 1")

    return (clip_norm * math.sqrt(2.0 * math.log(1.25 / delta))) / epsilon


def clip_vector_l2(vector: np.ndarray, clip_norm: float = 1.0) -> Tuple[np.ndarray, float]:
    """
    Clips vector to L2-norm threshold C:
    v_clipped = v / max(1, ||v||_2 / C)
    Returns (clipped_vector, original_l2_norm).
    """
    vec = np.asarray(vector, dtype=np.float64)
    l2_norm = float(np.linalg.norm(vec))
    if l2_norm > clip_norm:
        clipped = vec * (clip_norm / l2_norm)
    else:
        clipped = vec.copy()
    return clipped, l2_norm


def apply_gaussian_dp(
    vector: np.ndarray,
    epsilon: float = 1.5,
    delta: float = 1e-5,
    clip_norm: float = 1.0,
    seed: Optional[int] = None
) -> Dict[str, any]:
    """
    Applies (epsilon, delta)-Differential Privacy Gaussian Mechanism to an update vector.
    1. Clips vector to L2-norm C.
    2. Adds calibrated Gaussian noise N(0, sigma^2 * I).
    """
    clipped, original_norm = clip_vector_l2(vector, clip_norm)
    sigma = calculate_gaussian_sigma(epsilon, delta, clip_norm)

    rng = np.random.default_rng(seed)
    noise = rng.normal(loc=0.0, scale=sigma, size=len(clipped))
    perturbed = clipped + noise

    return {
        "original_vector": vector.tolist(),
        "clipped_vector": clipped.tolist(),
        "perturbed_vector": perturbed.tolist(),
        "original_norm": round(original_norm, 4),
        "clip_norm": clip_norm,
        "epsilon": epsilon,
        "delta": delta,
        "sigma": round(sigma, 4),
        "noise_sample": noise[:4].tolist()
    }


def coordinate_wise_median(vectors: List[np.ndarray]) -> np.ndarray:
    """
    Byzantine-robust aggregation using coordinate-wise median.
    Protects against arbitrary poisoning updates from up to floor((n-1)/2) malicious participants.
    """
    matrix = np.array(vectors)
    return np.median(matrix, axis=0)


def byzantine_filter_updates(
    updates: Dict[str, np.ndarray],
    norm_threshold: float = 1.0
) -> Dict[str, any]:
    """
    Evaluates participant gradient norms before aggregation.
    Identifies outliers exceeding the Byzantine norm threshold.
    """
    quarantined = []
    accepted = {}
    diagnostics = {}

    for node_id, vec in updates.items():
        arr = np.asarray(vec, dtype=np.float64)
        norm_val = float(np.linalg.norm(arr))
        diagnostics[node_id] = {
            "l2_norm": round(norm_val, 4),
            "threshold": norm_threshold,
            "status": "ACCEPTED" if norm_val <= norm_threshold else "QUARANTINED"
        }

        if norm_val <= norm_threshold:
            accepted[node_id] = arr
        else:
            quarantined.append(node_id)

    if accepted:
        robust_aggregate = coordinate_wise_median(list(accepted.values()))
    else:
        robust_aggregate = np.zeros_like(list(updates.values())[0])

    return {
        "quarantined_nodes": quarantined,
        "accepted_nodes": list(accepted.keys()),
        "diagnostics": diagnostics,
        "robust_aggregate": robust_aggregate.tolist(),
        "action_taken": "Quarantined anomalous updates" if quarantined else "All updates accepted"
    }
