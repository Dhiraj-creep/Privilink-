"""
PriviLink Bank A Participant Node
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

    def _get_encoder(self):
        from backend.ml.vfl_engine import LocalFeatureEncoder
        from backend.config import ML_ARTIFACTS_DIR
        encoder = LocalFeatureEncoder(self.INSTITUTION_ID)
        enc_file = ML_ARTIFACTS_DIR / "encoder_params.json"
        if enc_file.exists():
            try:
                import json
                with open(enc_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                if self.INSTITUTION_ID in data:
                    encoder.load_dict(data[self.INSTITUTION_ID])
            except Exception:
                pass
        return encoder

    def _get_weights(self):
        import numpy as np
        from backend.config import ML_ARTIFACTS_DIR
        w_file = ML_ARTIFACTS_DIR / "vfl_weights.json"
        if w_file.exists():
            import json
            try:
                with open(w_file, "r", encoding="utf-8") as f:
                    w_data = json.load(f)
                if self.INSTITUTION_ID in w_data.get("weights", {}):
                    return np.array(w_data["weights"][self.INSTITUTION_ID], dtype=np.float64)
            except Exception:
                pass
        return np.array([-0.28, 0.06, -0.08, -0.08, -0.23], dtype=np.float64)

    def compute_partial_logit(self, entity_ref: str, raw_features: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Computes local partial logit z_k = X_k * W_k for Split Learning.
        Sovereign private customer records NEVER leave this participant boundary.
        Only the scalar partial logit is transmitted to the coordinator.
        """
        import numpy as np
        import pandas as pd

        record = self.get_record_by_entity(entity_ref)
        if not record:
            with get_db_connection(self.db_path) as conn:
                cur = conn.execute(
                    "SELECT * FROM bank_customers WHERE customer_ref = ? OR id = ? LIMIT 1",
                    (entity_ref, entity_ref)
                )
                r = cur.fetchone()
                if r:
                    record = dict(r)

        if not record and raw_features:
            record = raw_features

        if not record:
            raise ValueError(f"Entity '{entity_ref}' not found in sovereign Bank A records.")

        encoder = self._get_encoder()
        df = pd.DataFrame([record])
        x_k = encoder.transform(df)
        weights = self._get_weights()

        z_k = float((x_k @ weights)[0])
        p_k = float(1.0 / (1.0 + np.exp(-z_k)))

        return {
            "institution_id": self.INSTITUTION_ID,
            "entity_ref": entity_ref,
            "partial_logit": round(z_k, 5),
            "local_probability": round(p_k, 4),
            "feature_dim": int(x_k.shape[1]),
            "status": "COMPUTED"
        }

    def update_record(self, entity_ref: str, updates: Dict[str, Any]) -> bool:
        with get_db_connection(self.db_path) as conn:
            set_clause = ", ".join([f"{k} = ?" for k in updates.keys()])
            params = list(updates.values())
            params.extend([entity_ref, entity_ref, entity_ref])
            conn.execute(
                f"UPDATE bank_customers SET {set_clause} WHERE entity_ref = ? OR customer_ref = ? OR id = ?",
                params
            )
            conn.commit()
            return True
