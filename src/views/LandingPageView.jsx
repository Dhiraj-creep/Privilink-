import React from 'react';
import { 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  Layers, 
  Sparkles, 
  Play,
  FileCheck2
} from 'lucide-react';

export default function LandingPageView({ onEnterApp, onStartTour, onRunSimulation }) {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-app)',
      color: 'var(--text-primary)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Top Banner */}
      <div style={{
        backgroundColor: 'var(--primary-dark)',
        padding: '9px 32px',
        color: 'var(--muted-sage)',
        fontSize: '0.75rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--nav-border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="badge badge-demo" style={{ fontSize: '0.625rem', backgroundColor: '#1A4335', color: '#E8EBE9', borderColor: '#2F6B4F' }}>
            Prototype Platform
          </span>
          <span style={{ color: '#E8EBE9' }}>Privacy-Preserving Cross-Institution Risk Intelligence</span>
        </div>
        <div>
          <span style={{ color: 'var(--muted-sage)' }}>Synthetic Demonstration Data • Zero PII</span>
        </div>
      </div>

      {/* Header Nav */}
      <header style={{
        height: '70px',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 36px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--primary-dark)',
            color: 'var(--muted-sage)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(18, 55, 42, 0.15)'
          }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <span style={{ fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.02em', color: 'var(--primary-dark)' }}>
              TRUSTMESH
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button 
            onClick={onStartTour}
            className="btn btn-secondary btn-sm"
          >
            <Play size={13} fill="var(--primary-dark)" stroke="var(--primary-dark)" />
            <span>3-Min Demo Tour</span>
          </button>
          <button 
            onClick={onEnterApp}
            className="btn btn-primary btn-sm"
          >
            <span>Enter Enterprise Console</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        padding: '72px 28px 48px 28px',
        maxWidth: '1080px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '5px 14px',
          backgroundColor: 'var(--sage-light)',
          color: 'var(--primary-dark)',
          border: '1px solid var(--sage-border)',
          borderRadius: '20px',
          fontSize: '0.785rem',
          fontWeight: 600,
          marginBottom: '24px'
        }}>
          <Sparkles size={14} color="var(--secondary-green)" />
          <span>Vertical Federated Learning for Inter-Bank Risk Intelligence</span>
        </div>

        <h1 style={{
          fontSize: '3.1rem',
          fontWeight: 800,
          lineHeight: 1.15,
          color: 'var(--primary-dark)',
          letterSpacing: '-0.035em',
          marginBottom: '20px'
        }}>
          Share intelligence.<br />
          <span style={{ color: 'var(--secondary-green)' }}>Not customer data.</span>
        </h1>

        <p style={{
          fontSize: '1.18rem',
          color: 'var(--text-secondary)',
          maxWidth: '720px',
          margin: '0 auto 34px auto',
          lineHeight: 1.55
        }}>
          Collaborative financial-risk intelligence for banks, insurers, and credit platforms that cannot pool raw customer records due to strict privacy, regulatory, and banking governance standards.
        </p>

        {/* Hero CTA Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '56px' }}>
          <button 
            onClick={onEnterApp}
            className="btn btn-primary"
            style={{ padding: '12px 28px', fontSize: '0.95rem', fontWeight: 600 }}
          >
            <span>Explore Institution Network</span>
            <ArrowRight size={16} />
          </button>

          <button 
            onClick={onRunSimulation}
            className="btn btn-secondary"
            style={{ padding: '12px 28px', fontSize: '0.95rem', fontWeight: 600 }}
          >
            <Play size={16} fill="var(--primary-dark)" stroke="var(--primary-dark)" />
            <span>Launch Simulation Lab</span>
          </button>
        </div>

        {/* 3 Pillar Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: '22px',
          textAlign: 'left'
        }}>
          {/* Card 1: PRIVATE */}
          <div className="card" style={{ padding: '28px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--sage-light)',
              color: 'var(--primary-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <Lock size={20} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '8px' }}>
              PRIVATE
            </h3>
            <p style={{ fontSize: '0.835rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Raw customer records remain sovereign within each institution's firewall. Local features are converted into differentially private latent vectors and blinded via secure aggregation. Raw records shared: <strong style={{ color: 'var(--primary-dark)' }}>0</strong>.
            </p>
          </div>

          {/* Card 2: COLLABORATIVE */}
          <div className="card" style={{ padding: '28px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--sage-light)',
              color: 'var(--secondary-green)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <Layers size={20} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '8px' }}>
              COLLABORATIVE
            </h3>
            <p style={{ fontSize: '0.835rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Institutions learn from complementary risk signals. Isolated weak indicators across Bank, Insurer, and Lender converge into high-confidence early warning flags without centralized data lakes.
            </p>
          </div>

          {/* Card 3: EXPLAINABLE */}
          <div className="card" style={{ padding: '28px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--warning-light)',
              color: 'var(--warning)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <FileCheck2 size={20} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '8px' }}>
              EXPLAINABLE
            </h3>
            <p style={{ fontSize: '0.835rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Every risk evaluation includes an interpretable SHAP-like contribution score and minimum necessary disclosure matrix, enabling informed human decision support rather than opaque automated rejections.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        backgroundColor: 'var(--primary-dark)',
        color: 'var(--muted-sage)',
        padding: '24px 36px',
        borderTop: '1px solid var(--nav-border)',
        fontSize: '0.75rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <strong style={{ color: '#FCFBF7' }}>TRUSTMESH</strong> • Privacy-Preserving Cross-Institution Risk Intelligence
        </div>
        <div>
          <span>Synthetic Demonstration Prototype • Non-Production Banking Simulation</span>
        </div>
      </footer>
    </div>
  );
}
