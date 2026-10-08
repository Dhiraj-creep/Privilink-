import React from 'react';
import { Info } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export default function ArchitectureScopeView() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Title */}
      <div className="tm-page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 className="tm-page-title">System Architecture, Threat Model & Scope</h1>
            <Badge variant="demo" size="sm">Technical Whitepaper</Badge>
          </div>
          <p className="tm-page-desc">
            Formal specifications of the vertical federated learning pipeline, sovereign physical storage boundaries, and compliance mapping.
          </p>
        </div>
      </div>

      {/* Scope Notice */}
      <div style={{
        padding: '16px 20px',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--primary-subtle)',
        border: '1px solid var(--primary-border)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px'
      }}>
        <Info size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong style={{ fontSize: '13px', color: 'var(--primary-text)' }}>
            Prototype Scope & Regulatory Governance Notice
          </strong>
          <p style={{ fontSize: '12px', color: 'var(--primary-text)', marginTop: '4px', lineHeight: 1.5 }}>
            This system is an academic research prototype evaluated on synthetic financial data and local sovereign SQLite databases. It is designed to demonstrate mathematical principles, cryptographic workflows, and institutional user journeys. Real deployment would require regulatory review, institutional agreements, security validation, and formal privacy impact assessments.
          </p>
        </div>
      </div>

      {/* Architecture Overview Diagram */}
      <Card
        title="Vertical Federated Learning (Split Learning) Data Flow"
        subtitle="Heterogeneous multi-party vertical federation without raw customer data egress."
      >
        <pre style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          backgroundColor: 'var(--bg-subtle)',
          color: 'var(--text-primary)',
          padding: '20px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-default)',
          lineHeight: 1.6,
          overflowX: 'auto'
        }}>
{`+---------------------------------------------------------------------------------------------------+
|                                 PRIVILINK FEDERATION ARCHITECTURE                                 |
+---------------------------------------------------------------------------------------------------+

   +--------------------------+    +--------------------------+    +--------------------------+
   |       BANK A NODE        |    |      INSURER B NODE      |    |      LENDER C NODE       |
   |   Port 8001 / SQLite     |    |    Port 8002 / SQLite    |    |    Port 8003 / SQLite    |
   |  (Local Repayment Ledger)|    |  (Local Claims Ledger)   |    |  (Local Inquiries Ledger)|
   +--------------------------+    +--------------------------+    +--------------------------+
                │                               │                               │
                │ Local Features                │ Local Features                │ Local Features
                ▼                               ▼                               ▼
   +──────────────────────────+    +──────────────────────────+    +──────────────────────────+
   |   Local Private Encoder  |    |   Local Private Encoder  |    |   Local Private Encoder  |
   |   (StandardScaler + L2)  |    |   (StandardScaler + L2)  |    |   (StandardScaler + L2)  |
   +──────────────────────────+    +──────────────────────────+    +──────────────────────────+
                │                               │                               │
                │ Partial Logit (z_A)           │ Partial Logit (z_B)           │ Partial Logit (z_C)
                ▼                               ▼                               ▼
   +──────────────────────────+    +──────────────────────────+    +──────────────────────────+
   |  Blinded Pairwise Mask   |    |  Blinded Pairwise Mask   |    |  Blinded Pairwise Mask   |
   |       v_A + M_A          |    |       v_B + M_B          |    |       v_C + M_C          |
   |    (M_A = S_AB + S_AC)   |    |    (M_B = -S_AB + S_BC)  |    |    (M_C = -S_AC - S_BC)  |
   +──────────────────────────+    +──────────────────────────+    +──────────────────────────+
                └───────────────────────────────┼───────────────────────────────┘
                                                ▼ Blinded Vectors Only (Σ M_i = 0)
                            +───────────────────────────────────────+
                            |     CENTRAL COORDINATOR (Port 8000)   |
                            |   • SecAgg Protocol: Σ M_i = 0        |
                            |   • Coordinate-wise Median Filtering  |
                            |   • Vertical Fed Collaborative Model  |
                            |   • Tamper-Evident SHA-256 Hash Chain |
                            +───────────────────────────────────────+
                                                │
                                                ▼
                            +───────────────────────────────────────+
                            |         ENTERPRISE UI (Port 5173)     |
                            |   • Role-Based Access Control (RBAC)  |
                            |   • Customer Investigation & SHAP     |
                            |   • Cryptographic Audit Inspector     |
                            +───────────────────────────────────────+`}
        </pre>
      </Card>

      {/* 3 Core Trust Assumptions & Defense Mechanisms */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px' }}>
        <Card title="Zero-Sum Masking (SecAgg)">
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
            Each pair of nodes agrees on a shared blinding seed. Because every mask added by one node is subtracted by another, their sum equals zero when combined at the coordinator: Σ M_i = 0. The coordinator learns the aggregate without ever observing individual inputs.
          </p>
        </Card>

        <Card title="Differential Privacy (DP-SGD)">
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
            Individual customer records are protected via L2 gradient norm clipping (C=1.0) and calibrated Gaussian noise injection: σ = C · √(2 ln(1.25/δ)) / ε. An adversary cannot determine whether an individual record was present in the training set.
          </p>
        </Card>

        <Card title="Commutative DH-PSI">
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
            Parties compute double exponentiation over a 256-bit safe prime: (H(ID)^a)^b = (H(ID)^b)^a mod p. Elements in the intersection produce identical doubly-blinded values, allowing entity alignment with zero plaintext PII disclosure.
          </p>
        </Card>
      </div>
    </div>
  );
}
