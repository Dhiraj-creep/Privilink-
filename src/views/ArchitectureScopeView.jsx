import React from 'react';
import { 
  Info,
  Lock, 
  AlertTriangle, 
  ShieldCheck
} from 'lucide-react';

export default function ArchitectureScopeView() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
              System Architecture, Threat Model & Scope
            </h1>
            <span className="badge badge-demo">Engineering Whitepaper</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Formal specifications of the vertical federated learning pipeline and prototype operational boundaries.
          </p>
        </div>
      </div>

      {/* Section 32: Realistic Scope & Prototype Disclaimers */}
      <div className="card" style={{ borderLeft: '4px solid var(--primary-dark)', padding: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <Info size={18} color="var(--primary-dark)" />
          <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
            Prototype Scope & Regulatory Governance Notice
          </h3>
        </div>
        
        <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '10px' }}>
          <em>"This prototype uses synthetic financial data and simulated institutional environments. It demonstrates the architecture, workflow and privacy principles; it is not a production banking system."</em>
        </p>

        <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
          <em>"Real deployment would require regulatory review, institutional agreements, security validation, privacy impact assessment and independent model validation."</em>
        </p>
      </div>

      {/* Architecture Overview Diagram & Modules */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
              End-to-End Technical Architecture
            </h3>
            <p style={{ fontSize: '0.765rem', color: 'var(--text-secondary)' }}>
              Heterogeneous multi-party vertical federation without raw data egress
            </p>
          </div>
          <span className="badge badge-primary">VFL Topology</span>
        </div>

        <div className="card-body">
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.765rem',
            backgroundColor: 'var(--nav-bg)',
            color: '#FCFBF7',
            padding: '24px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--nav-border)',
            lineHeight: 1.65,
            overflowX: 'auto'
          }}>
            <div style={{ color: 'var(--muted-sage)' }}>+-----------------------------------------------------------------------------------+</div>
            <div style={{ color: 'var(--muted-sage)' }}>|                               TRUSTMESH ARCHITECTURE                              |</div>
            <div style={{ color: 'var(--muted-sage)' }}>+-----------------------------------------------------------------------------------+</div>
            <div>[ BANK A ]               [ INSURER B ]              [ LENDER C ]</div>
            <div>   │ Local Schema:             │ Local Schema:            │ Local Schema:</div>
            <div>   │ Txns, Repayment           │ Claims, Loss Ratios      │ Credit, Inquiries</div>
            <div>   ▼                           ▼                          ▼</div>
            <div>[ Private Encoder Head ]   [ Private Encoder Head ]   [ Private Encoder Head ]</div>
            <div>   │ 64-dim Latent Vector      │ 64-dim Latent Vector     │ 64-dim Latent Vector</div>
            <div>   ▼                           ▼                          ▼</div>
            <div>[ DP-SGD Noise (ε=1.5) ]   [ DP-SGD Noise (ε=1.5) ]   [ DP-SGD Noise (ε=1.5) ]</div>
            <div>   │ Pairwise Ciphertext Mask  │ Pairwise Ciphertext Mask │ Pairwise Ciphertext Mask</div>
            <div>   └───────────────┬───────────┴───────────┬──────────────┘</div>
            <div>                   ▼                       ▼</div>
            <div>         [ SECURE AGGREGATION COORDINATOR (Zero-Knowledge) ]</div>
            <div>                   │ Pairwise Masks Cancel Out: Σ(M_i,j) = 0</div>
            <div>                   │ Aggregator CANNOT inspect individual updates</div>
            <div>                   ▼</div>
            <div>         [ ROBUST BYZANTINE FILTER (Norm Clamping + Median) ]</div>
            <div>                   │ Flags & isolates anomalous participant updates</div>
            <div>                   ▼</div>
            <div>         [ GLOBAL COLLABORATIVE INFERENCE HEAD ]</div>
            <div>                   │ Synthesizes cross-institution weak signals</div>
            <div>                   ▼</div>
            <div>         [ MINIMUM NECESSARY DISCLOSURE (Decision Support) ]</div>
            <div>                   │ Discloses Risk Score & Archetype ONLY</div>
            <div>                   │ 0 Raw Customer Records, Identifiers, or PII</div>
          </div>
        </div>
      </div>

      {/* Threat Model & Mitigations Matrix */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
              Threat Model & Cryptographic Countermeasures
            </h3>
            <p style={{ fontSize: '0.765rem', color: 'var(--text-secondary)' }}>
              Defensive posturing against standard multi-party computation attack surfaces
            </p>
          </div>
        </div>

        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Lock size={16} color="var(--primary-dark)" />
                <span style={{ fontWeight: 700, fontSize: '0.825rem', color: 'var(--primary-dark)' }}>
                  Honest-but-Curious Central Node
                </span>
              </div>
              <p style={{ fontSize: '0.765rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <strong>Threat:</strong> Aggregator attempts to inspect individual institution records.<br/>
                <strong>Countermeasure:</strong> SecAgg protocol ensures only the sum is decryptable. Pairwise Diffie-Hellman masks blind individual contributions.
              </p>
            </div>

            <div style={{ padding: '16px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <AlertTriangle size={16} color="var(--warning-text)" />
                <span style={{ fontWeight: 700, fontSize: '0.825rem', color: 'var(--warning-text)' }}>
                  Byzantine / Poisoning Nodes
                </span>
              </div>
              <p style={{ fontSize: '0.765rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <strong>Threat:</strong> Compromised participant submits malicious gradients.<br/>
                <strong>Countermeasure:</strong> Trust-aware participant scoring, gradient L2-norm clipping (C=1.0), and Coordinate-Wise Median aggregation quarantine outliers.
              </p>
            </div>

            <div style={{ padding: '16px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <ShieldCheck size={16} color="var(--success-text)" />
                <span style={{ fontWeight: 700, fontSize: '0.825rem', color: 'var(--success-text)' }}>
                  Gradient Inversion Attacks
                </span>
              </div>
              <p style={{ fontSize: '0.765rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <strong>Threat:</strong> Adversary uses model differences to reconstruct training inputs.<br/>
                <strong>Countermeasure:</strong> Formal (ε, δ)-Differential Privacy (DP-SGD) with calibrated Gaussian noise bounds information leakage.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
