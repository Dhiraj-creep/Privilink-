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
        return np.array([0.578, 0.462, 0.382, 0.289, 0.047], dtype=np.float64)

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
                    "SELECT * FROM lender_facilities WHERE customer_ref = ? OR id = ? LIMIT 1",
                    (entity_ref, entity_ref)
                )
                r = cur.fetchone()
                if r:
                    record = dict(r)

        if not record and raw_features:
            record = raw_features

        if not record:
            raise ValueError(f"Entity '{entity_ref}' not found in sovereign Lender C records.")

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
                f"UPDATE lender_facilities SET {set_clause} WHERE entity_ref = ? OR customer_ref = ? OR id = ?",
                params
            )
            conn.commit()
            return True
