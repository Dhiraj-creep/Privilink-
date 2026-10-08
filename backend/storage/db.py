"""
PriviLink Database Manager
Manages isolated SQLite databases for Coordinator and Independent Participant Nodes (Bank A, Insurer B, Lender C).
Provides connection helpers and table schemas.
"""

import json
import sqlite3
from pathlib import Path
from typing import Any, Dict, Optional

from backend.config import (
    BANK_A_DB_PATH,
    COORDINATOR_DB_PATH,
    INSURER_B_DB_PATH,
    LENDER_C_DB_PATH,
)


def get_db_connection(db_path: Path) -> sqlite3.Connection:
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    return conn


def init_coordinator_db(db_path: Path = COORDINATOR_DB_PATH) -> None:
    """Initializes schemas for coordinator: cases, case history, tasks, users, and network state."""
    with get_db_connection(db_path) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL,
                institution_id TEXT
            )
        """)

        conn.execute("""
            CREATE TABLE IF NOT EXISTS cases (
                id TEXT PRIMARY KEY,
                customer_id TEXT NOT NULL,
                entity_ref TEXT NOT NULL,
                risk_level TEXT NOT NULL,
                confidence REAL NOT NULL,
                score REAL NOT NULL,
                action TEXT NOT NULL,
                status TEXT NOT NULL,
                last_escalation TEXT NOT NULL,
                explanation TEXT NOT NULL,
                local_evidence_json TEXT NOT NULL,
                contributions_json TEXT NOT NULL,
                disclosure_json TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        """)

        conn.execute("""
            CREATE TABLE IF NOT EXISTS case_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                case_id TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                action TEXT NOT NULL,
                actor TEXT NOT NULL,
                details TEXT NOT NULL,
                previous_status TEXT NOT NULL,
                new_status TEXT NOT NULL,
                FOREIGN KEY (case_id) REFERENCES cases(id)
            )
        """)

        conn.execute("""
            CREATE TABLE IF NOT EXISTS verification_tasks (
                id TEXT PRIMARY KEY,
                case_id TEXT NOT NULL,
                status TEXT NOT NULL,
                requested_by TEXT NOT NULL,
                requested_at TEXT NOT NULL,
                assigned_to TEXT,
                notes TEXT,
                resolved_at TEXT,
                FOREIGN KEY (case_id) REFERENCES cases(id)
            )
        """)

        conn.execute("""
            CREATE TABLE IF NOT EXISTS network_state (
                key TEXT PRIMARY KEY,
                value_json TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        """)
        conn.commit()


def init_bank_node_db(db_path: Path = BANK_A_DB_PATH) -> None:
    """Initializes private local schema for Bank A."""
    with get_db_connection(db_path) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS bank_customers (
                id TEXT PRIMARY KEY,
                customer_ref TEXT NOT NULL,
                entity_ref TEXT NOT NULL,
                repayment_behaviour_ratio REAL NOT NULL,
                transaction_velocity_anomaly REAL NOT NULL,
                account_tenure_months INTEGER NOT NULL,
                average_monthly_balance_tier INTEGER NOT NULL,
                payment_consistency_index REAL NOT NULL,
                inward_outward_ratio REAL NOT NULL,
                local_flag TEXT NOT NULL
            )
        """)
        conn.commit()


def init_insurer_node_db(db_path: Path = INSURER_B_DB_PATH) -> None:
    """Initializes private local schema for Insurer B."""
    with get_db_connection(db_path) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS insurer_policies (
                id TEXT PRIMARY KEY,
                customer_ref TEXT NOT NULL,
                entity_ref TEXT NOT NULL,
                claim_frequency_rate REAL NOT NULL,
                claim_anomaly_score REAL NOT NULL,
                policy_behaviour_tier TEXT NOT NULL,
                policy_tenure_days INTEGER NOT NULL,
                loss_ratio_exposure REAL NOT NULL,
                local_flag TEXT NOT NULL
            )
        """)
        conn.commit()


def init_lender_node_db(db_path: Path = LENDER_C_DB_PATH) -> None:
    """Initializes private local schema for Lender C."""
    with get_db_connection(db_path) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS lender_facilities (
                id TEXT PRIMARY KEY,
                customer_ref TEXT NOT NULL,
                entity_ref TEXT NOT NULL,
                loan_application_velocity INTEGER NOT NULL,
                repayment_stress_indicator REAL NOT NULL,
                borrowing_behaviour_deviation REAL NOT NULL,
                credit_utilization_trajectory REAL NOT NULL,
                dti_synthetic_band TEXT NOT NULL,
                local_flag TEXT NOT NULL
            )
        """)
        conn.commit()


def init_all_databases() -> None:
    """Initializes all coordinator and participant node databases."""
    init_coordinator_db()
    init_bank_node_db()
    init_insurer_node_db()
    init_lender_node_db()
