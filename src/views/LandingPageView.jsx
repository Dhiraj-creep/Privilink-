import React from 'react';
import { 
  Shield, 
  ArrowRight, 
  Play, 
  Layers, 
  FileCheck2, 
  Building2, 
  Network,
  CheckCircle2
} from 'lucide-react';

export default function LandingPageView({ onEnterApp, onStartTour }) {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#FFFFFF',
      color: 'var(--text-primary)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'var(--font-sans)',
      overflowX: 'hidden'
    }}>
      {/* Top Header */}
      <header style={{
        height: '64px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid var(--border-default)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 clamp(16px, 4vw, 32px)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--primary-subtle)',
            border: '1px solid var(--primary-border)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Shield size={20} strokeWidth={2.4} />
          </div>
          <div>
            <span style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-primary)', letterSpacing: '-0.02em', display: 'block', lineHeight: 1.1 }}>
              PriviLink
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
              Cross-Institution Risk Intelligence
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            onClick={onStartTour}
            className="btn btn-secondary btn-sm"
            aria-label="Start 3-minute interactive product tour"
          >
            <Play size={12} fill="var(--primary)" stroke="var(--primary)" />
            <span>Product Tour</span>
          </button>
          <button 
            onClick={onEnterApp}
            className="btn btn-primary btn-sm"
            aria-label="Launch enterprise risk workspace"
          >
            <span>Launch Workspace</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main style={{ flex: 1 }}>
        <section style={{
          padding: 'clamp(48px, 8vw, 80px) clamp(16px, 4vw, 24px) clamp(40px, 6vw, 64px) clamp(16px, 4vw, 24px)',
          maxWidth: '1080px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          {/* Tag Pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '5px 14px',
            backgroundColor: 'var(--primary-subtle)',
            color: 'var(--primary-text)',
            border: '1px solid var(--primary-border)',
            borderRadius: 'var(--radius-full)',
            fontSize: '12px',
            fontWeight: 600,
            marginBottom: '20px',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
            <span>Sovereign Risk Intelligence Federation</span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span style={{ color: 'var(--text-secondary)' }}>Research Prototype (Non-PII)</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.1rem, 5vw, 3.2rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            color: 'var(--text-primary)',
            letterSpacing: '-0.03em',
            marginBottom: '20px'
          }}>
            Shared intelligence.<br />
            <span style={{ color: 'var(--primary)' }}>Protected data.</span>
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
            color: 'var(--text-secondary)',
            maxWidth: '720px',
            margin: '0 auto 36px auto',
            lineHeight: 1.6
          }}>
            Enable sovereign banks, insurers, and credit platforms to jointly detect multi-institution fraud and loan stacking—without pooling, centralizing, or exposing customer records.
          </p>

          {/* Primary Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '48px' }}>
            <button 
              onClick={onEnterApp}
              className="btn btn-primary btn-lg"
              style={{ fontSize: '15px', padding: '12px 28px' }}
              aria-label="Launch Enterprise Workspace"
            >
              <span>Launch Enterprise Workspace</span>
              <ArrowRight size={16} />
            </button>
            <button 
              onClick={onStartTour}
              className="btn btn-secondary btn-lg"
              style={{ fontSize: '15px', padding: '12px 24px' }}
              aria-label="Start 3-Minute Interactive Tour"
            >
              <Play size={14} fill="var(--primary)" stroke="var(--primary)" />
              <span>3-Minute Interactive Tour</span>
            </button>
          </div>

          {/* Responsive Collaboration Visual */}
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-xl)',
            padding: 'clamp(20px, 4vw, 36px) clamp(16px, 3vw, 28px)',
            boxShadow: 'var(--shadow-sm)',
            maxWidth: '920px',
            margin: '0 auto'
          }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '20px' }}>
              Physical Data Sovereignty & Split Learning Pipeline
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '16px', alignItems: 'stretch' }}>
              {/* Bank A Node */}
              <div style={{
                padding: '18px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-default)',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Building2 size={16} color="var(--primary)" />
                    <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Bank A Node (Port 8001)</strong>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                    Repayment histories & transaction velocity stored on sovereign SQLite database.
                  </p>
                </div>
                <div style={{ marginTop: '12px', padding: '6px 8px', borderRadius: '4px', backgroundColor: '#FFFFFF', border: '1px solid var(--border-default)', fontSize: '11px', fontWeight: 600, color: 'var(--primary-text)' }}>
                  z_A: Partial Logit (Scalar)
                </div>
              </div>

              {/* Insurer B Node */}
              <div style={{
                padding: '18px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-default)',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Building2 size={16} color="var(--accent-teal)" />
                    <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Insurer B Node (Port 8002)</strong>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                    Policy tenures & claim anomaly ratings isolated behind sovereign boundary.
                  </p>
                </div>
                <div style={{ marginTop: '12px', padding: '6px 8px', borderRadius: '4px', backgroundColor: '#FFFFFF', border: '1px solid var(--border-default)', fontSize: '11px', fontWeight: 600, color: 'var(--accent-teal-text)' }}>
                  z_B: Partial Logit (Scalar)
                </div>
              </div>

              {/* Lender C Node */}
              <div style={{
                padding: '18px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-default)',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Building2 size={16} color="var(--status-warning)" />
                    <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Lender C Node (Port 8003)</strong>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                    Credit inquiry velocities & debt stress retained on local partition.
                  </p>
                </div>
                <div style={{ marginTop: '12px', padding: '6px 8px', borderRadius: '4px', backgroundColor: '#FFFFFF', border: '1px solid var(--border-default)', fontSize: '11px', fontWeight: 600, color: 'var(--status-warning-text)' }}>
                  z_C: Partial Logit (Scalar)
                </div>
              </div>
            </div>

            {/* Central Aggregator Flow */}
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px dashed var(--border-medium)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <CheckCircle2 size={15} color="var(--status-success)" />
                <span>Zero Customer Record Centralization</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <CheckCircle2 size={15} color="var(--status-success)" />
                <span>Zero-Sum Masking (SecAgg Σ M_i = 0)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <CheckCircle2 size={15} color="var(--status-success)" />
                <span>Tamper-Evident SHA-256 Audit Trail</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3 Core Capability Columns */}
        <section style={{
          padding: 'clamp(32px, 6vw, 48px) clamp(16px, 4vw, 24px) clamp(48px, 8vw, 80px) clamp(16px, 4vw, 24px)',
          maxWidth: '1080px',
          margin: '0 auto',
          borderTop: '1px solid var(--border-default)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <h2 style={{ fontSize: 'clamp(1.4rem, 3.5vw, 1.8rem)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
              Enterprise Privacy & Governance Pillars
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px', marginBottom: 0 }}>
              Multi-party collaborative risk intelligence evaluated on synthetic financial data.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '20px' }}>
            {/* Card 1 */}
            <div style={{
              padding: '24px',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-xs)'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-subtle)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <Network size={20} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Vertical Federated Learning
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                Institutions possess non-overlapping features for shared customer entities. Split Learning trains a joint model by communicating only scalar partial logits, achieving ROC-AUC of 0.97 without pooling raw data.
              </p>
            </div>

            {/* Card 2 */}
            <div style={{
              padding: '24px',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-xs)'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--accent-teal-subtle)',
                color: 'var(--accent-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <Layers size={20} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Cryptographic Secure Aggregation
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                Zero-sum pseudorandom masking guarantees the central coordinator learns only the aggregate model update while never observing individual participant vectors. Explicit dropout abort halts execution if masks fail to cancel.
              </p>
            </div>

            {/* Card 3 */}
            <div style={{
              padding: '24px',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-xs)'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--accent-violet-subtle)',
                color: 'var(--accent-violet)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <FileCheck2 size={20} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Tamper-Evident SHA-256 Audit Trail
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                Every verification request, model update, and case clearance is canonically serialized and linked into a continuous SHA-256 hash chain from genesis block. Any historical mutation causes immediate verification failure.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Clean Footer */}
      <footer style={{
        padding: '20px clamp(16px, 4vw, 32px)',
        borderTop: '1px solid var(--border-default)',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        fontSize: '12px',
        color: 'var(--text-muted)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <strong style={{ color: 'var(--text-primary)' }}>PriviLink Platform</strong>
          <span>•</span>
          <span>Academic-Grade Proof-of-Concept</span>
          <span>•</span>
          <span>Synthetic Non-PII Benchmark Dataset</span>
        </div>
        <div>
          <span>MIT License • Enterprise Privacy Federation</span>
        </div>
      </footer>
    </div>
  );
}
