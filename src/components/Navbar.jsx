import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  Play,
  ChevronDown,
  LogOut,
  Search,
  Check,
  Building2,
  Shield,
  ShieldCheck,
  Menu
} from 'lucide-react';
import GlobalSearch from './GlobalSearch';

export default function Navbar({
  currentRole,
  currentUser,
  currentTab = 'overview',
  onPersonaLogin,
  onLogout,
  onStartDemoTour,
  alertCount = 0,
  notifications = [],
  backendConnected = false,
  appMode = 'app',
  onToggleAppMode,
  onToggleMobileMenu,
  cases = [],
  onSelectCase,
  onNavigate
}) {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const roleMenuRef = useRef(null);
  const notifMenuRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target)) {
        setShowRoleMenu(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target)) {
        setShowNotificationMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K opens GlobalSearch
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowSearchModal(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const demoPersonas = [
    {
      id: 'RISK_ANALYST',
      username: 'analyst',
      title: 'Risk Analyst',
      subtitle: 'Global case investigation & Step-Up KYC dispatch',
      badge: 'Analyst'
    },
    {
      id: 'INSTITUTION_ADMIN_BANK',
      role: 'INSTITUTION_ADMIN',
      username: 'bank_admin',
      institutionId: 'BANK_A',
      title: 'Institution Admin (Bank A)',
      subtitle: 'Sovereign Bank A customer records (HTTP 403 on peers)',
      badge: 'Bank A'
    },
    {
      id: 'INSTITUTION_ADMIN_INSURER',
      role: 'INSTITUTION_ADMIN',
      username: 'insurer_admin',
      institutionId: 'INSURER_B',
      title: 'Institution Admin (Insurer B)',
      subtitle: 'Sovereign Insurer B policies (HTTP 403 on peers)',
      badge: 'Insurer B'
    },
    {
      id: 'INSTITUTION_ADMIN_LENDER',
      role: 'INSTITUTION_ADMIN',
      username: 'lender_admin',
      institutionId: 'LENDER_C',
      title: 'Institution Admin (Lender C)',
      subtitle: 'Sovereign Lender C credit records (HTTP 403 on peers)',
      badge: 'Lender C'
    },
    {
      id: 'COMPLIANCE_OFFICER',
      role: 'COMPLIANCE_OFFICER',
      username: 'compliance',
      title: 'Compliance Officer',
      subtitle: 'Audit chain verification & case clearance resolution',
      badge: 'Compliance'
    },
    {
      id: 'NETWORK_ADMIN',
      role: 'NETWORK_ADMIN',
      username: 'admin',
      title: 'Network Admin',
      subtitle: 'Topology management, Byzantine defense & quarantine',
      badge: 'Admin'
    }
  ];

  const handleSelectPersona = async (persona) => {
    setIsAuthenticating(true);
    try {
      if (onPersonaLogin) {
        await onPersonaLogin(persona.username);
      }
      setShowRoleMenu(false);
    } catch (err) {
      console.error('Persona authentication failed:', err);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const getBreadcrumb = () => {
    switch (currentTab) {
      case 'overview': return 'Overview';
      case 'risk_cases':
      case 'collaborative_risk': return 'Risk Cases';
      case 'customer_investigation': return 'Risk Cases / Investigation';
      case 'institutions': return 'Institutions';
      case 'security_privacy':
      case 'privacy_center':
      case 'trust_security':
      case 'model_collaboration': return 'Security & Privacy';
      case 'audit_trail': return 'Audit Trail';
      case 'advanced_demo':
      case 'simulation_lab':
      case 'secure_aggregation':
      case 'entity_resolution': return 'Demo Labs';
      case 'architecture_scope': return 'Architecture & Scope';
      default: return 'Overview';
    }
  };

  return (
    <>
      <header
        className="tm-topbar"
        style={{
          height: '56px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          gap: '12px'
        }}
      >
        {/* Left: Hamburger (mobile), Brand Logo, and Desktop Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flexShrink: 0 }}>
          {/* Mobile Drawer Button */}
          <button
            onClick={onToggleMobileMenu}
            className="tm-mobile-menu-btn"
            aria-label="Open navigation menu"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-default)',
              backgroundColor: '#FFFFFF',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Menu size={18} />
          </button>

          {/* Brand Logo */}
          <div
            onClick={() => onToggleAppMode && onToggleAppMode('landing')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            title="Return to Landing Page"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && onToggleAppMode) onToggleAppMode('landing');
            }}
          >
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-subtle)',
                border: '1px solid var(--primary-border)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Shield size={16} strokeWidth={2.4} />
            </div>
            <div>
              <span style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-primary)', letterSpacing: '-0.02em', display: 'block', lineHeight: 1.1 }}>
                TRUSTMESH
              </span>
              <span className="tm-desktop-only" style={{ fontSize: '9px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Risk Intelligence
              </span>
            </div>
          </div>

          <div className="tm-desktop-only" style={{ width: '1px', height: '20px', backgroundColor: 'var(--border-default)', margin: '0 4px' }} />

          {/* Breadcrumb Hierarchy (Desktop Only) */}
          <div className="tm-desktop-only tm-nav-breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-xs)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Workspace</span>
            <span style={{ color: 'var(--border-medium)' }}>/</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{getBreadcrumb()}</span>
          </div>

          {/* Node Connectivity Badge (Tablet & Desktop) */}
          <div
            className="tm-tablet-desktop-only tm-nav-node-badge"
            style={{
              alignItems: 'center',
              gap: '6px',
              padding: '2px 8px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-default)',
              fontSize: '11px',
              color: 'var(--text-secondary)'
            }}
          >
            <Building2 size={12} color="var(--primary)" />
            <span style={{ fontWeight: 500 }}>
              {currentUser?.institution_id
                ? `${currentUser.institution_id} Node`
                : backendConnected
                ? 'Coordinator Node'
                : 'Local Mode'}
            </span>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: backendConnected ? 'var(--status-success)' : 'var(--status-warning)'
              }}
            />
          </div>
        </div>

        {/* Center: Global Search Input (Desktop) & Search Trigger (Mobile) */}
        <div style={{ flex: 1, maxWidth: '360px', minWidth: 0, display: 'flex', justifyContent: 'center' }}>
          {/* Desktop Search Bar */}
          <button
            onClick={() => setShowSearchModal(true)}
            className="tm-desktop-search-trigger"
            aria-label="Search cases by ID, customer ref, or risk tier (Ctrl+K)"
            style={{
              width: '100%',
              height: '32px',
              padding: '0 10px',
              fontSize: '12px',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <Search size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Search cases by ID, customer ref...</span>
            </span>
            <span
              style={{
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                padding: '1px 5px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-default)',
                color: 'var(--text-muted)',
                flexShrink: 0
              }}
            >
              Ctrl+K
            </span>
          </button>
        </div>

        {/* Right: Actions, Tour, Alerts, Role Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {/* Mobile Search Icon Button */}
          <button
            onClick={() => setShowSearchModal(true)}
            className="tm-mobile-search-btn"
            aria-label="Search cases and institutions"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-default)',
              backgroundColor: '#FFFFFF',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Search size={15} />
          </button>

          {/* Landing Page Link (Desktop Only) */}
          <button
            onClick={() => onToggleAppMode && onToggleAppMode(appMode === 'app' ? 'landing' : 'app')}
            className="btn btn-ghost btn-sm tm-desktop-only"
            style={{ fontSize: '12px' }}
            aria-label={appMode === 'app' ? 'Switch to Landing Page view' : 'Return to Enterprise Workspace'}
          >
            {appMode === 'app' ? 'Landing View' : 'Workspace'}
          </button>

          {/* Guided Tour Trigger (Desktop & Tablet) */}
          <button
            onClick={onStartDemoTour}
            className="btn btn-secondary btn-sm tm-tablet-desktop-only"
            style={{ gap: '5px' }}
            title="Start Interactive Product Tour"
            aria-label="Start product tour"
          >
            <Play size={11} fill="var(--primary)" stroke="var(--primary)" />
            <span>Tour</span>
          </button>

          {/* Notification Bell Dropdown */}
          <div style={{ position: 'relative' }} ref={notifMenuRef}>
            <button
              onClick={() => setShowNotificationMenu(!showNotificationMenu)}
              aria-label={`View system notifications (${alertCount} unread)`}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-default)',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              <Bell size={15} />
              {alertCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-3px',
                    right: '-3px',
                    width: '15px',
                    height: '15px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--status-danger)',
                    color: '#FFFFFF',
                    fontSize: '9px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {alertCount}
                </span>
              )}
            </button>

            {showNotificationMenu && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 8px)',
                  width: 'min(320px, calc(100vw - 32px))',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-default)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '12px',
                  zIndex: 100
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid var(--border-default)' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>System Notifications</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{notifications.length} alerts</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: n.type === 'danger' ? 'var(--status-danger-subtle)' : n.type === 'warning' ? 'var(--status-warning-subtle)' : 'var(--bg-subtle)',
                        border: `1px solid ${n.type === 'danger' ? 'var(--status-danger-border)' : n.type === 'warning' ? 'var(--status-warning-border)' : 'var(--border-default)'}`,
                        fontSize: '11px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>{n.title}</strong>
                        <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{n.time}</span>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.35 }}>{n.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Persona Switcher / Role Menu */}
          <div style={{ position: 'relative' }} ref={roleMenuRef}>
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              aria-label={`Current role: ${currentUser?.title || currentRole}. Click to switch role`}
              className="tm-role-selector-btn"
              style={{
                height: '32px',
                padding: '0 8px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-default)',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                color: 'var(--text-primary)',
                fontWeight: 500
              }}
            >
              <ShieldCheck size={14} color="var(--primary)" style={{ flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentUser?.title || currentRole}
              </span>
              <ChevronDown size={12} color="var(--text-muted)" style={{ flexShrink: 0 }} />
            </button>

            {showRoleMenu && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 8px)',
                  width: 'min(310px, calc(100vw - 32px))',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-default)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '8px',
                  zIndex: 100
                }}
              >
                <div style={{ padding: '6px 10px 8px 10px', borderBottom: '1px solid var(--border-default)', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Switch Authenticated Role
                  </span>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Demonstrates server-enforced boundary isolation and permissions.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {demoPersonas.map((p) => {
                    const isCurrent = currentUser?.username === p.username;
                    return (
                      <button
                        key={p.username}
                        onClick={() => handleSelectPersona(p)}
                        disabled={isAuthenticating}
                        style={{
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: isCurrent ? 'var(--primary-subtle)' : 'transparent',
                          border: 'none',
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px',
                          transition: 'background-color var(--transition-fast)'
                        }}
                        onMouseEnter={(e) => {
                          if (!isCurrent) e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                        }}
                        onMouseLeave={(e) => {
                          if (!isCurrent) e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: isCurrent ? 'var(--primary)' : 'var(--text-primary)' }}>
                            {p.title}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>
                            {p.subtitle}
                          </div>
                        </div>
                        {isCurrent && <Check size={14} color="var(--primary)" />}
                      </button>
                    );
                  })}
                </div>

                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-default)', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={onLogout}
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: '11px', color: 'var(--status-danger)' }}
                    aria-label="Sign out"
                  >
                    <LogOut size={12} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Modal Dialog */}
      <GlobalSearch
        cases={cases}
        onSelectCase={onSelectCase}
        onNavigate={onNavigate}
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
      />
    </>
  );
}
