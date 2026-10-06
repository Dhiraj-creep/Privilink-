"""
TRUSTMESH Cryptographic Audit Chain
Implements a tamper-evident SHA-256 hash chain for regulatory compliance and auditability.
Each event is canonically serialized, hashed with SHA-256 (64 hex characters), and cryptographically linked to the preceding event.
"""

import hashlib
import json
import sqlite3
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple


def canonical_serialize(data: Dict[str, Any]) -> str:
    """Produces deterministic canonical JSON serialization with sorted keys."""
    return json.dumps(data, sort_keys=True, separators=(",", ":"))


def compute_sha256(canonical_str: str) -> str:
    """Computes full 64-character hex SHA-256 hash."""
    return hashlib.sha256(canonical_str.encode("utf-8")).hexdigest()


class AuditChain:
    GENESIS_PREV_HASH = "0000000000000000000000000000000000000000000000000000000000000000"

    def __init__(self, db_path: str):
        self.db_path = str(db_path)
        self._init_table()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_table(self) -> None:
        with self._get_connection() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS audit_events (
                    idx INTEGER PRIMARY KEY AUTOINCREMENT,
                    event_id TEXT UNIQUE NOT NULL,
                    timestamp TEXT NOT NULL,
                    actor TEXT NOT NULL,
                    role TEXT NOT NULL,
                    action TEXT NOT NULL,
                    target_id TEXT NOT NULL,
                    details TEXT NOT NULL,
                    institution TEXT NOT NULL,
                    privacy_status TEXT NOT NULL,
                    result TEXT NOT NULL,
                    prev_hash TEXT NOT NULL,
                    hash TEXT NOT NULL
                )
            """)
            conn.commit()

        # Ensure genesis event exists
        if self.get_count() == 0:
            self._create_genesis()

    def _create_genesis(self) -> None:
        genesis_payload = {
            "idx": 0,
            "event_id": "LOG-0000",
            "timestamp": "2026-09-26T00:00:00.000000+00:00",
            "actor": "SYSTEM_ROOT",
            "role": "SYSTEM",
            "action": "LEDGER_GENESIS_INITIALIZATION",
            "target_id": "NETWORK_ROOT",
            "details": "TRUSTMESH Genesis Cryptographic Audit Ledger Initialized",
            "institution": "TRUSTMESH Network",
            "privacy_status": "Zero-Knowledge Root",
            "result": "Genesis Established",
            "prev_hash": self.GENESIS_PREV_HASH,
        }
        canonical = canonical_serialize(genesis_payload)
        genesis_hash = compute_sha256(canonical)

        with self._get_connection() as conn:
            conn.execute("""
                INSERT INTO audit_events (
                    idx, event_id, timestamp, actor, role, action, target_id,
                    details, institution, privacy_status, result, prev_hash, hash
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                0,
                genesis_payload["event_id"],
                genesis_payload["timestamp"],
                genesis_payload["actor"],
                genesis_payload["role"],
                genesis_payload["action"],
                genesis_payload["target_id"],
                genesis_payload["details"],
                genesis_payload["institution"],
                genesis_payload["privacy_status"],
                genesis_payload["result"],
                genesis_payload["prev_hash"],
                genesis_hash,
            ))
            conn.commit()

    def get_count(self) -> int:
        with self._get_connection() as conn:
            cursor = conn.execute("SELECT COUNT(*) FROM audit_events")
            return cursor.fetchone()[0]

    def get_latest_event(self) -> Optional[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.execute("SELECT * FROM audit_events ORDER BY idx DESC LIMIT 1")
            row = cursor.fetchone()
            return dict(row) if row else None

    def append_event(
        self,
        actor: str,
        role: str,
        action: str,
        target_id: str,
        details: str,
        institution: str = "TRUSTMESH Network",
        privacy_status: str = "Protected",
        result: str = "Success",
        timestamp: Optional[str] = None
    ) -> Dict[str, Any]:
        """Appends a new event linked to the previous event's hash."""
        latest = self.get_latest_event()
        if not latest:
            self._create_genesis()
            latest = self.get_latest_event()

        next_idx = latest["idx"] + 1
        prev_hash = latest["hash"]
        event_time = timestamp or datetime.now(timezone.utc).isoformat()
        event_id = f"LOG-{1000 + next_idx}"

        payload_to_hash = {
            "idx": next_idx,
            "event_id": event_id,
            "timestamp": event_time,
            "actor": actor,
            "role": role,
            "action": action,
            "target_id": target_id,
            "details": details,
            "institution": institution,
            "privacy_status": privacy_status,
            "result": result,
            "prev_hash": prev_hash,
        }

        event_hash = compute_sha256(canonical_serialize(payload_to_hash))

        with self._get_connection() as conn:
            conn.execute("""
                INSERT INTO audit_events (
                    idx, event_id, timestamp, actor, role, action, target_id,
                    details, institution, privacy_status, result, prev_hash, hash
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                next_idx,
                event_id,
                event_time,
                actor,
                role,
                action,
                target_id,
                details,
                institution,
                privacy_status,
                result,
                prev_hash,
                event_hash,
            ))
            conn.commit()

        return {**payload_to_hash, "hash": event_hash}

    def get_all_events(self, limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.execute(
                "SELECT * FROM audit_events ORDER BY idx DESC LIMIT ? OFFSET ?",
                (limit, offset)
            )
            return [dict(row) for row in cursor.fetchall()]

    def verify_chain(self) -> Dict[str, Any]:
        """
        Validates the entire audit chain from genesis to head.
        Verifies:
        1. Genesis block has exact GENESIS_PREV_HASH.
        2. Every event hash strictly equals SHA256 of its canonical JSON representation.
        3. Every event's prev_hash strictly matches the preceding event's hash.
        """
        with self._get_connection() as conn:
            cursor = conn.execute("SELECT * FROM audit_events ORDER BY idx ASC")
            events = [dict(row) for row in cursor.fetchall()]

        if not events:
            return {"valid": False, "total_events": 0, "error": "Audit ledger is empty"}

        expected_prev_hash = self.GENESIS_PREV_HASH
        for i, evt in enumerate(events):
            if evt["idx"] != i:
                return {
                    "valid": False,
                    "total_events": len(events),
                    "broken_index": i,
                    "error": f"Index gap detected at row {i}: expected {i}, got {evt['idx']}"
                }

            if evt["prev_hash"] != expected_prev_hash:
                return {
                    "valid": False,
                    "total_events": len(events),
                    "broken_index": i,
                    "error": (
                        f"Hash chain broken at index {i}: prev_hash '{evt['prev_hash']}' "
                        f"does not match previous block hash '{expected_prev_hash}'"
                    )
                }

            payload_to_verify = {
                "idx": evt["idx"],
                "event_id": evt["event_id"],
                "timestamp": evt["timestamp"],
                "actor": evt["actor"],
                "role": evt["role"],
                "action": evt["action"],
                "target_id": evt["target_id"],
                "details": evt["details"],
                "institution": evt["institution"],
                "privacy_status": evt["privacy_status"],
                "result": evt["result"],
                "prev_hash": evt["prev_hash"],
            }
            computed_hash = compute_sha256(canonical_serialize(payload_to_verify))
            if computed_hash != evt["hash"]:
                return {
                    "valid": False,
                    "total_events": len(events),
                    "broken_index": i,
                    "error": (
                        f"Tampering detected at index {i} (Event {evt['event_id']}): "
                        f"Stored hash '{evt['hash']}' does not match recomputed '{computed_hash}'"
                    )
                }

            expected_prev_hash = evt["hash"]

        return {
            "valid": True,
            "total_events": len(events),
            "latest_hash": events[-1]["hash"],
            "message": "All cryptographic links and SHA-256 signatures verified successfully"
        }

    def simulate_tamper(self, target_idx: int = 1) -> Dict[str, Any]:
        """
        Demonstrates tamper-evidence by altering a record directly in the DB.
        Subsequent chain verification will immediately flag the alteration.
        """
        with self._get_connection() as conn:
            cursor = conn.execute("SELECT * FROM audit_events WHERE idx = ?", (target_idx,))
            row = cursor.fetchone()
            if not row:
                return {"success": False, "error": f"Event at index {target_idx} not found"}

            original_details = row["details"]
            tampered_details = original_details + " [MALICIOUS ALTERATION INJECTED]"

            conn.execute(
                "UPDATE audit_events SET details = ? WHERE idx = ?",
                (tampered_details, target_idx)
            )
            conn.commit()

        return {
            "success": True,
            "tampered_index": target_idx,
            "original_details": original_details,
            "tampered_details": tampered_details,
            "warning": "Ledger has been modified without re-hashing; verification should now fail."
        }
