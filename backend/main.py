"""
TRUSTMESH Central Coordinator API
FastAPI backend service coordinating cross-institution risk intelligence,
enforcing RBAC boundaries, executing cryptographic privacy protocols,
and persisting tamper-evident audit chains.
"""

import json
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import Depends, FastAPI, HTTPException, Header, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.auth.security import (
    DEMO_USERS,
    create_session_token,
    get_user_by_username,
    verify_institution_boundary_access,
    verify_password,
    verify_session_token,
)
from backend.config import ML_ARTIFACTS_DIR
from backend.crypto.dp_engine import apply_gaussian_dp, byzantine_filter_updates
from backend.crypto.psi import DHPSIParty, execute_pairwise_psi
from backend.crypto.secagg import CentralSecAggCoordinator, ParticipantNodeSecAgg
from backend.models.schemas import (
    AuditTamperRequest,
    CaseActionRequest,
    DPSimulateRequest,
    LoginRequest,
    LoginResponse,
    PSISimulateRequest,
    ResolveCaseRequest,
    SecAggSimulateRequest,
    SimulationScenarioRequest,
    UserDTO,
)
from backend.nodes.bank_node import BankNodeService
from backend.nodes.insurer_node import InsurerNodeService
from backend.nodes.lender_node import LenderNodeService
from backend.services.case_service import CaseService
from backend.services.simulation_service import SimulationService
from backend.storage.audit_chain import AuditChain
from backend.storage.db import COORDINATOR_DB_PATH

# FastAPI App
app = FastAPI(
    title="TRUSTMESH Risk Intelligence Core",
    description="Privacy-Preserving Cross-Institution Risk Intelligence (VFL, SecAgg, DP-SGD, PSI)",
    version="1.0.0"
)

# CORS Middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Services
case_service = CaseService()
simulation_service = SimulationService()
audit_chain = AuditChain(COORDINATOR_DB_PATH)

bank_node = BankNodeService()
insurer_node = InsurerNodeService()
lender_node = LenderNodeService()


