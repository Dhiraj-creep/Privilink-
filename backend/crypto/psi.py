"""
PriviLink Private Set Intersection (PSI)
Implements commutative Diffie-Hellman (Pohlig-Hellman) exponentiation over a 256-bit safe prime.
Allows institutions to discover shared customer entity tokens (e.g. ENTITY-7F21) without exchanging plaintext PII.
"""

import hashlib
import secrets
from typing import Dict, List, Set, Tuple
from backend.config import DH_PRIME


def hash_identifier_to_field(identifier: str, prime: int = DH_PRIME) -> int:
    """Hashes an arbitrary customer identifier (e.g. national ID or account) into the multiplicative group Z_p*."""
    digest = hashlib.sha256(identifier.encode("utf-8")).digest()
    val = int.from_bytes(digest, byteorder="big")
    # Ensure element is within (1, prime - 1)
    return (val % (prime - 3)) + 2


class DHPSIParty:
    def __init__(self, party_name: str, prime: int = DH_PRIME):
        self.party_name = party_name
        self.prime = prime
        # Private secret key k in [2, prime - 2]
        self.secret_key = secrets.randbelow(prime - 3) + 2

    def first_round_encrypt(self, raw_identifiers: List[str]) -> Dict[str, int]:
        """
        Step 1: Hash raw identifier h = H(id) and compute blinded commitment:
        c_i = (h_i ^ key) mod p
        Returns mapping {raw_identifier: blinded_commitment}.
        """
        encrypted = {}
        for raw_id in raw_identifiers:
            h = hash_identifier_to_field(raw_id, self.prime)
            c = pow(h, self.secret_key, self.prime)
            encrypted[raw_id] = c
        return encrypted

    def second_round_reencrypt(self, peer_commitments: List[int]) -> List[int]:
        """
        Step 2: Commutatively re-encrypt peer commitments:
        re_c_i = (peer_c_i ^ key) mod p = (h_i ^ peer_key ^ key) mod p
        """
        return [pow(c, self.secret_key, self.prime) for c in peer_commitments]


def execute_pairwise_psi(
    party_a: DHPSIParty,
    party_b: DHPSIParty,
    set_a: List[str],
    set_b: List[str]
) -> Dict[str, any]:
    """
    Executes full 2-party Commutative Diffie-Hellman Private Set Intersection.
    Because (h^a)^b = (h^b)^a mod p, elements in the intersection produce identical doubly-blinded values.
    """
    # Round 1: Each party blinds their own identifiers
    enc_a = party_a.first_round_encrypt(set_a)
    enc_b = party_b.first_round_encrypt(set_b)

    list_a_commitments = list(enc_a.values())
    list_b_commitments = list(enc_b.values())

    # Round 2: Re-encrypt peer's commitments with own secret
    re_enc_b_by_a = [pow(c, party_a.secret_key, party_a.prime) for c in list_b_commitments]
    re_enc_a_by_b = [pow(c, party_b.secret_key, party_b.prime) for c in list_a_commitments]

    # Map back to find intersecting items from party A's perspective
    double_blind_map_a = {}
    for raw_id, c in enc_a.items():
        double_blind = pow(c, party_b.secret_key, party_b.prime)
        double_blind_map_a[double_blind] = raw_id

    set_re_enc_b = set(re_enc_b_by_a)
    intersecting_raw_a = []
    canonical_tokens = []

    for d_blind, raw_id in double_blind_map_a.items():
        if d_blind in set_re_enc_b:
            intersecting_raw_a.append(raw_id)
            # Create deterministic canonical reference from double-blind hash
            h_token = hashlib.sha256(str(d_blind).encode("utf-8")).hexdigest()[:4].upper()
            canonical_tokens.append(f"ENTITY-{h_token}")

    return {
        "party_a": party_a.party_name,
        "party_b": party_b.party_name,
        "party_a_count": len(set_a),
        "party_b_count": len(set_b),
        "intersection_size": len(intersecting_raw_a),
        "intersection_canonical_tokens": canonical_tokens,
        "leakage_guarantee": "Neither party learns non-intersecting plaintext records."
    }
