# PriviLink — Requirements & Capabilities Matrix

This document provides a rigorous, verifiable accounting of the requirements, technical implementations, resolved defects, and classification of capabilities for the **PriviLink** privacy-preserving cross-institution risk intelligence platform.

---

## 1. Capability Classification Framework

To maintain academic and scientific integrity, capabilities within PriviLink are partitioned into three explicit tiers:

1. **Implemented Capabilities (Verified):** Functional, mathematically verified, fully integrated end-to-end through API contracts, database persistence, and automated test coverage.
2. **Educational Simulations (Interactive Lab):** Interactive pedagogical sandboxes that demonstrate mathematical and cryptographic protocols (e.g. Diffie-Hellman PSI, Byzantine median filtering, SecAgg dropout abort, DP epsilon tradeoffs) without claiming multi-tenant hardware enclave guarantees.
3. **Future Work (Production Roadmap):** Architectural components required for enterprise multi-cloud deployment (e.g., Hardware Enclaves / SGX, Threshold Shamir Secret Sharing, Homomorphic Encryption, Cross-VPC transport).

---

## 2. Requirements & Verification Matrix

| # | Requirement | Existing Implementation | Missing or Incorrect Behavior Identified | Planned & Executed Correction | Evidence & Verification Status | Capability Tier |
|---|---|---|---|---|---|---|
| **REQ-01** | **Sovereign Data Isolation** | 3 independent SQLite databases for Bank A, Insurer B, Lender C on separate ports (8001, 8002, 8003). | Institution Admin role could potentially request cross-institution raw records if endpoints were not strictly gated. | Enforced `verify_institution_boundary_access` in `backend/main.py` returning immediate `HTTP 403 Forbidden` on unauthorized access. | `test_auth_rbac.py` and `test_regression_boundaries.py` passing (200 for Bank A, 403 for Insurer B / Lender C / Analysts). | Implemented Capability |
| **REQ-02** | **Central User Journey & Case Workflow** | Cases stored in SQLite coordinator DB with risk scores, attributes, and step-up verification. | Case resolution did not update status consistently (`status` vs `new_status`); step-up tasks were lost upon page reload or role switch. | Added `activeTaskId` to `get_cases()` and `get_case_by_id()`. Standardized `resolve_case` and `submit_step_up_task` in `case_service.py` with persistent DB updates, status standardization, unique task IDs, and SHA-256 audit chaining. | `test_cases_workflow.py`, `test_e2e_workflow.py`, and `test_browser_workflow.mjs` passing; verified state change to `RESOLVED` in `coordinator.db`. | Implemented Capability |
| **REQ-03** | **Cryptographic Audit Trail Integrity** | SHA-256 chained blocks linked from deterministic genesis hash `000000000000...`. | Simulating tamper attacks in the UI directly corrupted the live production SQLite audit ledger, breaking all subsequent verification. | Introduced isolated Sandbox ledger (`use_sandbox=True`) in `backend/crypto/audit_chain.py` allowing demonstration of tamper detection without corrupting operational ledger. | `test_audit_chain.py` (4 tests) passing; `verify_integrity()` validates blocks from genesis; tamper attack breaks hash verification as expected. | Implemented Capability |
| **REQ-04** | **Audit State Honesty** | UI showed green "Verified" badge unconditionally even when API call failed or chain was unverified. | False audit verification badge led to unwarranted trust. | Implemented explicit 4-state audit machine: `CHECKING`, `VERIFIED`, `TAMPER_DETECTED`, `UNAVAILABLE`. Never claims verified on network error. | Verified in `OverviewView.jsx` and `AuditTrailView.jsx`; network errors render amber `UNAVAILABLE` state with clear retry controls. | Implemented Capability |
| **REQ-05** | **Dynamic Anomaly Scoring** | Cross-institution anomaly scenario claimed dynamic risk synthesis. | Hardcoded `98.4%` fallback score was used in UI regardless of backend calculation. | Removed hardcoded fallback in `App.jsx` and `AdvancedDemoView.jsx`; require genuine coordinator `/api/simulation/run` response with fallback to empty state. | Real synthesis executed against `CASE-10482` escalates score dynamically to calculated float value; tested in `test_e2e_workflow.py` and `test_browser_workflow.mjs`. | Implemented Capability |
| **REQ-06** | **Empty State Fidelity & No Silent Fallbacks** | UI tables and network views loaded fallback fixtures on network disconnects or empty results. | Silent fixture substitution masked real system disconnections or zero-result search queries. | Added explicit empty states (`<EmptyState />`) and distinct watermarks ("Live Sovereign SQLite" vs "Demonstration Fixture (Offline)"). Preserved `[]` responses without synthetic fallback. | Verified in `InstitutionNetworkView.jsx`, `CollaborativeRiskView.jsx`, and `OverviewView.jsx`; zero-match queries display dedicated empty state. | Implemented Capability |
| **REQ-07** | **Standardized Model Metrics Contract** | `metrics.json` stored nested schema (`globalMetrics`, `localMetricsComparison`) while UI expected `collaborative.pr_auc`. | UI fell back to default static metrics numbers because field names diverged. | Standardized `/api/model/metrics` in `backend/main.py` to return normalized top-level `collaborative` and `baselines` objects alongside raw structure. | `test_dataset_and_ml.py` passing; UI displays real PR-AUC (0.71), F1 (0.56), ROC-AUC (0.97) directly from disk. | Implemented Capability |
| **REQ-08** | **Risk Score vs Confidence Decoupling** | Synthetic cases showed high confidence (96%) and labeled as high risk. | Conflation of model prediction confidence ($P(Y=y)$ certainty) with risk probability ($P(Y=1)$). | Decoupled `score` (0–100 risk probability) from `confidence` (0–100% classification certainty). For `CASE-10491`: score = 12, confidence = 96. | Verified in `syntheticData.js` and `test_frontend_utils.mjs`; all cards and tables render distinct risk probability vs model confidence. | Implemented Capability |
| **REQ-09** | **Real Node Health Probes vs DB Existence** | Node health check previously checked whether `bank_a.db` file existed on host disk. | Stopped or crashed microservice nodes still showed as "Online" if the SQLite database file remained on disk. | Replaced file path checks with bounded HTTP GET requests (`/health`) with 0.6s timeouts to ports 8001, 8002, 8003. Returns `REACHABLE`, `UNREACHABLE`, or `QUARANTINED`. | Tested in `test_regression_boundaries.py`; unstarted nodes report `UNREACHABLE` even when database files exist on disk. | Implemented Capability |
| **REQ-10** | **Diffie-Hellman Private Set Intersection** | Mathematical 256-bit safe prime commutative exponentiation $E_A(E_B(H(x))) = E_B(E_A(H(x)))$. | Demonstration required pedagogical step-by-step visualization without leaking raw identifiers. | Built interactive PSI protocol simulator displaying blinded hashes, intermediate exponentiations, and exact matched intersection. | `test_crypto_psi.py` (2 tests) passing; mathematical commutativity proven over synthetic identifier sets. | Educational Simulation |
| **REQ-11** | **Numerical Secure Aggregation (SecAgg)** | Zero-sum pairwise blinding masks $\sum M_i = 0$ over participant vectors. | Dropout behavior needed verifiable abort logic rather than partial decryption. | Implemented `SecAggProtocol` in `secagg.py` with zero-sum reconstruction and strict `SecAggDropoutError` abort on missing participant. | `test_crypto_secagg.py` (2 tests) passing; dropout aborts execution with zero secrets leaked. | Educational Simulation |
| **REQ-12** | **Differential Privacy (DP-SGD)** | Calibrated Gaussian mechanism $\sigma = \sqrt{2\ln(1.25/\delta)} \cdot (C/\varepsilon)$ with $L_2$ clipping $C=1.0$. | Static slider previously had no mathematical relationship to noise distribution. | Added mathematical Gaussian noise generator and empirical accuracy curve reflecting $\varepsilon \in [0.1, 5.0]$. | `test_crypto_dp.py` (3 tests) passing; noise standard deviation strictly satisfies differential privacy bounds. | Educational Simulation |
| **REQ-13** | **Byzantine Outlier Quarantine** | Coordinate-wise median filtering detects poisoned model updates ($> 3\sigma$). | Malicious participant updates could silently poison federated inference. | Added Byzantine filter in coordinator inference; quarantined nodes have weights zeroed and status flagged in UI. | `test_crypto_secagg.py::test_byzantine_median_defense` passing; trust score updates persistently. | Implemented Capability |
| **REQ-14** | **Google Stitch Visual Language** | Prior UI had dark obsidian or generic consumer blue backgrounds with high glare. | Aesthetic did not match refined financial enterprise workspace standards. | Migrated to Google Stitch aesthetic: Warm off-white `#F5F7FB`, crisp white `#FFFFFF` cards, deep navy `#14213D` text, indigo `#4F46E5` primary, Manrope headings, Inter UI, tabular figures. | Full token system in `tokens.css`; 0 errors in Vite build (`npm run build`); clean WCAG AA contrast ratios across all states. | Implemented Capability |
| **REQ-15** | **Strict Zero-Raw-Data Transmission Boundary** | Coordinator coordinates Split Learning over HTTP RPC. | In distributed mode, code could silently query peer SQLite files if node endpoints failed. | In distributed mode, `predict_distributed` communicates strictly via `{"entity_ref": entity_ref}` and raises `DistributedInferenceUnavailableError` on node reachability failure; in-process fallback is forbidden. | `test_regression_boundaries.py::test_unreachable_node_honest_503_in_distributed_mode` passing; zero raw feature transfer. | Implemented Capability |
| **REQ-16** | **Modal Accessibility & Focus Trapping** | Custom dialogs and modals rendered without standard accessibility attributes. | Screen readers and keyboard navigation could lose focus or get trapped. | Added `role="dialog"`, `aria-modal="true"`, focus trapping (Tab/Shift+Tab cycle), and Escape key dismiss across `Modal.jsx`, `GlobalSearch.jsx`, and `HackathonTourModal.jsx`. | Tested across components; verified keyboard dismiss and focus retention. | Implemented Capability |
| **REQ-17** | **Mobile Responsiveness Polish (360px - 768px)** | Elements on mobile viewports had cramped buttons or chart title overflow. | UI broke or caused horizontal scroll on narrow mobile screens (360px - 480px). | Added responsive classes `.tm-role-selector-btn`, `.tm-card-header`, `.tm-kpi-badge-full`, and `.tm-kpi-badge-short` in `App.css`. | Verified clean rendering from 360px to 1440px without horizontal scroll. | Implemented Capability |
| **REQ-18** | **Docker Compose Multi-Service Deployment** | Deployment required manual multi-terminal launch. | Risk of inconsistent evaluation by technical reviewers. | Created `Dockerfile.backend`, `Dockerfile.frontend`, and `docker-compose.yml` with 5 isolated services and physical sovereign volume isolation. | Verified configuration: coordinator volume mounts strictly exclude node databases. | Implemented Capability |

