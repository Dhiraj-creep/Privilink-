import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Bell, 
  Play, 
  ChevronDown,
  Lock,
  LogOut,
  Check
} from 'lucide-react';

export default function Navbar({ 
  currentRole, 
  currentUser,
  onPersonaLogin,
  onLogout,
  onStartDemoTour, 
  alertCount, 
  notifications,
  backendConnected = false,
  appMode = 'app',
  onToggleAppMode
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
      subtitle: 'Cross-institution case investigations & collaborative explainability',
      scope: 'Global Read / Step-Up KYC Dispatch',
      badge: 'Analyst Clearance'
    },
    {
      id: 'INSTITUTION_ADMIN_BANK',
      role: 'INSTITUTION_ADMIN',
      username: 'bank_admin',
      institutionId: 'BANK_A',
      title: 'Institution Admin (Bank A)',
      subtitle: 'Sovereign Bank A repository only (Blocked from B & C)',
      scope: 'Sovereign Bank A Only (403 on Insurer & Lender)',
      badge: 'Bank A Sovereign'
    },
    {
      id: 'INSTITUTION_ADMIN_INSURER',
      role: 'INSTITUTION_ADMIN',
      username: 'insurer_admin',
      institutionId: 'INSURER_B',
      title: 'Institution Admin (Insurer B)',
      subtitle: 'Sovereign Insurer B repository only (Blocked from A & C)',
      scope: 'Sovereign Insurer B Only (403 on Bank & Lender)',
      badge: 'Insurer B Sovereign'
    },
    {
      id: 'INSTITUTION_ADMIN_LENDER',
      role: 'INSTITUTION_ADMIN',
      username: 'lender_admin',
      institutionId: 'LENDER_C',
      title: 'Institution Admin (Lender C)',
      subtitle: 'Sovereign Lender C repository only (Blocked from A & B)',
      scope: 'Sovereign Lender C Only (403 on Bank & Insurer)',
      badge: 'Lender C Sovereign'
    },
    {
      id: 'COMPLIANCE_OFFICER',
      role: 'COMPLIANCE_OFFICER',
      username: 'compliance',
      title: 'Compliance Officer',
      subtitle: 'Cryptographic audit verification & step-up task resolution',
      scope: 'Full Compliance Clearance & Case Resolution',
      badge: 'Audit & Compliance'
    },
    {
      id: 'NETWORK_ADMIN',
      role: 'NETWORK_ADMIN',
      username: 'admin',
      title: 'Network Admin',
      subtitle: 'Topology orchestration, Byzantine defense & model coordination',
      scope: 'Full Administrative Clearance & Quarantine Control',
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
      height: '64px',
      backgroundColor: '#090D16',
      borderBottom: '1px solid #1E293B',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.25)'
    }}>
      {/* Brand & Federation Overview */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => onToggleAppMode && onToggleAppMode('app')}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '6px',
            backgroundColor: '#0284C7',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 12px rgba(2, 132, 199, 0.35)'
          }}>
            <ShieldCheck size={20} strokeWidth={2.2} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ 
                fontWeight: 700, 
                fontSize: '1.05rem', 
                letterSpacing: '-0.02em', 
                color: '#F8FAFC' 
              }}>
                TRUSTMESH
              </span>
              <span style={{
                fontSize: '0.625rem',
                fontWeight: 600,
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: 'rgba(56, 189, 248, 0.12)',
                color: '#38BDF8',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}>
                Enterprise VFL
              </span>
            </div>
            <p style={{ 
              fontSize: '0.7rem', 
              color: '#94A3B8', 
              letterSpacing: '0.01em',
              lineHeight: 1
            }}>
              Share intelligence. Not customer data.
            </p>
          </div>
        </div>

        {/* Live Network Status Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 10px',
          backgroundColor: '#111827',
          borderRadius: '5px',
          border: '1px solid #1E293B',
          fontSize: '0.75rem'
        }}>
          <span style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            backgroundColor: backendConnected ? '#10B981' : '#F59E0B',
            boxShadow: backendConnected ? '0 0 8px rgba(16, 185, 129, 0.6)' : 'none',
            display: 'inline-block'
          }} />
          <span style={{ color: '#F8FAFC', fontWeight: 500 }}>
            {backendConnected ? 'Coordinator API Online' : 'Local Demo Runtime'}
          </span>
          <span style={{ color: '#475569' }}>•</span>
          <span style={{ color: '#94A3B8', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
            Round #27
          </span>
        </div>
      </div>

      {/* Action Controls & Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* View Mode Switcher (Console vs Product Landing) */}
        {onToggleAppMode && (
          <div style={{
            display: 'flex',
            backgroundColor: '#111827',
            borderRadius: '6px',
            border: '1px solid #1E293B',
            padding: '2px'
          }}>
            <button
              onClick={() => onToggleAppMode('app')}
              style={{
                padding: '4px 10px',
                fontSize: '0.725rem',
                fontWeight: 600,
                borderRadius: '4px',
                color: appMode === 'app' ? '#FFFFFF' : '#94A3B8',
                backgroundColor: appMode === 'app' ? '#0284C7' : 'transparent',
                transition: 'all 0.15s ease'
              }}
            >
              Console
            </button>
            <button
              onClick={() => onToggleAppMode('landing')}
              style={{
                padding: '4px 10px',
                fontSize: '0.725rem',
                fontWeight: 600,
                borderRadius: '4px',
                color: appMode === 'landing' ? '#FFFFFF' : '#94A3B8',
                backgroundColor: appMode === 'landing' ? '#0284C7' : 'transparent',
                transition: 'all 0.15s ease'
              }}
            >
              Overview
            </button>
          </div>
        )}

        {/* Guided 3-Minute Demo Script Button */}
        <button
          onClick={onStartDemoTour}
          style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            fontSize: '0.75rem',
            fontWeight: 600,
            borderRadius: '5px',
            backgroundColor: 'rgba(2, 132, 199, 0.12)',
            color: '#38BDF8',
            border: '1px solid rgba(2, 132, 199, 0.3)',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(2, 132, 199, 0.22)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(2, 132, 199, 0.12)';
          }}
          title="3-minute guided walkthrough for evaluation"
        >
          <Play size={12} fill="#38BDF8" stroke="#38BDF8" />
          <span>Demo Script</span>
        </button>

        {/* Role & Persona Authenticator Dropdown */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '7px',
              padding: '6px 11px',
              backgroundColor: '#111827',
              border: '1px solid #1E293B',
              borderRadius: '5px',
              color: '#F8FAFC',
              fontSize: '0.75rem'
            }}
          >
            <Lock size={12} color="#38BDF8" />
            <span style={{ color: '#94A3B8' }}>Role:</span>
            <span style={{ fontWeight: 600 }}>{activePersona.title}</span>
            <span style={{ 
              width: '6px', 
              height: '6px', 
              borderRadius: '50%', 
              backgroundColor: currentUser ? '#10B981' : '#F59E0B', 
              display: 'inline-block'
            }} />
            <ChevronDown size={12} color="#94A3B8" />
          </button>

          {showRoleMenu && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '115%',
              width: '350px',
              backgroundColor: '#0F172A',
              border: '1px solid #334155',
              borderRadius: '8px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
              zIndex: 50,
              padding: '12px'
            }}>
              <div style={{ paddingBottom: '8px', borderBottom: '1px solid #1E293B', marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.675rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94A3B8' }}>
                    Authenticated Persona (RBAC)
                  </span>
                  <span style={{
                    fontSize: '0.6rem',
                    fontWeight: 600,
                    padding: '2px 6px',
                    borderRadius: '3px',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    color: '#10B981',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                  }}>
                    HMAC-SHA256 Token
                  </span>
                </div>
                <div style={{ fontSize: '0.725rem', color: '#CBD5E1', marginTop: '4px' }}>
                  Active user: <strong style={{ color: '#F8FAFC' }}>{currentUser?.username || activePersona.username}</strong>
                </div>
              </div>

              {authError && (
                <div style={{ padding: '6px 8px', backgroundColor: 'rgba(220, 38, 38, 0.15)', color: '#FCA5A5', border: '1px solid rgba(220, 38, 38, 0.3)', borderRadius: '4px', fontSize: '0.72rem', marginBottom: '8px' }}>
                  {authError}
                </div>
              )}

              <div style={{ maxHeight: '290px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {demoPersonas.map(p => {
                  const isCurrent = (currentUser?.username === p.username) || (activePersona.username === p.username);
                  return (
                    <div 
                      key={p.username}
                      onClick={() => !isAuthenticating && handleSwitchToPersona(p)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '5px',
                        cursor: isAuthenticating ? 'wait' : 'pointer',
                        backgroundColor: isCurrent ? 'rgba(2, 132, 199, 0.15)' : '#111827',
                        border: isCurrent ? '1px solid #0284C7' : '1px solid #1E293B',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ 
                          fontWeight: 600, 
                          fontSize: '0.775rem', 
                          color: isCurrent ? '#38BDF8' : '#F8FAFC' 
                        }}>
                          {p.title}
                        </span>
                        {isCurrent ? (
                          <span style={{ fontSize: '0.625rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Check size={10} /> Active
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.625rem', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
                            {p.username}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.675rem', color: '#94A3B8', margin: '2px 0 3px', lineHeight: 1.3 }}>
                        {p.subtitle}
                      </p>
                      <div style={{ fontSize: '0.625rem', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
                        {p.scope}
                      </div>
                    </div>
                  );
                })}
              </div>

              {currentUser && onLogout && (
                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #1E293B', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => {
                      onLogout();
                      setShowRoleMenu(false);
                    }}
                    style={{ fontSize: '0.7rem', padding: '4px 8px', color: '#F87171', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <LogOut size={11} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notifications Alert Bell */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowNotificationMenu(!showNotificationMenu)}
            style={{
              position: 'relative',
              width: '34px',
              height: '34px',
              borderRadius: '5px',
              border: '1px solid #1E293B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#F8FAFC',
              backgroundColor: showNotificationMenu ? '#1E293B' : '#111827'
            }}
          >
            <Bell size={15} />
            {alertCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                backgroundColor: '#DC2626',
                color: '#fff',
                borderRadius: '50%',
                fontSize: '0.6rem',
                fontWeight: 700,
                width: '15px',
                height: '15px',
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
              backgroundColor: '#0F172A',
              border: '1px solid #334155',
              borderRadius: '8px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
              zIndex: 50,
              padding: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600, fontSize: '0.8rem', color: '#F8FAFC' }}>Network Alert Stream</span>
                <span style={{ fontSize: '0.625rem', color: '#38BDF8', backgroundColor: 'rgba(56, 189, 248, 0.1)', padding: '1px 5px', borderRadius: '3px' }}>Live</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '280px', overflowY: 'auto' }}>
                {notifications.map(n => (
                  <div key={n.id} style={{
                    padding: '8px 10px',
                    borderRadius: '5px',
                    backgroundColor: n.type === 'danger' ? 'rgba(220, 38, 38, 0.1)' : n.type === 'warning' ? 'rgba(217, 119, 6, 0.1)' : '#111827',
                    border: '1px solid #1E293B',
                    fontSize: '0.725rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, marginBottom: '2px' }}>
                      <span style={{ color: n.type === 'danger' ? '#FCA5A5' : n.type === 'warning' ? '#FCD34D' : '#F8FAFC' }}>
                        {n.title}
                      </span>
                      <span style={{ color: '#64748B', fontSize: '0.65rem' }}>{n.time}</span>
                    </div>
                    <p style={{ color: '#94A3B8', lineHeight: 1.35 }}>{n.detail}</p>
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
