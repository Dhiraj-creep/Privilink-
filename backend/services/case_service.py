"""
TRUSTMESH Case Service
Centralized business logic for risk cases, human-in-the-loop step-up verification, and state transitions.
Ensures single source of truth for case status, dynamic minimum disclosure matrices, and audit logging.
"""

import json
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

from backend.config import COORDINATOR_DB_PATH
from backend.storage.audit_chain import AuditChain
from backend.storage.db import get_db_connection


class CaseService:
    def __init__(self, db_path=COORDINATOR_DB_PATH):
        self.db_path = db_path
        self.audit_chain = AuditChain(db_path)

    def get_cases(
        self,
        risk_filter: str = "ALL",
        search: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        with get_db_connection(self.db_path) as conn:
            query = "SELECT * FROM cases WHERE 1=1"
            params = []

            if risk_filter and risk_filter.upper() != "ALL":
                query += " AND risk_level = ?"
                params.append(risk_filter.upper())

            if search:
                query += " AND (id LIKE ? OR customer_id LIKE ? OR entity_ref LIKE ? OR explanation LIKE ?)"
                s = f"%{search}%"
                params.extend([s, s, s, s])

            query += " ORDER BY id ASC LIMIT ? OFFSET ?"
            params.extend([limit, offset])

            cursor = conn.execute(query, params)
            rows = cursor.fetchall()

            cases = []
            for r in rows:
                c = dict(r)
                c["localEvidence"] = json.loads(c.pop("local_evidence_json"))
                c["contributions"] = json.loads(c.pop("contributions_json"))
                c["minimumDisclosure"] = json.loads(c.pop("disclosure_json"))
                c["lastEscalation"] = c.pop("last_escalation")
                c["riskLevel"] = c.pop("risk_level")
                c["customerId"] = c.pop("customer_id")
                c["entityRef"] = c.pop("entity_ref")
                cases.append(c)

            return cases

    def get_case_by_id(self, case_id: str) -> Optional[Dict[str, Any]]:
        with get_db_connection(self.db_path) as conn:
            cursor = conn.execute("SELECT * FROM cases WHERE id = ? LIMIT 1", (case_id,))
            row = cursor.fetchone()
            if not row:
                return None

            c = dict(row)
            c["localEvidence"] = json.loads(c.pop("local_evidence_json"))
            c["contributions"] = json.loads(c.pop("contributions_json"))
            c["minimumDisclosure"] = json.loads(c.pop("disclosure_json"))
            c["lastEscalation"] = c.pop("last_escalation")
            c["riskLevel"] = c.pop("risk_level")
            c["customerId"] = c.pop("customer_id")
            c["entityRef"] = c.pop("entity_ref")

            # Fetch case history
            cursor2 = conn.execute(
                "SELECT * FROM case_history WHERE case_id = ? ORDER BY id ASC",
                (case_id,)
            )
            c["history"] = [dict(h) for h in cursor2.fetchall()]

            # Fetch any pending verification task
            cursor3 = conn.execute(
                "SELECT * FROM verification_tasks WHERE case_id = ? ORDER BY requested_at DESC LIMIT 1",
                (case_id,)
            )
            task_row = cursor3.fetchone()
            c["verificationTask"] = dict(task_row) if task_row else None
            c["activeTaskId"] = task_row["id"] if (task_row and task_row["status"] == "REQUESTED") else None

            return c

    def trigger_step_up_verification(
        self,
        case_id: str,
        actor: str = "RISK_ANALYST_01",
        role: str = "RISK_ANALYST"
    ) -> Dict[str, Any]:
        """
        Transitions case to VERIFICATION_REQUESTED.
        Creates an internal investigation task and logs an immutable SHA-256 audit entry.
        """
        now = datetime.now(timezone.utc).isoformat()

        with get_db_connection(self.db_path) as conn:
            cursor = conn.execute("SELECT * FROM cases WHERE id = ?", (case_id,))
            row = cursor.fetchone()
            if not row:
                raise ValueError(f"Case {case_id} not found")

            prev_status = row["status"]
            if prev_status == "VERIFICATION_REQUESTED":
                raise ValueError(f"Case {case_id} is already in VERIFICATION_REQUESTED status")

            new_status = "VERIFICATION_REQUESTED"

            # Update case
            conn.execute(
                "UPDATE cases SET status = ?, updated_at = ? WHERE id = ?",
                (new_status, now, case_id)
            )

            # Insert history
            conn.execute("""
                INSERT INTO case_history (case_id, timestamp, action, actor, details, previous_status, new_status)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                case_id,
                now,
                "TRIGGER_STEP_UP_VERIFICATION",
                actor,
                "Human analyst requested secondary KYC source-of-funds verification",
                prev_status,
                new_status
            ))

            # Create internal task
            task_id = f"TASK-{case_id}-{int(datetime.now().timestamp())}"
            conn.execute("""
                INSERT INTO verification_tasks (id, case_id, status, requested_by, requested_at, assigned_to, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                task_id,
                case_id,
                "REQUESTED",
                actor,
                now,
                "Compliance Desk 2",
                "Request utility bill & secondary identification documents"
            ))
            conn.commit()

        # Append to Audit Ledger
        audit_event = self.audit_chain.append_event(
            actor=actor,
            role=role,
            action="TRIGGER_STEP_UP_VERIFICATION",
            target_id=case_id,
            details=f"Step-Up KYC verification dispatched for {case_id}. Status transitioned from {prev_status} to {new_status}.",
            institution="TRUSTMESH Network",
            privacy_status="Decision Support Dispatched",
            result=f"Task {task_id} Created"
        )

        return {
            "success": True,
            "case_id": case_id,
            "task_id": task_id,
            "new_status": new_status,
            "audit_hash": audit_event["hash"]
        }

    def resolve_case(
        self,
        case_id: str,
        task_id: str,
        resolution_notes: str,
        actor: str = "COMPLIANCE_OFFICER_01",
        role: str = "COMPLIANCE_OFFICER"
    ) -> Dict[str, Any]:
        """Resolves an open step-up verification case with strict task ID and case association validation."""
        now = datetime.now(timezone.utc).isoformat()

        with get_db_connection(self.db_path) as conn:
            # 1. Verify case exists and is in VERIFICATION_REQUESTED state
            cur_case = conn.execute("SELECT status FROM cases WHERE id = ?", (case_id,))
            case_row = cur_case.fetchone()
            if not case_row:
                raise ValueError(f"Case '{case_id}' not found.")
            if case_row["status"] != "VERIFICATION_REQUESTED":
                raise ValueError(
                    f"Illegal state transition: Case '{case_id}' is in status '{case_row['status']}'. "
                    f"Only cases with status 'VERIFICATION_REQUESTED' can be resolved."
                )

            # 2. Verify task exists, matches case_id, and is currently REQUESTED
            cur_task = conn.execute("SELECT * FROM verification_tasks WHERE id = ?", (task_id,))
            task_row = cur_task.fetchone()
            if not task_row:
                raise ValueError(f"Task '{task_id}' does not exist.")
            if task_row["case_id"] != case_id:
                raise ValueError(
                    f"Task ownership violation: Task '{task_id}' is assigned to case '{task_row['case_id']}', "
                    f"not '{case_id}'."
                )
            if task_row["status"] != "REQUESTED":
                raise ValueError(f"Task '{task_id}' is already in status '{task_row['status']}'.")

            # 3. Apply atomic updates
            conn.execute(
                "UPDATE cases SET status = 'RESOLVED', updated_at = ? WHERE id = ?",
                (now, case_id)
            )
            conn.execute("""
                UPDATE verification_tasks
                SET status = 'RESOLVED', notes = ?, resolved_at = ?
                WHERE id = ?
            """, (resolution_notes, now, task_id))

            conn.execute("""
                INSERT INTO case_history (case_id, timestamp, action, actor, details, previous_status, new_status)
                VALUES (?, ?, ?, ?, ?, 'VERIFICATION_REQUESTED', 'RESOLVED')
            """, (
                case_id,
                now,
                "RESOLVE_VERIFICATION",
                actor,
                f"Resolved: {resolution_notes}",
            ))
            conn.commit()

        audit_event = self.audit_chain.append_event(
            actor=actor,
            role=role,
            action="RESOLVE_VERIFICATION",
            target_id=case_id,
            details=f"Verification task {task_id} resolved for {case_id}: {resolution_notes}",
            institution="TRUSTMESH Network",
            privacy_status="Audited Clearance",
            result="Case Resolved"
        )

        return {
            "success": True,
            "case_id": case_id,
            "task_id": task_id,
            "status": "RESOLVED",
            "audit_hash": audit_event["hash"]
        }