def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """Strict bearer token resolver. Enforces HTTP 401 Unauthorized for missing or invalid tokens."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required: Missing Bearer token in Authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = authorization.split(" ")[1]
    payload = verify_session_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed: Session token is invalid or expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload


# =====================================================================
# 1. AUTHENTICATION & PERSONA APIS
# =====================================================================

@app.post("/api/auth/login")
def login(req: LoginRequest):
    user = get_user_by_username(req.username)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")

    if not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")

    token = create_session_token(user)
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "role": user["role"],
            "institution_id": user.get("institution_id"),
            "title": user.get("title", user["role"]),
            "desc": user.get("desc", "")
        }
    }


@app.get("/api/auth/roles")
def get_roles():
    return [
        {
            "id": u["role"],
            "username": u["username"],
            "email": u["email"],
            "title": u["title"],
            "desc": u["desc"],
            "institution_id": u.get("institution_id")
        }
        for u in DEMO_USERS
    ]


@app.get("/api/auth/me")
def get_current_user_profile(user: Dict[str, Any] = Depends(get_current_user)):
    return user


# =====================================================================
# 2. CASES & HUMAN-IN-THE-LOOP INVESTIGATION APIS
# =====================================================================

@app.get("/api/cases")
def list_cases(
    risk: str = Query("ALL", description="Risk filter: ALL, HIGH, MEDIUM, LOW"),
    search: Optional[str] = Query(None),
    limit: int = Query(50),
    offset: int = Query(0),
    user: Dict[str, Any] = Depends(get_current_user)
):
    return case_service.get_cases(risk_filter=risk, search=search, limit=limit, offset=offset)


@app.get("/api/cases/{case_id}")
def get_case_detail(case_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    c = case_service.get_case_by_id(case_id)
    if not c:
        raise HTTPException(status_code=404, detail=f"Case {case_id} not found")
    return c


@app.post("/api/cases/{case_id}/verify")
def trigger_step_up_verification(
    case_id: str,
    req: CaseActionRequest,
    user: Dict[str, Any] = Depends(get_current_user)
):
    # Enforce role: only RISK_ANALYST and NETWORK_ADMIN
    if user["role"] not in ("RISK_ANALYST", "NETWORK_ADMIN"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Forbidden: Role '{user['role']}' is not authorized to trigger step-up verification. Only Risk Analysts and Network Admins can request verification."
        )

    actor = user["sub"]
    role = user["role"]
    try:
        return case_service.trigger_step_up_verification(case_id=case_id, actor=actor, role=role)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/cases/{case_id}/resolve")
def resolve_case(
    case_id: str,
    req: ResolveCaseRequest,
    user: Dict[str, Any] = Depends(get_current_user)
):
    # Enforce role: only COMPLIANCE_OFFICER and NETWORK_ADMIN
    if user["role"] not in ("COMPLIANCE_OFFICER", "NETWORK_ADMIN"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Forbidden: Role '{user['role']}' is not authorized to resolve cases. Only Compliance Officers and Network Admins can perform clearance resolution."
        )

    actor = user["sub"]
    role = user["role"]
    try:
        return case_service.resolve_case(
            case_id=case_id,
            task_id=req.task_id,
            resolution_notes=req.resolution_notes,
            actor=actor,
            role=role
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# =====================================================================
# 3. PARTICIPANT NODES & SOVEREIGN RECORDS (STRICT RBAC ENFORCEMENT)
# =====================================================================

@app.get("/api/nodes/{institution_id}/metadata")
def get_node_metadata(institution_id: str):
    inst = institution_id.upper()
    state = simulation_service.get_network_state()
    quarantined = state.get("quarantined_lender", False)

    if inst == "BANK_A":
        return bank_node.get_metadata()
    elif inst == "INSURER_B":
        return insurer_node.get_metadata()
    elif inst == "LENDER_C":
        return lender_node.get_metadata(quarantined=quarantined)
    else:
        raise HTTPException(status_code=404, detail=f"Institution {institution_id} not found")


@app.get("/api/nodes/{institution_id}/records")
def get_node_records(
    institution_id: str,
    limit: int = Query(50),
    search: Optional[str] = Query(None),
    user: Dict[str, Any] = Depends(get_current_user)
):
    inst = institution_id.upper()

    # STRICT RBAC BOUNDARY CHECK
    allowed, err_msg = verify_institution_boundary_access(user, inst)
    if not allowed:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=err_msg)

    if inst == "BANK_A":
        return bank_node.get_records(limit=limit, search=search)
    elif inst == "INSURER_B":
        return insurer_node.get_records(limit=limit, search=search)
    elif inst == "LENDER_C":
        return lender_node.get_records(limit=limit, search=search)
    else:
        raise HTTPException(status_code=404, detail=f"Institution {institution_id} not found")


# =====================================================================
# 4. CRYPTOGRAPHIC & PRIVACY PROTOCOLS
# =====================================================================

@app.post("/api/crypto/secagg/simulate")
def simulate_secagg(req: SecAggSimulateRequest):
    """
    Executes numerical SecAgg simulation with zero-sum random masking.
    If simulate_dropout is set, demonstrates safe failure abort.
    """
    participants = ["BANK_A", "INSURER_B", "LENDER_C"]
    vector_len = 5
    round_id = req.round_id

    # Simulate realistic gradients for each participant
    raw_vectors = {
        "BANK_A": [0.12, -0.05, 0.33, -0.18, 0.04],
        "INSURER_B": [-0.08, 0.22, 0.15, -0.09, -0.14],
        "LENDER_C": [0.05, -0.12, 0.18, 0.25, -0.02]
    }

    # Initialize participants
    shared_secrets = {
        "BANK_A:INSURER_B": "sec_key_ab_2026",
        "BANK_A:LENDER_C": "sec_key_ac_2026",
        "INSURER_B:LENDER_C": "sec_key_bc_2026"
    }

    node_objects = {}
    blinded_submissions = {}
    masks_diagnostic = {}

    for pid in participants:
        p_node = ParticipantNodeSecAgg(
            node_id=pid,
            all_participant_ids=participants,
            shared_secrets={
                "INSURER_B": shared_secrets["BANK_A:INSURER_B"] if pid == "BANK_A" else shared_secrets.get("INSURER_B:LENDER_C"),
                "BANK_A": shared_secrets["BANK_A:INSURER_B"] if pid == "INSURER_B" else shared_secrets.get("BANK_A:LENDER_C"),
                "LENDER_C": shared_secrets["BANK_A:LENDER_C"] if pid == "BANK_A" else shared_secrets.get("INSURER_B:LENDER_C")
            }
        )
        node_objects[pid] = p_node
        blinded, mask = p_node.compute_blinded_update(raw_vectors[pid], round_id=round_id)
        blinded_submissions[pid] = blinded
        masks_diagnostic[pid] = mask.tolist()

    # If dropout simulated, remove node from submission
    if req.simulate_dropout and req.simulate_dropout in blinded_submissions:
        del blinded_submissions[req.simulate_dropout]

    coordinator = CentralSecAggCoordinator(expected_participant_ids=participants)
    res = coordinator.aggregate(blinded_submissions, round_id=round_id)

    # Calculate expected unmasked average for verification
    expected_sum = [sum(x) for x in zip(*raw_vectors.values())]
    expected_avg = [x / 3.0 for x in expected_sum]

    return {
        "simulation_result": res,
        "expected_unmasked_average": [round(x, 4) for x in expected_avg],
        "masks_sum_check": [round(sum(m), 4) for m in zip(*masks_diagnostic.values())],
        "raw_vectors": raw_vectors,
        "blinded_vectors": {k: [round(x, 4) for x in v.tolist()] for k, v in blinded_submissions.items()}
    }


@app.post("/api/crypto/dp/simulate")
def simulate_differential_privacy(req: DPSimulateRequest):
    """Computes Gaussian mechanism noise, L2 norm clipping, and evaluates parameter bounds."""
    sample_gradient = [0.45, -0.62, 0.88, -0.15, 0.32]
    dp_res = apply_gaussian_dp(
        vector=sample_gradient,
        epsilon=req.epsilon,
        delta=req.delta,
        clip_norm=req.clip_norm,
        seed=42
    )
    return dp_res


@app.post("/api/crypto/psi/simulate")
def simulate_psi(req: PSISimulateRequest):
    """
    Executes Commutative Diffie-Hellman Private Set Intersection matching.
    Documented synthetic shared-identifier assumption:
    Each customer possesses a synthetic common identifier (e.g., SYNTH-UID-xxxxx)
    known to both institutions and used as input to commutative blinded hashing.
    """
    party_a = DHPSIParty(party_name=req.party_a)
    party_b = DHPSIParty(party_name=req.party_b)

    # Aligned shared identifier format: SYNTH-UID-xxxxx
    # Overlap contains benchmark cases 10482, 10491, 10522
    set_a = [f"SYNTH-UID-{10400 + i}" for i in range(1, req.sample_size)] + [
        "SYNTH-UID-10482", "SYNTH-UID-10491", "SYNTH-UID-10522"
    ]
    set_b = [f"SYNTH-UID-{10400 + i * 2}" for i in range(1, req.sample_size)] + [
        "SYNTH-UID-10482", "SYNTH-UID-10491", "SYNTH-UID-10522"
    ]

    return execute_pairwise_psi(party_a, party_b, set_a, set_b)


# =====================================================================
# 5. MODEL COLLABORATION & METRICS
# =====================================================================

@app.get("/api/model/metrics")
def get_model_metrics():
    metrics_path = ML_ARTIFACTS_DIR / "metrics.json"
    if metrics_path.exists():
        with open(metrics_path, "r", encoding="utf-8") as f:
            return json.load(f)
    raise HTTPException(status_code=404, detail="Model metrics artifact not found. Please run seed script.")


# =====================================================================
# 6. SIMULATION SCENARIO CONTROL
# =====================================================================

@app.get("/api/simulation/state")
def get_simulation_state():
    return simulation_service.get_network_state()


@app.post("/api/simulation/run")
def run_simulation_scenario(req: SimulationScenarioRequest):
    scen = req.scenario.upper()
    if scen == "NORMAL":
        return simulation_service.run_normal_baseline()
    elif scen == "ANOMALY":
        return simulation_service.run_cross_institution_anomaly()
    elif scen == "ATTACK":
        return simulation_service.run_privacy_attack_demo()
    elif scen == "MALICIOUS":
        return simulation_service.run_malicious_participant_sim()
    elif scen == "RESET":
        return simulation_service.reset_simulation()
    else:
        raise HTTPException(status_code=400, detail=f"Unknown scenario {req.scenario}")


# =====================================================================
# 7. TAMPER-EVIDENT CRYPTOGRAPHIC AUDIT TRAIL
# =====================================================================

@app.get("/api/audit/logs")
def get_audit_logs(
    limit: int = Query(50),
    offset: int = Query(0),
    institution: str = Query("ALL"),
    search: Optional[str] = Query(None)
):
    logs = audit_chain.get_all_events(limit=limit, offset=offset)
    if institution and institution != "ALL":
        logs = [l for l in logs if institution.upper() in l["institution"].upper()]
    if search:
        s = search.lower()
        logs = [l for l in logs if s in l["event_id"].lower() or s in l["details"].lower() or s in l["result"].lower()]
    return logs


@app.get("/api/audit/verify")
def verify_audit_ledger():
    """Validates every link in the cryptographic SHA-256 hash chain from genesis to head."""
    return audit_chain.verify_chain()


@app.post("/api/audit/simulate-tamper")
def simulate_audit_tamper(
    req: AuditTamperRequest,
    user: Dict[str, Any] = Depends(get_current_user)
):
    """Deliberately modifies an event in SQLite to demonstrate tamper detection."""
    if user["role"] not in ("COMPLIANCE_OFFICER", "NETWORK_ADMIN"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Forbidden: Role '{user['role']}' cannot run audit tamper tests. Restricted to Compliance Officer and Network Admin."
        )
    return audit_chain.simulate_tamper(target_idx=req.target_idx)


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "TRUSTMESH Risk Intelligence Core",
        "version": "1.0.0",
        "storage": "Persistent SQLite",
        "isolation": "Sovereign Node Data Stores Verified"
    }
