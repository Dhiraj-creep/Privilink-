"""
TRUSTMESH Sovereign Participant Nodes Server Runner
Runs independent node microservices for Bank A (8001), Insurer B (8002), and Lender C (8003).
Demonstrates physical process and database isolation.
"""

import sys
from pathlib import Path
from typing import Any, Dict, Optional
import uvicorn
from fastapi import FastAPI, HTTPException, Query, Header, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Ensure backend in path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.config import BANK_A_PORT, INSURER_B_PORT, LENDER_C_PORT, INTERNAL_SERVICE_KEY, TRUSTMESH_ENV
from backend.auth.security import verify_session_token, verify_institution_boundary_access
from backend.models.schemas import ComputePartialLogitRequest
from backend.nodes.bank_node import BankNodeService
from backend.nodes.insurer_node import InsurerNodeService
from backend.nodes.lender_node import LenderNodeService


def create_node_app(node_name: str, node_service) -> FastAPI:
    app = FastAPI(title=f"TRUSTMESH Sovereign Node - {node_name}")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/records")
    def get_records(
        limit: int = Query(50),
        search: Optional[str] = Query(None),
        authorization: Optional[str] = Header(None)
    ):
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Authentication required: Direct sovereign node access to {node_name} requires Bearer token",
                headers={"WWW-Authenticate": "Bearer"}
            )
        token = authorization.split(" ")[1]
        user = verify_session_token(token)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication failed: Invalid or expired token",
                headers={"WWW-Authenticate": "Bearer"}
            )
        allowed, err_msg = verify_institution_boundary_access(user, node_name)
        if not allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=err_msg
            )
        return node_service.get_records(limit=limit, search=search)

    @app.get("/metadata")
    def get_metadata():
        return node_service.get_metadata()

    @app.get("/health")
    def health():
        from pathlib import Path
        db_exists = Path(node_service.db_path).exists()
        if not db_exists:
            return JSONResponse(
                status_code=503,
                content={
                    "status": "STORAGE_UNAVAILABLE",
                    "institution": node_name,
                    "error": f"Sovereign SQLite database not found at {node_service.db_path}"
                }
            )
        try:
            weights = node_service._get_weights()
            if weights is None or len(weights) == 0:
                return JSONResponse(
                    status_code=503,
                    content={
                        "status": "MODEL_UNAVAILABLE",
                        "institution": node_name,
                        "error": "Local feature weights uninitialized"
                    }
                )
        except Exception as e:
            return JSONResponse(
                status_code=503,
                content={
                    "status": "MODEL_UNAVAILABLE",
                    "institution": node_name,
                    "error": str(e)
                }
            )

        # Get actual records count from metadata
        record_count = 0
        try:
            meta = node_service.get_metadata()
            record_count = meta.get("syntheticRecords", 0)
        except Exception:
            pass

        return {
            "status": "REACHABLE",
            "institution": node_name,
            "isolation": "Sovereign local SQLite database mounted",
            "storage_status": "ONLINE",
            "model_status": "ONLINE",
            "record_count": record_count,
            "db_path": str(node_service.db_path)
        }

    @app.post("/compute-partial-logit")
    def compute_partial_logit_endpoint(
        req: ComputePartialLogitRequest,
        x_internal_key: Optional[str] = Header(None, alias="X-Internal-Service-Key")
    ):
        """
        Computes sovereign partial logit z_k = X_k * W_k for Split Learning.
        Private customer features NEVER leave this node.
        Reads exclusively from the local sovereign SQLite database.
        """
        if TRUSTMESH_ENV == "production" or (x_internal_key is not None):
            if x_internal_key != INTERNAL_SERVICE_KEY:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Unauthorized: Internal service key mismatch"
                )
        try:
            return node_service.compute_partial_logit(
                entity_ref=req.entity_ref,
                raw_features=None
            )
        except ValueError as e:
            raise HTTPException(status_code=404, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    @app.post("/demo/inject-anomaly")
    def inject_demo_anomaly(
        payload: Dict[str, Any],
        x_internal_key: Optional[str] = Header(None, alias="X-Internal-Service-Key")
    ):
        """Restricted demo mechanism owned by the sovereign node for test scenario injection."""
        if TRUSTMESH_ENV == "production" or (x_internal_key is not None):
            if x_internal_key != INTERNAL_SERVICE_KEY:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Unauthorized: Internal service key mismatch"
                )
        entity_ref = payload.get("entity_ref")
        updates = payload.get("updates", {})
        if not entity_ref or not updates:
            raise HTTPException(status_code=400, detail="Missing entity_ref or updates")
        node_service.update_record(entity_ref, updates)
        return {"success": True, "institution": node_name, "entity_ref": entity_ref}

    return app


bank_app = create_node_app("BANK_A", BankNodeService())
insurer_app = create_node_app("INSURER_B", InsurerNodeService())
lender_app = create_node_app("LENDER_C", LenderNodeService())


def run_bank():
    uvicorn.run(bank_app, host="127.0.0.1", port=BANK_A_PORT, log_level="warning")

def run_insurer():
    uvicorn.run(insurer_app, host="127.0.0.1", port=INSURER_B_PORT, log_level="warning")

def run_lender():
    uvicorn.run(lender_app, host="127.0.0.1", port=LENDER_C_PORT, log_level="warning")


if __name__ == "__main__":
    import multiprocessing
    
    node = sys.argv[1].upper() if len(sys.argv) > 1 else "ALL"
    if node == "BANK_A":
        run_bank()
    elif node == "INSURER_B":
        run_insurer()
    elif node == "LENDER_C":
        run_lender()
    elif node == "ALL":
        print("[TRUSTMESH] Launching all 3 sovereign participant nodes...")
        p1 = multiprocessing.Process(target=run_bank, name="BankA-Node-8001")
        p2 = multiprocessing.Process(target=run_insurer, name="InsurerB-Node-8002")
        p3 = multiprocessing.Process(target=run_lender, name="LenderC-Node-8003")
        
        for p in (p1, p2, p3):
            p.daemon = True
            p.start()
            
        print("  [OK] Bank A Node running on http://127.0.0.1:8001")
        print("  [OK] Insurer B Node running on http://127.0.0.1:8002")
        print("  [OK] Lender C Node running on http://127.0.0.1:8003")
        
        try:
            for p in (p1, p2, p3):
                p.join()
        except KeyboardInterrupt:
            print("\n[TRUSTMESH] Shutting down participant nodes...")
            for p in (p1, p2, p3):
                p.terminate()
    else:
        print(f"Unknown node {node}. Choose BANK_A, INSURER_B, LENDER_C, or ALL.")
