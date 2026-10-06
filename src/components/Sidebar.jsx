import React, { useState, useEffect } from 'react';
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
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Tooltip } from './ui/Tooltip';

export default function Sidebar({
  currentTab,
  setTab,
  quarantinedLender,
  collapsed = false,
  onToggleCollapse
}) {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  // Auto-collapse below 1100px screen width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1100) {
        setIsCollapsed(true);
        if (onToggleCollapse) onToggleCollapse(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [onToggleCollapse]);

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    if (onToggleCollapse) onToggleCollapse(next);
  };

  const navSections = [
    {
      group: 'Monitor',
      items: [
        { id: 'overview', label: 'Overview Dashboard', icon: LayoutDashboard },
        { id: 'collaborative_risk', label: 'Collaborative Risk', icon: AlertTriangle, badge: '6 Active' }
      ]
    },
    {
      group: 'Investigate',
      items: [
        { id: 'customer_investigation', label: 'Case Investigation', icon: UserSearch },
        { id: 'institutions', label: 'Institution Network', icon: Building2 }
      ]
    },
    {
      group: 'Network & Privacy',
      items: [
        { id: 'model_collaboration', label: 'Model Collaboration', icon: Network },
        { id: 'privacy_center', label: 'Differential Privacy', icon: Shield },
        { id: 'audit_trail', label: 'Cryptographic Audit', icon: FileCheck2 }
      ]
    },
    {
      group: 'Lab',
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
    <aside
      className="tm-sidebar"
      style={{
        width: isCollapsed ? '64px' : '240px',
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-default)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        minHeight: 'calc(100vh - 56px)',
        transition: 'width var(--transition-normal)',
        zIndex: 30,
        position: 'relative',
        userSelect: 'none'
      }}
    >
      {/* Sidebar Header: Logo & Wordmark + Collapse Trigger */}
      <div
        style={{
          height: '56px',
          padding: isCollapsed ? '0 12px' : '0 16px',
          borderBottom: '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          gap: '8px'
        }}
      >
        {!isCollapsed ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <ShieldCheck size={18} strokeWidth={2.4} />
            </div>
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 'var(--text-base)',
                  letterSpacing: '-0.02em',
                  color: 'var(--text-primary)',
                  lineHeight: 1.1
                }}
              >
                TRUSTMESH
              </div>
              <div
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-muted)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  fontWeight: 600
                }}
              >
                Risk Intelligence
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ShieldCheck size={18} strokeWidth={2.4} />
          </div>
        )}

        <button
          onClick={toggleCollapse}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-xs)',
            color: 'var(--text-muted)',
            backgroundColor: 'transparent',
            border: '1px solid transparent'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Nav List */}
      <nav
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: isCollapsed ? '12px 6px' : '14px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        {navSections.map((section, sIdx) => (
          <div key={sIdx} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {!isCollapsed && (
              <div
                style={{
                  padding: '4px 10px',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--text-muted)'
                }}
              >
                {section.group}
              </div>
            )}

            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              const buttonContent = (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: isCollapsed ? 0 : '10px',
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    padding: isCollapsed ? '9px 0' : '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isActive ? 'var(--primary-subtle)' : 'transparent',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: 'var(--text-base)',
                    textAlign: 'left',
                    width: '100%',
                    borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                    transition: 'all var(--transition-fast)',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  <Icon
                    size={16}
                    strokeWidth={isActive ? 2.2 : 1.8}
                    style={{
                      color: isActive ? 'var(--primary-hover)' : 'var(--text-muted)',
                      flexShrink: 0
                    }}
                  />

                  {!isCollapsed && (
                    <span
                      style={{
                        flex: 1,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {item.label}
                    </span>
                  )}

                  {!isCollapsed && item.badge && (
                    <span
                      style={{
                        fontSize: 'var(--text-xs)',
                        padding: '1px 5px',
                        backgroundColor: 'var(--bg-surface-raised)',
                        color: 'var(--text-secondary)',
                        borderRadius: 'var(--radius-xs)',
                        border: '1px solid var(--border-default)',
                        fontWeight: 600
                      }}
                    >
                      {item.badge}
                    </span>
                  )}

                  {!isCollapsed && item.warning && (
                    <span
                      style={{
                        fontSize: 'var(--text-xs)',
                        padding: '1px 5px',
                        backgroundColor: 'var(--danger-subtle)',
                        color: 'var(--danger)',
                        borderRadius: 'var(--radius-xs)',
                        border: '1px solid var(--danger-border)',
                        fontWeight: 600
                      }}
                    >
                      {item.warning}
                    </span>
                  )}

                  {isCollapsed && (item.badge || item.warning) && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '6px',
                        right: '8px',
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: item.warning ? 'var(--danger)' : 'var(--primary)'
                      }}
                    />
                  )}
                </button>
              );

              return isCollapsed ? (
                <Tooltip key={item.id} content={item.label} position="right">
                  {buttonContent}
                </Tooltip>
              ) : (
                buttonContent
              );
            })}
          </div>
        ))}
      </nav>

      {/* Sidebar Footer: Node Health & Version */}
      <div
        style={{
          padding: isCollapsed ? '12px 6px' : '14px 16px',
          borderTop: '1px solid var(--border-default)',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          fontSize: 'var(--text-xs)'
        }}
      >
        {!isCollapsed ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: quarantinedLender ? 'var(--warning)' : 'var(--success)',
                    boxShadow: quarantinedLender
                      ? '0 0 6px var(--warning)'
                      : '0 0 6px var(--success)',
                    display: 'inline-block'
                  }}
                />
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {quarantinedLender ? 'Node Degraded' : 'Node online'}
                </span>
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-muted)',
                  fontSize: '10px'
                }}
              >
                v2.4.0
              </span>
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '11px', lineHeight: 1.2 }}>
              Split Learning • SecAgg v2.1
            </div>
          </div>
        ) : (
          <Tooltip content="Node online • v2.4.0" position="right">
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: quarantinedLender ? 'var(--warning)' : 'var(--success)'
                }}
              />
            </div>
          </Tooltip>
        )}
      </div>
    </aside>
  );
}
