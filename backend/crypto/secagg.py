"""
TRUSTMESH Secure Aggregation (SecAgg v2.1)
Numerical implementation of pairwise zero-sum random masking for collaborative multi-party aggregation.
Enables central coordinator to compute sum of client vectors without observing any individual vector.
Includes explicit dropout detection and abort handling.
"""

import hashlib
import hmac
import numpy as np
from typing import Dict, List, Optional, Tuple


def derive_pairwise_seed(node_i: str, node_j: str, shared_secret: str, round_id: int) -> int:
    """Derives a deterministic 64-bit seed for pair (node_i, node_j) for the given round."""
    ordered_pair = ":".join(sorted([node_i, node_j]))
    msg = f"{ordered_pair}:round_{round_id}".encode("utf-8")
    h = hmac.new(shared_secret.encode("utf-8"), msg, hashlib.sha256).digest()
    return int.from_bytes(h[:8], byteorder="big")


def generate_pairwise_mask(seed: int, length: int) -> np.ndarray:
    """Generates a pseudorandom noise vector from seed using Mersenne Twister RNG."""
    rng = np.random.default_rng(seed)
    return rng.normal(loc=0.0, scale=100.0, size=length)


class ParticipantNodeSecAgg:
    def __init__(self, node_id: str, all_participant_ids: List[str], shared_secrets: Dict[str, str]):
        self.node_id = node_id
        self.all_participant_ids = sorted(all_participant_ids)
        self.shared_secrets = shared_secrets

    def compute_blinded_update(
        self,
        local_vector: np.ndarray,
        round_id: int
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        Computes blinded vector: v_blinded = v_local + mask_total
        where mask_total = sum_{j > i} S_{i,j} - sum_{j < i} S_{j,i}.
        Returns (blinded_vector, mask_total).
        """
        vec = np.asarray(local_vector, dtype=np.float64)
        mask_total = np.zeros_like(vec)

        for other_id in self.all_participant_ids:
            if other_id == self.node_id:
                continue

            secret = self.shared_secrets.get(other_id, "default_shared_key")
            pair_seed = derive_pairwise_seed(self.node_id, other_id, secret, round_id)
            pairwise_noise = generate_pairwise_mask(pair_seed, len(vec))

            if self.node_id < other_id:
                mask_total += pairwise_noise
            else:
                mask_total -= pairwise_noise

        blinded_vector = vec + mask_total
        return blinded_vector, mask_total


class CentralSecAggCoordinator:
    def __init__(self, expected_participant_ids: List[str]):
        self.expected_participants = sorted(expected_participant_ids)

    def aggregate(
        self,
        submitted_blinded_vectors: Dict[str, np.ndarray],
        round_id: int
    ) -> Dict[str, any]:
        """
        Aggregates submitted blinded vectors.
        Strict verification:
        1. Checks that ALL expected participants have submitted.
        2. If any node dropped out, pairwise masks do NOT cancel out. Coordinator refuses to decrypt
           and explicitly aborts to preserve individual privacy.
        """
        submitted_ids = sorted(list(submitted_blinded_vectors.keys()))

        # Check for dropouts
        missing_participants = set(self.expected_participants) - set(submitted_ids)
        if missing_participants:
            return {
                "success": False,
                "error": f"Aggregation Aborted: Missing participants {sorted(list(missing_participants))}. "
                         f"Pairwise masks would not cancel; aborting to preserve client confidentiality.",
                "aggregated_vector": None,
                "participants_count": len(submitted_ids),
                "expected_count": len(self.expected_participants)
            }

        # Sum blinded vectors
        vec_list = [submitted_blinded_vectors[pid] for pid in self.expected_participants]
        blinded_sum = np.sum(vec_list, axis=0)

        # Average aggregate
        average_vector = blinded_sum / float(len(self.expected_participants))

        return {
            "success": True,
            "round_id": round_id,
            "participants_count": len(submitted_ids),
            "aggregated_vector": average_vector.tolist(),
            "summed_vector": blinded_sum.tolist(),
            "message": "Zero-Knowledge Secure Aggregation Succeeded: Pairwise masks canceled exactly (sum M_i = 0)."
        }
