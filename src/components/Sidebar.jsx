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
  BookOpen,
  Lock
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
      width: '240px',
      backgroundColor: '#090D16',
      borderRight: '1px solid #1E293B',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      minHeight: 'calc(100vh - 64px)',
      padding: '16px 0',
      color: '#94A3B8'
    }}>
      <div style={{ padding: '0 16px 12px 16px', borderBottom: '1px solid #1E293B' }}>
        <span style={{
          fontSize: '0.65rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: '#64748B'
        }}>
          Risk Intelligence Core
        </span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '12px 8px', flex: 1, overflowY: 'auto' }}>
        {navSections.map((section, sIdx) => (
          <div key={sIdx} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{
              padding: '4px 10px',
              fontSize: '0.625rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              color: '#64748B'
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
                    gap: '9px',
                    padding: '7px 10px',
                    borderRadius: '5px',
                    color: isActive ? '#FFFFFF' : '#94A3B8',
                    backgroundColor: isActive ? 'rgba(2, 132, 199, 0.14)' : 'transparent',
                    fontWeight: isActive ? 600 : 400,
                    fontSize: '0.8rem',
                    textAlign: 'left',
                    width: '100%',
                    borderLeft: isActive ? '3px solid #0284C7' : '3px solid transparent',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                      e.currentTarget.style.color = '#F8FAFC';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#94A3B8';
                    }
                  }}
                >
                  <Icon size={14} style={{ color: isActive ? '#38BDF8' : '#64748B', flexShrink: 0 }} />
                  <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.label}
                  </span>
                  {item.badge && (
                    <span style={{
                      fontSize: '0.6rem',
                      padding: '1px 5px',
                      backgroundColor: '#1E293B',
                      color: '#94A3B8',
                      borderRadius: '4px',
                      border: '1px solid #334155'
                    }}>
                      {item.badge}
                    </span>
                  )}
                  {item.warning && (
                    <span style={{
                      fontSize: '0.6rem',
                      padding: '1px 5px',
                      backgroundColor: 'rgba(220, 38, 38, 0.2)',
                      color: '#FCA5A5',
                      borderRadius: '4px',
                      border: '1px solid #DC2626',
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
                      backgroundColor: '#38BDF8',
                      boxShadow: '0 0 6px rgba(56, 189, 248, 0.6)'
                    }} />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Sovereign Isolation Guarantee Footer */}
      <div style={{
        margin: '10px 10px 0 10px',
        padding: '11px',
        backgroundColor: '#111827',
        borderRadius: '6px',
        border: '1px solid #1E293B',
        fontSize: '0.72rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38BDF8', fontWeight: 600, marginBottom: '4px' }}>
          <Lock size={12} />
          <span>Sovereign Isolation</span>
        </div>
        <p style={{ color: '#94A3B8', lineHeight: 1.35, fontSize: '0.685rem' }}>
          Raw Customer Records Shared: <strong style={{ color: '#FFFFFF' }}>0</strong>
        </p>
        <div style={{ marginTop: '7px', height: '3px', backgroundColor: '#1E293B', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ width: '100%', height: '100%', backgroundColor: '#10B981' }} />
        </div>
      </div>
    </aside>
  );
}
