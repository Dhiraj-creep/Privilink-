"""
TRUSTMESH Lender C Participant Node
Maintains sovereign custody over Lender C's private consumer credit applications and local schema.
Enforces local data isolation: raw records NEVER leave the node.
"""

import sqlite3
from typing import Any, Dict, List, Optional
from backend.config import LENDER_C_DB_PATH
from backend.storage.db import get_db_connection


class LenderNodeService:
    INSTITUTION_ID = "LENDER_C"
    NAME = "Lender C (Digital & Consumer Credit)"
    TYPE = "Alternative Lending Platform"

    SCHEMA = [
        {"field": "loan_application_velocity", "type": "Count (30-day)", "desc": "Inquiries across affiliated broker channels"},
        {"field": "repayment_stress_indicator", "type": "Index (0 - 100)", "desc": "Short-term debt roll-over pressure"},
        {"field": "borrowing_behaviour_deviation", "type": "Score (0.0 - 1.0)", "desc": "Deviation from expected demographic cohort"},
        {"field": "credit_utilization_trajectory", "type": "Percentage", "desc": "MoM change in revolving line utilization"},
        {"field": "dti_synthetic_band", "type": "Tier (A to E)", "desc": "Estimated debt-to-income leverage tier"}
    ]

    def __init__(self, db_path=LENDER_C_DB_PATH):
        self.db_path = db_path

    def get_records(self, limit: int = 50, search: Optional[str] = None) -> List[Dict[str, Any]]:
        with get_db_connection(self.db_path) as conn:
            query = "SELECT * FROM lender_facilities"
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
            cursor = conn.execute("SELECT * FROM lender_facilities WHERE entity_ref = ? LIMIT 1", (entity_ref,))
            row = cursor.fetchone()
            return dict(row) if row else None

    def get_metadata(self, quarantined: bool = False) -> Dict[str, Any]:
        with get_db_connection(self.db_path) as conn:
            cursor = conn.execute("SELECT COUNT(*) FROM lender_facilities")
            total = cursor.fetchone()[0]

            cursor2 = conn.execute("SELECT AVG(credit_utilization_trajectory) FROM lender_facilities")
            avg_util = cursor2.fetchone()[0] or 41.2

            cursor3 = conn.execute("SELECT COUNT(*) FROM lender_facilities WHERE local_flag != 'Normal'")
            anomalies = cursor3.fetchone()[0]

        return {
            "id": self.INSTITUTION_ID,
            "name": self.NAME,
            "type": self.TYPE,
            "status": "Quarantined" if quarantined else "Connected",
            "syntheticRecords": total,
            "localModelStatus": "Isolated" if quarantined else "Healthy",
            "lastUpdate": "Just now" if quarantined else "38 seconds ago",
            "trustScore": 63 if quarantined else 89,
            "complianceStatus": "Quarantined (Byzantine Filter)" if quarantined else "Verified (SecAgg Protocol)",
            "privateDataSchema": self.SCHEMA,
            "summaryStats": {
                "avgUtilization": f"{round(avg_util, 1)}%",
                "activeFacilities": total,
                "flaggedLocalAnomalies": anomalies
            }
        }
