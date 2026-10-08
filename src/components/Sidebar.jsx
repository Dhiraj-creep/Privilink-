import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  AlertTriangle,
  Building2,
  ShieldCheck,
  FileCheck2,
  FlaskConical,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { Tooltip } from './ui/Tooltip';

export default function Sidebar({
  currentTab,
  setTab,
  quarantinedLender = false,
  backendConnected = false,
  collapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile
}) {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  // Auto-collapse on tablet (768px - 1024px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024 && window.innerWidth >= 768) {
        setIsCollapsed(true);
        if (onToggleCollapse) onToggleCollapse(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [onToggleCollapse]);

  // Handle Escape key for mobile drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMobileOpen && onCloseMobile) {
        onCloseMobile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen, onCloseMobile]);

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    if (onToggleCollapse) onToggleCollapse(next);
  };

  const handleNavClick = (tabId) => {
    setTab(tabId);
    if (isMobileOpen && onCloseMobile) {
      onCloseMobile();
    }
  };

  // 5 Primary Navigation Destinations
  const primaryNavItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      description: 'System HUD, principal risk & activity'
    },
    {
      id: 'risk_cases',
      label: 'Risk Cases',
      icon: AlertTriangle,
      badge: 'Cases',
      description: 'Collaborative cross-institution investigations'
    },
    {
      id: 'institutions',
      label: 'Institutions',
      icon: Building2,
      description: 'Sovereign participant nodes & schemas'
    },
    {
      id: 'security_privacy',
      label: 'Security & Privacy',
      icon: ShieldCheck,
      alert: quarantinedLender ? 'Alert' : null,
      description: 'DP-SGD, Byzantine defense & model metrics'
    },
    {
      id: 'audit_trail',
      label: 'Audit Trail',
      icon: FileCheck2,
      description: 'Tamper-evident SHA-256 event ledger'
    }
  ];

  // Secondary Destinations
  const secondaryNavItems = [
    {
      id: 'advanced_demo',
      label: 'Demo Labs',
      icon: FlaskConical,
      description: 'SecAgg, PSI, and anomaly simulation labs'
    },
    {
      id: 'architecture_scope',
      label: 'Architecture & Scope',
      icon: BookOpen,
      description: 'Technical specs & sovereign data flow'
    }
  ];

  const renderNavList = (isMobileDrawer = false) => (
    <div style={{ padding: '16px 10px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div
        style={{
          padding: '4px 10px 8px 10px',
          fontSize: '11px',
          fontWeight: 700,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          display: (!isMobileDrawer && isCollapsed) ? 'none' : 'block'
        }}
      >
        Core Workflows
      </div>

      {primaryNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id || 
          (item.id === 'risk_cases' && currentTab === 'customer_investigation') ||
          (item.id === 'risk_cases' && currentTab === 'collaborative_risk');

        const buttonElement = (
          <button
            onClick={() => handleNavClick(item.id === 'risk_cases' ? 'risk_cases' : item.id)}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: (!isMobileDrawer && isCollapsed) ? '10px 0' : '9px 12px',
              justifyContent: (!isMobileDrawer && isCollapsed) ? 'center' : 'flex-start',
              borderRadius: 'var(--radius-md)',
              backgroundColor: isActive ? 'var(--primary-subtle)' : 'transparent',
              color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: isActive ? 600 : 500,
              fontSize: 'var(--text-sm)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
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
              size={18}
              color={isActive ? 'var(--primary)' : 'var(--text-muted)'}
              strokeWidth={isActive ? 2.2 : 1.8}
            />
            {(isMobileDrawer || !isCollapsed) && (
              <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.label}
              </span>
            )}
            {(isMobileDrawer || !isCollapsed) && item.alert && (
              <span
                style={{
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--status-danger-subtle)',
                  color: 'var(--status-danger)',
                  fontSize: '10px',
                  fontWeight: 700,
                  border: '1px solid var(--status-danger-border)'
                }}
              >
                {item.alert}
              </span>
            )}
          </button>
        );

        if (!isMobileDrawer && isCollapsed) {
          return (
            <Tooltip key={item.id} content={item.label} position="right">
              {buttonElement}
            </Tooltip>
          );
        }
        return <React.Fragment key={item.id}>{buttonElement}</React.Fragment>;
      })}

      {/* Subtle Divider */}
      <div style={{ height: '1px', backgroundColor: 'var(--border-default)', margin: '14px 4px' }} />

      <div
        style={{
          padding: '4px 10px 8px 10px',
          fontSize: '11px',
          fontWeight: 700,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          display: (!isMobileDrawer && isCollapsed) ? 'none' : 'block'
        }}
      >
        Labs & Specs
      </div>

      {secondaryNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id || 
          (item.id === 'advanced_demo' && ['simulation_lab', 'secure_aggregation', 'entity_resolution'].includes(currentTab));

        const buttonElement = (
          <button
            onClick={() => handleNavClick(item.id)}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: (!isMobileDrawer && isCollapsed) ? '10px 0' : '9px 12px',
              justifyContent: (!isMobileDrawer && isCollapsed) ? 'center' : 'flex-start',
              borderRadius: 'var(--radius-md)',
              backgroundColor: isActive ? 'var(--primary-subtle)' : 'transparent',
              color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: isActive ? 600 : 500,
              fontSize: 'var(--text-sm)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
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
              size={18}
              color={isActive ? 'var(--primary)' : 'var(--text-muted)'}
              strokeWidth={isActive ? 2.2 : 1.8}
            />
            {(isMobileDrawer || !isCollapsed) && (
              <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.label}
              </span>
            )}
          </button>
        );

        if (!isMobileDrawer && isCollapsed) {
          return (
            <Tooltip key={item.id} content={item.label} position="right">
              {buttonElement}
            </Tooltip>
          );
        }
        return <React.Fragment key={item.id}>{buttonElement}</React.Fragment>;
      })}
    </div>
  );

  return (
    <>
      {/* 1. Mobile Off-Canvas Drawer (<768px) */}
      {isMobileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className="tm-mobile-drawer-wrapper"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 150,
            display: 'flex'
          }}
        >
          {/* Backdrop */}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.45)',
              backdropFilter: 'blur(2px)'
            }}
            onClick={onCloseMobile}
          />

          {/* Drawer Content */}
          <aside
            style={{
              position: 'relative',
              width: 'min(280px, 85vw)',
              height: '100%',
              backgroundColor: '#FFFFFF',
              borderRight: '1px solid var(--border-default)',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-xl)',
              zIndex: 10
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                height: '56px',
                padding: '0 16px',
                borderBottom: '1px solid var(--border-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 800, fontSize: '15px', color: 'var(--text-primary)' }}>
                  PriviLink
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Navigation</span>
              </div>
              <button
                onClick={onCloseMobile}
                aria-label="Close navigation"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-default)',
                  backgroundColor: 'var(--bg-subtle)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Nav list */}
            {renderNavList(true)}

            {/* Drawer Footer */}
            <div style={{ padding: '16px', borderTop: '1px solid var(--border-default)', fontSize: '11px', color: 'var(--text-muted)' }}>
              Sovereign Federated Risk Workspace
            </div>
          </aside>
        </div>
      )}

      {/* 2. Desktop & Tablet Sidebar (>=768px) */}
      <aside
        className="tm-sidebar tm-desktop-sidebar"
        aria-label="Application navigation"
        style={{
          width: isCollapsed ? '64px' : '230px',
          backgroundColor: '#FFFFFF',
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
        {renderNavList(false)}

        {/* Sidebar Footer: Collapse Toggle */}
        <div
          style={{
            padding: '12px',
            borderTop: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between'
          }}
        >
          {!isCollapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: !backendConnected
                    ? 'var(--status-warning)'
                    : (quarantinedLender ? 'var(--status-warning)' : 'var(--status-success)')
                }}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
                {!backendConnected
                  ? 'Local Standalone'
                  : (quarantinedLender ? 'Cluster: 2/3 Nodes' : 'Cluster Online')}
              </span>
            </div>
          )}
          <button
            onClick={toggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar navigation' : 'Collapse sidebar navigation'}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-default)',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>
      </aside>
    </>
  );
}
