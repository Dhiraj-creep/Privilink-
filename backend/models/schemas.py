"""
TRUSTMESH Pydantic Schemas
Validated API request and response schemas for FastAPI.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    username: str
    password: str


class UserDTO(BaseModel):
    id: int
    username: str
    email: str
    role: str
    institution_id: Optional[str] = None
    title: str
    desc: str


class LoginResponse(BaseModel):
    token: str
    user: UserDTO


class CaseActionRequest(BaseModel):
    actor: Optional[str] = "RISK_ANALYST"
    role: Optional[str] = "RISK_ANALYST"


class ResolveCaseRequest(BaseModel):
    task_id: str
    resolution_notes: str
    actor: Optional[str] = "COMPLIANCE_OFFICER"
    role: Optional[str] = "COMPLIANCE_OFFICER"


class SecAggSimulateRequest(BaseModel):
    participant_ids: List[str] = Field(default_factory=lambda: ["BANK_A", "INSURER_B", "LENDER_C"])
    round_id: int = 27
    simulate_dropout: Optional[str] = None  # e.g., "LENDER_C" to test failure handling


class DPSimulateRequest(BaseModel):
    epsilon: float = 1.5
    delta: float = 1e-5
    clip_norm: float = 1.0


class PSISimulateRequest(BaseModel):
    party_a: str = "BANK_A"
    party_b: str = "INSURER_B"
    sample_size: int = 20


class SimulationScenarioRequest(BaseModel):
    scenario: str  # "NORMAL", "ANOMALY", "ATTACK", "MALICIOUS", "DRIFT", "RESET"


class AuditTamperRequest(BaseModel):
    target_idx: int = 1


class DemoLoginRequest(BaseModel):
    username: str


class ComputePartialLogitRequest(BaseModel):
    entity_ref: str
    raw_features: Optional[Dict[str, Any]] = None