---

## 3. Discrepancy & Problem Statement Verification

### Central User Journey
The implemented system strictly follows the verified cross-institution user journey:
$$\text{Institution Collaboration} \longrightarrow \text{Permitted Entity Matching (PSI)} \longrightarrow \text{Collaborative Risk Inference (VFL + SecAgg)} \longrightarrow \text{Case Investigation (Feature Attribution)} \longrightarrow \text{Accountable Action (Step-Up KYC)} \longrightarrow \text{Audit Verification (SHA-256 Ledger)}$$

### Scientific & Regulatory Claim Boundaries
1. **Regulatory Compliance:** PriviLink demonstrates technical alignment with privacy-by-design principles (GDPR Art. 25, DPDP Act 2023, Banking Secrecy) through zero raw PII exchange and local feature encoding. It does **not** claim formal certified compliance with specific legal regimes without external legal audit.
2. **Cryptographic Guarantees:** Pairwise zero-sum masking and 256-bit Diffie-Hellman exponentiation are implemented mathematically. They do **not** claim side-channel resistance or post-quantum security.
3. **Audit Ledger:** The audit ledger is **tamper-evident** via SHA-256 hash chaining, not immutable. A root administrator with direct write access to the host SQLite file could rewrite history forward; true immutability requires decentralized consensus or external write-once media (WORM).
4. **Model Performance:** Real measured metrics on the test partition are **PR-AUC = 0.71, F1 = 0.56, ROC-AUC = 0.97** for the collaborative model vs **PR-AUC = 0.45** for Bank A alone. These figures reflect synthetic data generation parameters and are never falsified in the UI.

---

## 4. Verification Evidence Summary

- **Backend Pytest Suite:** 35 passed in 7.18s (`tests/test_*.py`)
  - `test_audit_chain.py` (4 tests)
  - `test_auth_rbac.py` (6 tests)
  - `test_cases_workflow.py` (4 tests)
  - `test_crypto_dp.py` (3 tests)
  - `test_crypto_psi.py` (2 tests)
  - `test_crypto_secagg.py` (2 tests)
  - `test_dataset_and_ml.py` (4 tests)
  - `test_distributed_vfl.py` (3 tests)
  - `test_e2e_workflow.py` (1 comprehensive integration test)
  - `test_regression_boundaries.py` (6 boundary & regression tests)
- **Frontend Utility Suite:** 4 passed in 22.2ms (`tests/test_frontend_utils.mjs`)
- **Browser E2E User Journey Suite:** 12 passed in 298.5ms (`tests/test_browser_workflow.mjs`)
- **Frontend Linter:** 0 errors, 0 warnings across 39 files (`oxlint`)
- **Production Bundle:** Vite build compiles in 522ms with zero bundling errors.
