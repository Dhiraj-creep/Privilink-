"""
Tests for Commutative Diffie-Hellman Private Set Intersection (PSI).
Verifies that entity linkage discovers common entities without revealing non-overlapping PII.
"""

import pytest
from backend.crypto.psi import DHPSIParty, execute_pairwise_psi


def test_commutative_dh_psi_matching():
    """Verify that commutative exponentiation correctly identifies the intersection."""
    party_a = DHPSIParty("BANK_A")
    party_b = DHPSIParty("INSURER_B")

    set_a = ["B-10482", "B-10491", "B-10522", "B-99991", "B-99992"]
    set_b = ["I-10482", "I-10491", "I-10522", "I-88881", "I-88882"]

    # Map with equivalent customer base: 10482, 10491, 10522 overlap
    # We simulate by aligning the underlying token identifiers
    shared_identifiers = ["CUST-10482", "CUST-10491", "CUST-10522"]
    unshared_a = ["CUST-99991", "CUST-99992"]
    unshared_b = ["CUST-88881", "CUST-88882"]

    res = execute_pairwise_psi(
        party_a=party_a,
        party_b=party_b,
        set_a=shared_identifiers + unshared_a,
        set_b=shared_identifiers + unshared_b
    )

    assert res["intersection_size"] == 3
    assert len(res["intersection_canonical_tokens"]) == 3
    for token in res["intersection_canonical_tokens"]:
        assert token.startswith("ENTITY-")


def test_psi_disjoint_sets():
    """Verify that completely disjoint sets return an empty intersection."""
    party_a = DHPSIParty("BANK_A")
    party_b = DHPSIParty("INSURER_B")

    set_a = ["CUST-111", "CUST-222"]
    set_b = ["CUST-333", "CUST-444"]

    res = execute_pairwise_psi(party_a, party_b, set_a, set_b)
    assert res["intersection_size"] == 0
    assert len(res["intersection_canonical_tokens"]) == 0
