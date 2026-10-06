import {
  Bell,
  Play,
  ChevronDown,
  Lock,
  LogOut,
  Search,
  Check,
  Building,
  KeyRound
} from 'lucide-react';
import { Badge } from './ui/Badge';

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
  searchTerm = '',
  onSearchChange
}) {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Keyboard shortcut Ctrl+K focus on search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('tm-global-search');
        if (searchInput) searchInput.focus();
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
      subtitle: 'Cross-institution case investigations & collaborative explainability HUD',
      scope: 'Global Read / Step-Up KYC Dispatch',
      badge: 'Analyst Clearance'
    },
    {
      id: 'INSTITUTION_ADMIN_BANK',
      role: 'INSTITUTION_ADMIN',
      username: 'bank_admin',
      institutionId: 'BANK_A',
      title: 'Institution Admin (Bank A)',
      subtitle: 'Sovereign Bank A customer repository only (HTTP 403 on Insurer & Lender)',
      scope: 'Sovereign Bank A Only',
      badge: 'Bank A Sovereign'
    },
    {
      id: 'INSTITUTION_ADMIN_INSURER',
      role: 'INSTITUTION_ADMIN',
      username: 'insurer_admin',
      institutionId: 'INSURER_B',
      title: 'Institution Admin (Insurer B)',
      subtitle: 'Sovereign Insurer B policy repository only (HTTP 403 on Bank & Lender)',
      scope: 'Sovereign Insurer B Only',
      badge: 'Insurer B Sovereign'
    },
    {
      id: 'INSTITUTION_ADMIN_LENDER',
      role: 'INSTITUTION_ADMIN',
      username: 'lender_admin',
      institutionId: 'LENDER_C',
      title: 'Institution Admin (Lender C)',
      subtitle: 'Sovereign Lender C credit repository only (HTTP 403 on Bank & Insurer)',
      scope: 'Sovereign Lender C Only',
      badge: 'Lender C Sovereign'
    },
    {
      id: 'COMPLIANCE_OFFICER',
      role: 'COMPLIANCE_OFFICER',
      username: 'compliance',
      title: 'Compliance Officer',
      subtitle: 'Cryptographic audit verification, privacy budgets & case resolution clearance',
      scope: 'Full Compliance & Case Clearance',
      badge: 'Compliance Officer'
    },
    {
      id: 'NETWORK_ADMIN',
      role: 'NETWORK_ADMIN',
      username: 'admin',
      title: 'Network Admin',
      subtitle: 'Global topology, Byzantine defense, SecAgg orchestrations & participant quarantine',
      scope: 'Full Administrative Clearance',
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

  const getTabBreadcrumb = () => {
    switch (currentTab) {
      case 'overview':
        return 'Overview Dashboard';
      case 'collaborative_risk':
        return 'Collaborative Risk Cases';
      case 'customer_investigation':
        return 'Case Investigation';
      case 'institutions':
        return 'Institution Network';
      case 'model_collaboration':
        return 'Model Collaboration';
      case 'privacy_center':
        return 'Differential Privacy';
      case 'audit_trail':
        return 'Cryptographic Audit';
      case 'simulation_lab':
        return 'Simulation Lab';
      case 'secure_aggregation':
        return 'Secure Aggregation Lab';
      case 'entity_resolution':
        return 'Private Entity PSI';
      case 'trust_security':
        return 'Trust & Security';
      case 'architecture_scope':
        return 'Architecture & Scope';
      default:
        return 'Dashboard';
    }
  };

  return (
    <header
      className="tm-topbar"
      style={{
        height: '56px',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-default)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        gap: '16px'
      }}
    >
      {/* Left: Breadcrumbs & Node Label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
        {/* Breadcrumb Hierarchy */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: 'var(--text-sm)',
            whiteSpace: 'nowrap'
          }}
        >
          <span style={{ color: 'var(--text-muted)' }}>TrustMesh</span>
          <span style={{ color: 'var(--border-default)' }}>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{getTabBreadcrumb()}</span>
        </div>

        {/* Institution / Node Label */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '2px 8px',
            borderRadius: 'var(--radius-xs)',
            backgroundColor: 'var(--bg-surface-raised)',
            border: '1px solid var(--border-default)',
            fontSize: 'var(--text-xs)',
            color: 'var(--text-secondary)'
          }}
        >
          <Building size={11} color="var(--primary-hover)" />
          <span style={{ fontWeight: 500 }}>
            {currentUser?.institution_id
              ? `${currentUser.institution_id} Node`
              : backendConnected
              ? 'Coordinator Node (Port 8000)'
              : 'Coordinator Node (Local Runtime)'}
          </span>
        </div>
      </div>

      {/* Center: Global Search with Ctrl+K */}
      <div style={{ flex: 1, maxWidth: '380px', position: 'relative' }}>
        <Search
          size={14}
          style={{
            position: 'absolute',
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
            pointerEvents: 'none'
          }}
        />
        <input
          id="tm-global-search"
          type="text"
          placeholder="Search entities, cases, hashes..."
          value={searchTerm}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          style={{
            width: '100%',
            height: '32px',
            paddingLeft: '32px',
            paddingRight: '60px',
            fontSize: 'var(--text-sm)',
            backgroundColor: 'var(--bg-app)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)'
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            padding: '1px 5px',
            borderRadius: 'var(--radius-xs)',
            backgroundColor: 'var(--bg-surface-raised)',
            border: '1px solid var(--border-default)',
            fontSize: '10px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
            pointerEvents: 'none'
          }}
        >
          <span>Ctrl</span>
          <span>K</span>
        </div>
      </div>

      {/* Right Controls: Privacy Posture Pill + Role Switcher + Tour + Alerts + User */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        {/* Persistent Privacy Posture Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            padding: '4px 10px',
            backgroundColor: 'rgba(34, 197, 94, 0.08)',
            border: '1px solid rgba(34, 197, 94, 0.25)',
            borderRadius: 'var(--radius-full)',
            fontSize: 'var(--text-xs)',
            fontWeight: 500,
            color: 'var(--text-primary)'
          }}
        >
          <Lock size={12} color="var(--success)" />
          <span>Raw data never leaves this node</span>
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--success)',
              boxShadow: '0 0 6px var(--success)',
              display: 'inline-block'
            }}
          />
        </div>

        {/* 3-Min Script Button */}
        {onStartDemoTour && (
          <button
            onClick={onStartDemoTour}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              height: '30px',
              padding: '0 10px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--primary-subtle)',
              color: 'var(--primary-hover)',
              border: '1px solid var(--primary-border)',
              fontSize: 'var(--text-xs)',
              fontWeight: 600
            }}
            title="Launch 3-minute hackathon pitch script"
          >
            <Play size={11} fill="currentColor" />
            <span>Script</span>
          </button>
        )}

        {/* Role Switcher Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setShowRoleMenu(!showRoleMenu);
              setShowNotificationMenu(false);
              setShowUserMenu(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              height: '32px',
              padding: '0 10px',
              backgroundColor: 'var(--bg-surface-raised)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              fontSize: 'var(--text-xs)'
            }}
          >
            <KeyRound size={12} color="var(--primary-hover)" />
            <span style={{ color: 'var(--text-muted)' }}>Role:</span>
            <Badge variant="primary" size="sm">
              {activePersona.title}
            </Badge>
            <ChevronDown size={12} color="var(--text-muted)" />
          </button>

          {showRoleMenu && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 6px)',
                width: '360px',
                backgroundColor: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 60,
                padding: '12px',
                animation: 'fadeIn var(--transition-fast)'
              }}
            >
              <div
                style={{
                  paddingBottom: '8px',
                  borderBottom: '1px solid var(--border-default)',
                  marginBottom: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 'var(--text-xs)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: 'var(--text-muted)'
                    }}
                  >
                    Role-Based Access Control (RBAC)
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Active Identity: <strong style={{ color: 'var(--text-primary)' }}>{currentUser?.username || activePersona.username}</strong>
                  </div>
                </div>
                <Badge variant="success" size="sm">
                  HMAC Session
                </Badge>
              </div>

              {authError && (
                <div
                  style={{
                    padding: '6px 8px',
                    backgroundColor: 'var(--danger-subtle)',
                    color: 'var(--danger)',
                    border: '1px solid var(--danger-border)',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: 'var(--text-xs)',
                    marginBottom: '8px'
                  }}
                >
                  {authError}
                </div>
              )}

              <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {demoPersonas.map((p) => {
                  const isCurrent =
                    currentUser?.username === p.username || activePersona.username === p.username;
                  return (
                    <div
                      key={p.username}
                      onClick={() => !isAuthenticating && handleSwitchToPersona(p)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-sm)',
                        cursor: isAuthenticating ? 'wait' : 'pointer',
                        backgroundColor: isCurrent ? 'var(--primary-subtle)' : 'transparent',
                        border: isCurrent ? '1px solid var(--primary)' : '1px solid transparent',
                        transition: 'all var(--transition-fast)'
                      }}
                      onMouseEnter={(e) => {
                        if (!isCurrent) {
                          e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isCurrent) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span
                          style={{
                            fontWeight: 600,
                            fontSize: 'var(--text-sm)',
                            color: isCurrent ? 'var(--primary-hover)' : 'var(--text-primary)'
                          }}
                        >
                          {p.title}
                        </span>
                        {isCurrent ? (
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <Check size={11} strokeWidth={2.4} /> Active
                          </span>
                        ) : (
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            {p.username}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: '2px 0', lineHeight: 1.3 }}>
                        {p.subtitle}
                      </p>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        Scope: {p.scope}
                      </div>
                    </div>
                  );
                })}
              </div>

              {currentUser && onLogout && (
                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-default)', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => {
                      onLogout();
                      setShowRoleMenu(false);
                    }}
                    style={{
                      fontSize: 'var(--text-xs)',
                      padding: '4px 8px',
                      color: 'var(--danger)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      borderRadius: 'var(--radius-xs)'
                    }}
                  >
                    <LogOut size={12} />
                    Sign Out Session
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setShowNotificationMenu(!showNotificationMenu);
              setShowRoleMenu(false);
              setShowUserMenu(false);
            }}
            style={{
              position: 'relative',
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-default)',
              backgroundColor: showNotificationMenu ? 'var(--bg-surface-hover)' : 'var(--bg-surface-raised)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)'
            }}
            title="Network Alerts"
          >
            <Bell size={15} />
            {alertCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                  backgroundColor: 'var(--danger)',
                  color: '#FFFFFF',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '9px',
                  fontWeight: 700,
                  width: '14px',
                  height: '14px',
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
                top: 'calc(100% + 6px)',
                width: '320px',
                backgroundColor: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 60,
                padding: '12px',
                animation: 'fadeIn var(--transition-fast)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                  Network Alerts
                </span>
                <Badge variant="cyan" size="sm">
                  Live Stream
                </Badge>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '280px', overflowY: 'auto' }}>
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor:
                        n.type === 'danger'
                          ? 'var(--danger-subtle)'
                          : n.type === 'warning'
                          ? 'var(--warning-subtle)'
                          : 'var(--bg-surface)',
                      border: '1px solid var(--border-default)',
                      fontSize: 'var(--text-xs)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, marginBottom: '2px' }}>
                      <span
                        style={{
                          color:
                            n.type === 'danger'
                              ? 'var(--danger)'
                              : n.type === 'warning'
                              ? 'var(--warning)'
                              : 'var(--text-primary)'
                        }}
                      >
                        {n.title}
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{n.time}</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.35, margin: 0 }}>{n.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar Menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowRoleMenu(false);
              setShowNotificationMenu(false);
            }}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--primary-subtle)',
              border: '1px solid var(--primary-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary-hover)',
              fontWeight: 600,
              fontSize: 'var(--text-xs)'
            }}
            title={currentUser?.username || 'User Session'}
          >
            {(currentUser?.username || 'A')[0].toUpperCase()}
          </button>

          {showUserMenu && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 6px)',
                width: '220px',
                backgroundColor: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 60,
                padding: '10px',
                animation: 'fadeIn var(--transition-fast)'
              }}
            >
              <div style={{ paddingBottom: '8px', borderBottom: '1px solid var(--border-default)', marginBottom: '6px' }}>
                <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                  {currentUser?.username || activePersona.username}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  {activePersona.badge}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: 'var(--text-xs)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: 'var(--text-secondary)' }}>
                  <span>Node:</span>
                  <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                    {currentUser?.institution_id || 'Coordinator'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: 'var(--text-secondary)' }}>
                  <span>Status:</span>
                  <span style={{ color: 'var(--success)' }}>Authenticated</span>
                </div>
              </div>

              {currentUser && onLogout && (
                <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid var(--border-default)' }}>
                  <button
                    onClick={() => {
                      onLogout();
                      setShowUserMenu(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 8px',
                      color: 'var(--danger)',
                      fontSize: 'var(--text-xs)',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--danger-subtle)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <LogOut size={12} />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
