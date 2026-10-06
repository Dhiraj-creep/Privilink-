import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Bell, 
  Play, 
  ChevronDown,
  Lock,
  LogOut,
  CheckCircle2,
  KeyRound
} from 'lucide-react';

export default function Navbar({ 
  currentRole, 
  currentUser,
  onPersonaLogin,
  onLogout,
  onStartDemoTour, 
  alertCount, 
  notifications,
  backendConnected = false
}) {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState(null);

  const demoPersonas = [
    {
      id: 'RISK_ANALYST',
      username: 'analyst',
      title: 'Risk Analyst',
      subtitle: 'Cross-institution case investigations & explainability HUD',
      scope: 'Global Read / Step-Up KYC Dispatch',
      badge: 'Analyst Clearance'
    },
    {
      id: 'INSTITUTION_ADMIN_BANK',
      role: 'INSTITUTION_ADMIN',
      username: 'bank_admin',
      institutionId: 'BANK_A',
      title: 'Institution Admin (Bank A)',
      subtitle: 'Local private schema & sovereign Bank A records only',
      scope: 'Sovereign Bank A Only (403 on Insurer & Lender)',
      badge: 'Bank A Sovereign'
    },
    {
      id: 'INSTITUTION_ADMIN_INSURER',
      role: 'INSTITUTION_ADMIN',
      username: 'insurer_admin',
      institutionId: 'INSURER_B',
      title: 'Institution Admin (Insurer B)',
      subtitle: 'Local private schema & sovereign Insurer B policies only',
      scope: 'Sovereign Insurer B Only (403 on Bank & Lender)',
      badge: 'Insurer B Sovereign'
    },
    {
      id: 'INSTITUTION_ADMIN_LENDER',
      role: 'INSTITUTION_ADMIN',
      username: 'lender_admin',
      institutionId: 'LENDER_C',
      title: 'Institution Admin (Lender C)',
      subtitle: 'Local private schema & sovereign Lender C credit facilities',
      scope: 'Sovereign Lender C Only (403 on Bank & Insurer)',
      badge: 'Lender C Sovereign'
    },
    {
      id: 'COMPLIANCE_OFFICER',
      role: 'COMPLIANCE_OFFICER',
      username: 'compliance',
      title: 'Compliance Officer',
      subtitle: 'Privacy budget ε, audit ledger verification & case resolution',
      scope: 'Full Compliance Clearance & Case Resolution',
      badge: 'Audit & Compliance'
    },
    {
      id: 'NETWORK_ADMIN',
      role: 'NETWORK_ADMIN',
      username: 'admin',
      title: 'Network Admin',
      subtitle: 'Global topology, Byzantine defense & aggregation rounds',
      scope: 'Full Administrative Clearance & Byzantine Quarantine',
      badge: 'Network Root'
    }
  ];

  const activePersona = demoPersonas.find(p => 
    p.username === currentUser?.username || 
    (p.role === currentRole && (!p.institutionId || p.institutionId === currentUser?.institution_id))
  ) || demoPersonas[0];

  const handleSwitchToPersona = async (persona) => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      if (onPersonaLogin) {
        await onPersonaLogin(persona.username);
      }
      setShowRoleMenu(false);
    } catch (err) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <header style={{
      height: '66px',
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-light)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Brand & Tagline */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--primary-dark)',
            color: 'var(--text-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(18, 55, 42, 0.15)'
          }}>
            <ShieldCheck size={22} color="#8FAF9D" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ 
                fontWeight: 700, 
                fontSize: '1.15rem', 
                letterSpacing: '-0.02em', 
                color: 'var(--primary-dark)' 
              }}>
                TRUSTMESH
              </span>
              <span className="badge badge-demo">
                Synthetic Demonstration
              </span>
            </div>
            <p style={{ 
              fontSize: '0.735rem', 
              color: 'var(--text-secondary)', 
              fontWeight: 500,
              letterSpacing: '0.01em'
            }}>
              Share intelligence. Not customer data.
            </p>
          </div>
        </div>

        {/* Network Status Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '5px 12px',
          backgroundColor: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-light)',
          fontSize: '0.775rem',
          marginLeft: '8px'
        }}>
          <span style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            backgroundColor: backendConnected ? 'var(--success)' : 'var(--warning)',
            display: 'inline-block'
          }} />
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
            {backendConnected ? 'Backend API Active (port 8000)' : '3 Institutions Connected'}
          </span>
          <span style={{ color: 'var(--border-dark)' }}>|</span>
          <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.725rem' }}>
            Round #27
          </span>
        </div>
      </div>

      {/* Action Controls & Role Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Guided 3-Minute Hackathon Demo Button */}
        <button
          onClick={onStartDemoTour}
          className="btn btn-primary btn-sm"
          style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            fontWeight: 600
          }}
          title="Step-by-step 3-minute presentation script"
        >
          <Play size={13} fill="#8FAF9D" stroke="#8FAF9D" />
          <span>3-Min Demo Script</span>
        </button>

        {/* Role & Persona Authenticator */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="btn btn-secondary btn-sm"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              padding: '6px 12px'
            }}
          >
            <Lock size={13} style={{ color: 'var(--secondary-green)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Persona:</span>
            <span style={{ fontWeight: 600, fontSize: '0.775rem', color: 'var(--primary-dark)' }}>{activePersona.title}</span>
            <span style={{ 
              width: '7px', 
              height: '7px', 
              borderRadius: '50%', 
              backgroundColor: currentUser ? 'var(--success)' : 'var(--warning)', 
              display: 'inline-block',
              marginLeft: '2px'
            }} title={currentUser ? "Authenticated with Bearer JWT" : "Anonymous / Connecting"} />
            <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
          </button>

          {showRoleMenu && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '115%',
              width: '360px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 50,
              padding: '12px'
            }}>
              <div style={{ paddingBottom: '8px', borderBottom: '1px solid var(--border-light)', marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                    Authenticated Identity (RBAC)
                  </span>
                  <span className="badge badge-success" style={{ fontSize: '0.62rem' }}>
                    <KeyRound size={9} style={{ marginRight: '3px' }} />
                    HMAC-SHA256 Token
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Logged in as: <strong style={{ color: 'var(--primary-dark)' }}>{currentUser?.username || activePersona.username}</strong> ({activePersona.badge})
                </div>
              </div>

              {authError && (
                <div style={{ padding: '6px 8px', backgroundColor: 'var(--danger-light)', color: 'var(--danger-text)', borderRadius: 'var(--radius-sm)', fontSize: '0.72rem', marginBottom: '8px' }}>
                  {authError}
                </div>
              )}

              <div style={{ maxHeight: '310px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {demoPersonas.map(p => {
                  const isCurrent = (currentUser?.username === p.username) || (activePersona.username === p.username);
                  return (
                    <div 
                      key={p.username}
                      onClick={() => !isAuthenticating && handleSwitchToPersona(p)}
                      style={{
                        padding: '9px 10px',
                        borderRadius: 'var(--radius-sm)',
                        cursor: isAuthenticating ? 'wait' : 'pointer',
                        backgroundColor: isCurrent ? 'var(--sage-light)' : 'var(--bg-subtle)',
                        border: isCurrent ? '1.5px solid var(--secondary-green)' : '1px solid var(--border-light)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                        <span style={{ 
                          fontWeight: 700, 
                          fontSize: '0.785rem', 
                          color: isCurrent ? 'var(--primary-dark)' : 'var(--text-primary)' 
                        }}>
                          {p.title}
                        </span>
                        {isCurrent ? (
                          <span className="badge badge-success" style={{ fontSize: '0.6rem' }}>
                            <CheckCircle2 size={10} style={{ marginRight: '2px' }} />
                            Active Session
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            {p.username}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: '2px 0 4px', lineHeight: 1.3 }}>
                        {p.subtitle}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.66rem', color: 'var(--text-muted)' }}>
                        <span style={{ fontFamily: 'var(--font-mono)' }}>Scope: {p.scope}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {currentUser && onLogout && (
                <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => {
                      onLogout();
                      setShowRoleMenu(false);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.7rem', padding: '4px 8px', color: 'var(--danger-text)' }}
                  >
                    <LogOut size={12} style={{ marginRight: '4px' }} />
                    Clear Session / Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowNotificationMenu(!showNotificationMenu)}
            style={{
              position: 'relative',
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary-dark)',
              backgroundColor: showNotificationMenu ? 'var(--bg-subtle)' : 'var(--bg-surface)'
            }}
          >
            <Bell size={17} />
            {alertCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                backgroundColor: 'var(--danger)',
                color: '#fff',
                borderRadius: '50%',
                fontSize: '0.65rem',
                fontWeight: 700,
                width: '16px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {alertCount}
              </span>
            )}
          </button>

          {showNotificationMenu && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '115%',
              width: '320px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 50,
              padding: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600, fontSize: '0.825rem', color: 'var(--primary-dark)' }}>Network Feed</span>
                <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>Live Stream</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
                {notifications.map(n => (
                  <div key={n.id} style={{
                    padding: '9px 11px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: n.type === 'danger' ? 'var(--danger-light)' : n.type === 'warning' ? 'var(--warning-light)' : 'var(--bg-subtle)',
                    border: '1px solid var(--border-light)',
                    fontSize: '0.75rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, marginBottom: '2px' }}>
                      <span style={{ color: n.type === 'danger' ? 'var(--danger-text)' : n.type === 'warning' ? 'var(--warning-text)' : 'var(--primary-dark)' }}>
                        {n.title}
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.675rem' }}>{n.time}</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.35 }}>{n.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
