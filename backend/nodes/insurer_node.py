"""
TRUSTMESH Insurer B Participant Node
Maintains sovereign custody over Insurer B's private policy and claim records and local schema.
Enforces local data isolation: raw records NEVER leave the node.
"""

import sqlite3
from typing import Any, Dict, List, Optional
from backend.config import INSURER_B_DB_PATH
from backend.storage.db import get_db_connection


class InsurerNodeService:
    INSTITUTION_ID = "INSURER_B"
    NAME = "Insurer B (General & Property)"
    TYPE = "Insurance Provider"

    SCHEMA = [
        {"field": "claim_frequency_rate", "type": "Float (0.0 - 10.0)", "desc": "Claims submitted per 24-month exposure"},
        {"field": "claim_anomaly_score", "type": "Index (0 - 100)", "desc": "Multi-factor policy claim deviation index"},
        {"field": "policy_behaviour_tier", "type": "Enum (Standard, Watch, High)", "desc": "Underwriting risk cohort"},
        {"field": "policy_tenure_days", "type": "Integer", "desc": "Active days under active binder"},
        {"field": "loss_ratio_exposure", "type": "Float (0.0 - 2.5)", "desc": "Cumulative paid loss vs earned premium"}
    ]

    def __init__(self, db_path=INSURER_B_DB_PATH):
        self.db_path = db_path

    def get_records(self, limit: int = 50, search: Optional[str] = None) -> List[Dict[str, Any]]:
        with get_db_connection(self.db_path) as conn:
            query = "SELECT * FROM insurer_policies"
            params = []
            if search:
                query += " WHERE id LIKE ? OR customer_ref LIKE ? OR entity_ref LIKE ?"
                s = f"%{search}%"
                params.extend([s, s, s])
            query += " ORDER BY id ASC LIMIT ?"
            params.append(limit)

            cursor = conn.execute(query, params)
            return [dict(row) for row in cursor.fetchall()]

    def get_record_by_entity(self, entity_ref: str) -> Optional[Dict[str, Any]]:
        with get_db_connection(self.db_path) as conn:
            cursor = conn.execute("SELECT * FROM insurer_policies WHERE entity_ref = ? LIMIT 1", (entity_ref,))
            row = cursor.fetchone()
            return dict(row) if row else None

    def get_metadata(self) -> Dict[str, Any]:
        with get_db_connection(self.db_path) as conn:
            cursor = conn.execute("SELECT COUNT(*) FROM insurer_policies")
            total = cursor.fetchone()[0]

            cursor2 = conn.execute("SELECT AVG(claim_frequency_rate) FROM insurer_policies")
            avg_freq = cursor2.fetchone()[0] or 0.18

            cursor3 = conn.execute("SELECT COUNT(*) FROM insurer_policies WHERE local_flag != 'Normal'")
            anomalies = cursor3.fetchone()[0]

        return {
            "id": self.INSTITUTION_ID,
            "name": self.NAME,
            "type": self.TYPE,
            "status": "Connected",
            "syntheticRecords": total,
            "localModelStatus": "Healthy",
            "lastUpdate": "24 seconds ago",
            "trustScore": 92,
            "complianceStatus": "Verified (Homomorphic Ciphers & SecAgg)",
            "privateDataSchema": self.SCHEMA,
            "summaryStats": {
                "avgClaimFrequency": f"{round(avg_freq, 2)} / yr",
                "activePolicies": total,
                "flaggedLocalAnomalies": anomalies
            }
        }
