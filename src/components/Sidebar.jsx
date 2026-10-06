import React from 'react';
import {
  LayoutDashboard,
  Building2,
  AlertTriangle,
  UserSearch,
  Shield,
  Layers,
  ShieldCheck,
  Network,
  Fingerprint,
  Terminal,
  FileCheck2,
  BookOpen
} from 'lucide-react';

export default function Sidebar({ currentTab, setTab, quarantinedLender }) {
  const navSections = [
    {
      title: 'Core Operations',
      items: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'collaborative_risk', label: 'Collaborative Risk', icon: AlertTriangle, badge: '6 Cases' },
        { id: 'customer_investigation', label: 'Case Investigation', icon: UserSearch },
        { id: 'institutions', label: 'Institution Network', icon: Building2 },
      ]
    },
    {
      title: 'Model & Governance',
      items: [
        { id: 'model_collaboration', label: 'Model Collaboration', icon: Network },
        { id: 'privacy_center', label: 'Differential Privacy', icon: Shield },
        { id: 'audit_trail', label: 'Cryptographic Audit', icon: FileCheck2 },
      ]
    },
    {
      title: 'Evaluator Labs',
      items: [
        { id: 'simulation_lab', label: 'Simulation Lab', icon: Terminal, highlight: true },
        { id: 'secure_aggregation', label: 'Secure Aggregation', icon: Layers },
        { id: 'entity_resolution', label: 'Private Entity PSI', icon: Fingerprint },
        { id: 'trust_security', label: 'Trust & Security', icon: ShieldCheck, warning: quarantinedLender ? 'Alert' : null },
        { id: 'architecture_scope', label: 'Architecture & Scope', icon: BookOpen }
      ]
    }
  ];

  return (
    <aside style={{
      width: '252px',
      backgroundColor: 'var(--nav-bg)',
      borderRight: '1px solid var(--nav-border)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      minHeight: 'calc(100vh - 66px)',
      padding: '16px 0',
      color: 'var(--nav-text)'
    }}>
      <div style={{ padding: '0 20px 14px 20px', borderBottom: '1px solid var(--nav-border)' }}>
        <span style={{
          fontSize: '0.68rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--muted-sage)'
        }}>
          Risk Intelligence Core
        </span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '14px 10px', flex: 1, overflowY: 'auto' }}>
        {navSections.map((section, sIdx) => (
          <div key={sIdx} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div style={{
              padding: '4px 12px',
              fontSize: '0.65rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              color: 'var(--muted-sage)',
              opacity: 0.85
            }}>
              {section.title}
            </div>

            {section.items.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    color: isActive ? 'var(--nav-text-active)' : 'var(--nav-text)',
                    backgroundColor: isActive ? 'var(--nav-surface)' : 'transparent',
                    fontWeight: isActive ? 600 : 400,
                    fontSize: '0.805rem',
                    textAlign: 'left',
                    width: '100%',
                    borderLeft: isActive ? '3px solid var(--muted-sage)' : '3px solid transparent',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'rgba(143, 175, 157, 0.08)';
                      e.currentTarget.style.color = '#FCFBF7';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--nav-text)';
                    }
                  }}
                >
                  <Icon size={15} style={{ color: isActive ? 'var(--muted-sage)' : '#8FAF9D', opacity: isActive ? 1 : 0.75, flexShrink: 0 }} />
                  <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.label}
                  </span>
                  {item.badge && (
                    <span style={{
                      fontSize: '0.62rem',
                      padding: '2px 6px',
                      backgroundColor: 'var(--nav-surface)',
                      color: 'var(--muted-sage)',
                      borderRadius: '10px',
                      border: '1px solid var(--nav-border)'
                    }}>
                      {item.badge}
                    </span>
                  )}
                  {item.warning && (
                    <span style={{
                      fontSize: '0.62rem',
                      padding: '2px 6px',
                      backgroundColor: 'rgba(182, 74, 69, 0.25)',
                      color: '#F9EBEA',
                      borderRadius: '10px',
                      border: '1px solid var(--danger)',
                      fontWeight: 600
                    }}>
                      {item.warning}
                    </span>
                  )}
                  {item.highlight && (
                    <span style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--muted-sage)'
                    }} />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Zero Raw Data Guarantee Footer in Sidebar */}
      <div style={{
        margin: '12px 12px 0 12px',
        padding: '13px',
        backgroundColor: 'var(--nav-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--nav-border)',
        fontSize: '0.735rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: 'var(--muted-sage)', fontWeight: 600, marginBottom: '5px' }}>
          <Shield size={14} />
          <span>Zero-Knowledge Proof</span>
        </div>
        <p style={{ color: 'var(--nav-text)', lineHeight: 1.4, fontSize: '0.7rem' }}>
          Raw Customer Records Shared: <strong style={{ color: '#FCFBF7' }}>0</strong>
        </p>
        <div style={{ marginTop: '8px', height: '4px', backgroundColor: 'var(--nav-bg)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--success)' }} />
        </div>
      </div>
    </aside>
  );
}
