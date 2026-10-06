import React from 'react';
import { 
  Building2, 
  ShieldCheck, 
  TrendingUp,
  Layers,
  Lock, 
  ArrowRight
} from 'lucide-react';

export default function OverviewView({ onNavigate, onSelectInstitution, quarantinedLender }) {

  const metrics = [
    { label: 'CONNECTED INSTITUTIONS', value: '3', sub: 'Active participants', status: 'normal' },
    { label: 'ACTIVE COLLABORATIONS', value: '18', sub: 'Risk clusters', status: 'normal' },
    { label: 'RISK CASES ANALYZED', value: '1,284', sub: 'Cross-institution checks', status: 'normal' },
    { 
      label: 'RAW RECORDS SHARED', 
      value: '0', 
      sub: '100% on-premise privacy', 
      status: 'highlight',
      badge: 'Zero Raw PII'
    },
    { label: 'PRIVACY STATUS', value: 'Protected', sub: 'Differential Privacy active', status: 'success' },
    { 
      label: 'MODEL HEALTH', 
      value: quarantinedLender ? 'Quarantine Active' : 'Healthy', 
      sub: quarantinedLender ? 'Lender C isolated' : 'Round 27 converged', 
      status: quarantinedLender ? 'warning' : 'success' 
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Header Banner */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        padding: '22px 26px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--primary-dark)', letterSpacing: '-0.02em' }}>
              Collaborative Risk Intelligence
            </h1>
            <span className="badge badge-primary">VFL Architecture</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Cross-institution risk signals without cross-institution raw data.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => onNavigate('simulation_lab')}
            className="btn btn-primary btn-sm"
          >
            <span>Launch Simulation Lab</span>
            <ArrowRight size={14} />
          </button>
          <button 
            onClick={() => onNavigate('collaborative_risk')}
            className="btn btn-secondary btn-sm"
          >
            <span>View Risk Cases (1,284)</span>
          </button>
        </div>
      </div>

      {/* Top 6 KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '14px'
      }}>
        {metrics.map((m, idx) => (
          <div key={idx} className="card" style={{ 
            padding: '18px',
            borderTop: m.status === 'highlight' 
              ? '3px solid var(--success)' 
              : m.status === 'warning' 
                ? '3px solid var(--danger)' 
                : '3px solid var(--primary-dark)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.675rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                {m.label}
              </span>
              {m.badge && (
                <span className="badge badge-success" style={{ fontSize: '0.6rem' }}>
                  {m.badge}
                </span>
              )}
            </div>
            <div style={{
              fontSize: '1.8rem',
              fontWeight: 700,
              marginTop: '6px',
              color: m.status === 'highlight' 
                ? 'var(--success-text)' 
                : m.status === 'warning' 
                  ? 'var(--danger-text)' 
                  : 'var(--primary-dark)',
              letterSpacing: '-0.02em'
            }}>
              {m.value}
            </div>
            <div style={{ fontSize: '0.735rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {m.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Central Visual: Cross-Institution Intelligence Network */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
              Cross-Institution Intelligence Network
            </h3>
            <p style={{ fontSize: '0.765rem', color: 'var(--text-secondary)' }}>
              Interactive topology showing privacy-preserving signal exchange with zero raw data flow.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.735rem', color: 'var(--text-muted)' }}>Click any node for private schema:</span>
          </div>
        </div>

        <div className="card-body" style={{ padding: '24px 18px' }}>
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '840px',
            margin: '0 auto',
            minHeight: '350px',
            backgroundColor: 'var(--nav-bg)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--nav-border)',
            padding: '24px',
            overflow: 'hidden'
          }}>
            {/* SVG Connecting Flow Lines */}
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
              {/* Bank A to Center */}
              <line x1="20%" y1="35%" x2="50%" y2="52%" stroke="var(--muted-sage)" strokeWidth="2" strokeDasharray="5,5" className="animate-flow" />
              {/* Insurer B to Center */}
              <line x1="80%" y1="35%" x2="50%" y2="52%" stroke="var(--muted-sage)" strokeWidth="2" strokeDasharray="5,5" className="animate-flow" />
              {/* Lender C to Center */}
              <line x1="50%" y1="88%" x2="50%" y2="55%" stroke={quarantinedLender ? 'var(--danger)' : 'var(--warning)'} strokeWidth="2" strokeDasharray="5,5" className="animate-flow" />
            </svg>

            {/* Label overlays on transmission paths */}
            <div style={{ position: 'absolute', top: '38%', left: '26%', transform: 'translate(-50%, -50%)', backgroundColor: 'var(--nav-surface)', padding: '3px 9px', borderRadius: '4px', border: '1px solid var(--nav-border)', fontSize: '0.65rem', color: '#E8EBE9', fontFamily: 'var(--font-mono)' }}>
              🔒 Encrypted Gradient
            </div>
            <div style={{ position: 'absolute', top: '38%', right: '14%', transform: 'translate(-50%, -50%)', backgroundColor: 'var(--nav-surface)', padding: '3px 9px', borderRadius: '4px', border: '1px solid var(--nav-border)', fontSize: '0.65rem', color: '#E8EBE9', fontFamily: 'var(--font-mono)' }}>
              🔒 Privacy Signal
            </div>
            <div style={{ position: 'absolute', bottom: '26%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'var(--nav-surface)', padding: '3px 9px', borderRadius: '4px', border: quarantinedLender ? '1px solid var(--danger)' : '1px solid var(--warning)', fontSize: '0.65rem', color: quarantinedLender ? '#F9EBEA' : '#FBF4E8', fontFamily: 'var(--font-mono)' }}>
              {quarantinedLender ? '⚠️ Quarantined Update' : '🔒 Risk Representation'}
            </div>

            {/* Top Row Nodes: BANK A & INSURER B */}
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 10 }}>
              {/* Bank A Node */}
              <div 
                onClick={() => onSelectInstitution('BANK_A')}
                style={{
                  width: '185px',
                  backgroundColor: 'var(--nav-surface)',
                  border: '1px solid var(--muted-sage)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  transition: 'transform 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Building2 size={16} color="var(--muted-sage)" />
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#F8FAFC' }}>BANK A</span>
                </div>
                <div style={{ fontSize: '0.715rem', color: 'var(--nav-text)' }}>
                  Records: <span style={{ color: '#F8FAFC', fontWeight: 600 }}>250,000 synthetic</span>
                </div>
                <div style={{ fontSize: '0.715rem', color: 'var(--nav-text)' }}>
                  Trust: <span style={{ color: 'var(--muted-sage)', fontWeight: 600 }}>96%</span> | Model: Healthy
                </div>
                <div style={{ 
                  marginTop: '8px', 
                  fontSize: '0.625rem', 
                  padding: '3px 6px', 
                  backgroundColor: 'rgba(143, 175, 157, 0.15)', 
                  color: '#F8FAFC', 
                  borderRadius: '3px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Lock size={10} />
                  <span>Private Repayment Data</span>
                </div>
              </div>

              {/* Insurer B Node */}
              <div 
                onClick={() => onSelectInstitution('INSURER_B')}
                style={{
                  width: '185px',
                  backgroundColor: 'var(--nav-surface)',
                  border: '1px solid var(--muted-sage)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  transition: 'transform 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <ShieldCheck size={16} color="var(--muted-sage)" />
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#F8FAFC' }}>INSURER B</span>
                </div>
                <div style={{ fontSize: '0.715rem', color: 'var(--nav-text)' }}>
                  Records: <span style={{ color: '#F8FAFC', fontWeight: 600 }}>118,000 synthetic</span>
                </div>
                <div style={{ fontSize: '0.715rem', color: 'var(--nav-text)' }}>
                  Trust: <span style={{ color: 'var(--muted-sage)', fontWeight: 600 }}>92%</span> | Model: Healthy
                </div>
                <div style={{ 
                  marginTop: '8px', 
                  fontSize: '0.625rem', 
                  padding: '3px 6px', 
                  backgroundColor: 'rgba(143, 175, 157, 0.15)', 
                  color: '#F8FAFC', 
                  borderRadius: '3px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Lock size={10} />
                  <span>Private Claims Data</span>
                </div>
              </div>
            </div>

            {/* Center Node: TRUSTMESH Aggregation Engine */}
            <div style={{
              position: 'absolute',
              top: '52%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '240px',
              backgroundColor: 'var(--primary-dark)',
              border: '2px solid var(--muted-sage)',
              borderRadius: 'var(--radius-lg)',
              padding: '14px',
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(11, 42, 32, 0.5)',
              zIndex: 15
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(143, 175, 157, 0.2)',
                color: 'var(--muted-sage)',
                marginBottom: '6px'
              }}>
                <Layers size={18} />
              </div>
              <h4 style={{ color: '#F8FAFC', fontSize: '0.925rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
                TRUSTMESH
              </h4>
              <p style={{ color: 'var(--muted-sage)', fontSize: '0.715rem', fontWeight: 500 }}>
                Secure Aggregation Layer
              </p>
              <div style={{
                margin: '8px 0',
                padding: '5px',
                backgroundColor: 'var(--nav-surface)',
                borderRadius: '4px',
                fontSize: '0.65rem',
                color: 'var(--nav-text)'
              }}>
                <span style={{ color: 'var(--muted-sage)' }}>✓ Zero Raw Customer Data</span><br/>
                <span>Consolidated Round 27</span>
              </div>
              <button 
                onClick={() => onNavigate('secure_aggregation')}
                className="btn btn-sm"
                style={{ 
                  backgroundColor: 'var(--secondary-green)', 
                  color: '#F8FAFC', 
                  fontSize: '0.675rem',
                  padding: '4px 8px',
                  width: '100%',
                  marginTop: '4px',
                  border: '1px solid var(--muted-sage)'
                }}
              >
                Inspect Aggregation Flow
              </button>
            </div>

            {/* Bottom Row Node: LENDER C */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              marginTop: '135px', 
              position: 'relative', 
              zIndex: 10 
            }}>
              <div 
                onClick={() => onSelectInstitution('LENDER_C')}
                style={{
                  width: '185px',
                  backgroundColor: 'var(--nav-surface)',
                  border: quarantinedLender ? '1px solid var(--danger)' : '1px solid var(--warning)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  transition: 'transform 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <TrendingUp size={16} color={quarantinedLender ? 'var(--danger)' : 'var(--warning)'} />
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#F8FAFC' }}>LENDER C</span>
                </div>
                <div style={{ fontSize: '0.715rem', color: 'var(--nav-text)' }}>
                  Records: <span style={{ color: '#F8FAFC', fontWeight: 600 }}>184,000 synthetic</span>
                </div>
                <div style={{ fontSize: '0.715rem', color: 'var(--nav-text)' }}>
                  Trust: <span style={{ color: quarantinedLender ? 'var(--danger)' : 'var(--warning)', fontWeight: 600 }}>
                    {quarantinedLender ? '63% (Quarantined)' : '89%'}
                  </span>
                </div>
                <div style={{ 
                  marginTop: '8px', 
                  fontSize: '0.625rem', 
                  padding: '3px 6px', 
                  backgroundColor: quarantinedLender ? 'rgba(182, 74, 69, 0.2)' : 'rgba(197, 138, 50, 0.2)', 
                  color: '#F8FAFC', 
                  borderRadius: '3px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Lock size={10} />
                  <span>Private Borrowing Data</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 30-Second Institutional Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '18px'
      }}>
        {/* Core Differentiator Box */}
        <div className="card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ 
              width: '34px', 
              height: '34px', 
              borderRadius: 'var(--radius-sm)', 
              backgroundColor: 'var(--sage-light)', 
              color: 'var(--primary-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldCheck size={18} />
            </div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
              The Product Differentiator
            </h3>
          </div>
          <p style={{ fontSize: '0.815rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
            TrustMesh is <strong>not</strong> another generic fraud dashboard. It solves the blind-spot problem:
          </p>
          <div style={{
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '14px',
            fontSize: '0.785rem',
            lineHeight: 1.55,
            border: '1px solid var(--border-light)'
          }}>
            <p>• <strong>Bank A:</strong> Repayment delay is minor (Low/Normal risk in isolation).</p>
            <p>• <strong>Insurer B:</strong> Claim deviation is inconclusive (Borderline risk in isolation).</p>
            <p>• <strong>Lender C:</strong> Inquiry is below risk threshold (Low risk in isolation).</p>
            <div style={{ 
              marginTop: '10px', 
              paddingTop: '10px', 
              borderTop: '1px dashed var(--border-medium)',
              color: 'var(--primary-dark)',
              fontWeight: 600
            }}>
              Collaboratively: When privacy-preserving representations align, TRUSTMESH flags an elevated cross-institution stress cluster without exposing raw customer records!
            </div>
          </div>
        </div>

        {/* Minimum Disclosure & Privacy Guarantees */}
        <div className="card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ 
              width: '34px', 
              height: '34px', 
              borderRadius: 'var(--radius-sm)', 
              backgroundColor: 'var(--success-light)', 
              color: 'var(--success-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Lock size={18} />
            </div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
              Minimum-Necessary Disclosure Principle
            </h3>
          </div>
          <p style={{ fontSize: '0.815rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
            Participating institutions never reveal their underlying customer databases:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', fontSize: '0.785rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--danger)', fontWeight: 700 }}>✕</span>
              <span>No Aadhaar, PAN, SSN, Legal Names, or Account Numbers exchanged</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--danger)', fontWeight: 700 }}>✕</span>
              <span>No granular transaction history or claim documents released</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--success)', fontWeight: 700 }}>✓</span>
              <span>Only aggregated gradients, differentially private vectors & decision support signals</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--success)', fontWeight: 700 }}>✓</span>
              <span>Full compliance with banking privacy regulations & cross-border governance</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
