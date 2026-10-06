"""
Tests for Tamper-Evident SHA-256 Audit Chain.
Verifies canonical serialization, valid 64-char hashes, chain verification, and tamper detection.
"""

import tempfile
from pathlib import Path
import pytest
from backend.storage.audit_chain import AuditChain


@pytest.fixture
def temp_audit_chain(tmp_path):
    db_path = tmp_path / "test_audit.db"
    chain = AuditChain(db_path)
    return chain


def test_audit_genesis_creation(temp_audit_chain):
    """Verify genesis block has 64-char hash and zero prev_hash."""
    count = temp_audit_chain.get_count()
    assert count == 1

    latest = temp_audit_chain.get_latest_event()
    assert latest["idx"] == 0
    assert latest["prev_hash"] == AuditChain.GENESIS_PREV_HASH
    assert len(latest["hash"]) == 64, "Hash must be a genuine 64-character SHA-256 string"


def test_audit_append_and_linkage(temp_audit_chain):
    """Verify subsequent events link correctly to preceding block hashes."""
    e1 = temp_audit_chain.append_event(
        actor="ANALYST_01",
        role="RISK_ANALYST",
        action="CASE_INSPECTED",
        target_id="CASE-10482",
        details="Analyst opened CASE-10482"
    )
    assert e1["idx"] == 1
    assert len(e1["hash"]) == 64

    e2 = temp_audit_chain.append_event(
        actor="COMPLIANCE_01",
        role="COMPLIANCE_OFFICER",
        action="VERIFICATION_CONFIRMED",
        target_id="CASE-10482",
        details="KYC verification approved"
    )
    assert e2["idx"] == 2
    assert e2["prev_hash"] == e1["hash"], "Block 2 must link to Block 1 hash"

    # Chain verification
    res = temp_audit_chain.verify_chain()
    assert res["valid"] is True
    assert res["total_events"] == 3


def test_audit_tamper_detection(temp_audit_chain):
    """Verify that any modification of an earlier block is immediately caught."""
    temp_audit_chain.append_event(
        actor="NODE_A", role="NODE", action="UPDATE_A", target_id="ROUND_1", details="Original record"
    )
    temp_audit_chain.append_event(
        actor="NODE_B", role="NODE", action="UPDATE_B", target_id="ROUND_1", details="Subsequent record"
    )

    # Initial chain is valid
    assert temp_audit_chain.verify_chain()["valid"] is True

    # Tamper with index 1
    tamper_res = temp_audit_chain.simulate_tamper(target_idx=1)
    assert tamper_res["success"] is True

    # Chain verification must now fail
    verify_res = temp_audit_chain.verify_chain()
    assert verify_res["valid"] is False
    assert verify_res["broken_index"] == 1
    assert "Tampering detected" in verify_res["error"]
