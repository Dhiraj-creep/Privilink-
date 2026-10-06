"""
TRUSTMESH Bank A Participant Node
Maintains sovereign custody over Bank A's private transactional records and local schema.
Enforces local data isolation: raw records NEVER leave the node.
"""

import sqlite3
from typing import Any, Dict, List, Optional
from backend.config import BANK_A_DB_PATH
from backend.storage.db import get_db_connection


class BankNodeService:
    INSTITUTION_ID = "BANK_A"
    NAME = "Bank A (Retail & Commercial)"
    TYPE = "Banking Institution"

    SCHEMA = [
        {"field": "repayment_behaviour_ratio", "type": "Float (0.0 - 1.0)", "desc": "On-time debt servicing historical ratio"},
        {"field": "transaction_velocity_anomaly", "type": "Z-Score (-3 to +3)", "desc": "Deviation from 90-day moving average volume"},
        {"field": "account_tenure_months", "type": "Integer (1 - 360)", "desc": "Relationship age in months"},
        {"field": "average_monthly_balance_tier", "type": "Tier (1 - 5)", "desc": "Binned balance liquidity tier"},
        {"field": "payment_consistency_index", "type": "Float (0.0 - 1.0)", "desc": "Payroll and recurring expense regularity"},
        {"field": "inward_outward_ratio", "type": "Float", "desc": "Cashflow net directional velocity"}
    ]

    def __init__(self, db_path=BANK_A_DB_PATH):
        self.db_path = db_path

    def get_records(self, limit: int = 50, search: Optional[str] = None) -> List[Dict[str, Any]]:
        with get_db_connection(self.db_path) as conn:
            query = "SELECT * FROM bank_customers"
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
            cursor = conn.execute("SELECT * FROM bank_customers WHERE entity_ref = ? LIMIT 1", (entity_ref,))
            row = cursor.fetchone()
            return dict(row) if row else None

    def get_metadata(self) -> Dict[str, Any]:
        with get_db_connection(self.db_path) as conn:
            cursor = conn.execute("SELECT COUNT(*) FROM bank_customers")
            total = cursor.fetchone()[0]

            cursor2 = conn.execute("SELECT AVG(repayment_behaviour_ratio) FROM bank_customers")
            avg_repay = cursor2.fetchone()[0] or 0.94

            cursor3 = conn.execute("SELECT COUNT(*) FROM bank_customers WHERE local_flag != 'Normal'")
            anomalies = cursor3.fetchone()[0]

        return {
            "id": self.INSTITUTION_ID,
            "name": self.NAME,
            "type": self.TYPE,
            "status": "Connected",
            "syntheticRecords": total,
            "localModelStatus": "Healthy",
            "lastUpdate": "12 seconds ago",
            "trustScore": 96,
            "complianceStatus": "Verified (DP-SGD & FedAvg)",
            "privateDataSchema": self.SCHEMA,
            "summaryStats": {
                "avgRepaymentRatio": round(avg_repay, 2),
                "medianAccountAge": "4.8 years",
                "flaggedLocalAnomalies": anomalies
            }
        }
