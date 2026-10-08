import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Copy,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  FlaskConical,
  Database,
  CheckCircle2,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { INITIAL_AUDIT_LOGS } from '../data/syntheticData';
import { api } from '../api/client';
import { shortenHash, formatDateTime } from '../utils/formatters';

export default function AuditTrailView({ dynamicLogs = [] }) {
  const [auditMode, setAuditMode] = useState('operational'); // 'operational' | 'sandbox'
  const [filterInst, setFilterInst] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedHash, setCopiedHash] = useState(null);
  const [backendLogs, setBackendLogs] = useState([]);
  const [sandboxLogs, setSandboxLogs] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [tamperedState, setTamperedState] = useState(false);

  const fetchLogs = (mode = auditMode) => {
    if (mode === 'operational') {
      api.getAuditLogs()
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setBackendLogs(data);
          }
        })
        .catch(() => {});
    } else {
      api.getSandboxLogs()
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setSandboxLogs(data);
          }
        })
        .catch(() => {});
    }
  };

  useEffect(() => {
    fetchLogs(auditMode);
  }, [auditMode]);

  const activeRawLogs = auditMode === 'operational' 
    ? (backendLogs.length > 0 ? backendLogs : [...dynamicLogs, ...INITIAL_AUDIT_LOGS])
    : (sandboxLogs.length > 0 ? sandboxLogs : backendLogs.slice(0, 5));

  const filteredLogs = activeRawLogs.filter(log => {
    const inst = log.institution || '';
    const matchesInst = filterInst === 'ALL' || inst.includes(filterInst);
    const s = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm ||
      (log.event_id || log.id || '').toLowerCase().includes(s) ||
      (log.action || log.event || '').toLowerCase().includes(s) ||
      (log.details || '').toLowerCase().includes(s) ||
      (log.actor || '').toLowerCase().includes(s) ||
      (log.hash || '').toLowerCase().includes(s);

    return matchesInst && matchesSearch;
  });

  const handleCopy = (hash) => {
    navigator.clipboard?.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 1500);
  };

  const handleVerifyChain = async () => {
    setIsVerifying(true);
    setVerificationResult(null);
    try {
      const res = auditMode === 'operational' 
        ? await api.verifyAuditChain() 
        : await api.verifySandboxAudit();
      setVerificationResult(res);
    } catch (err) {
      setVerificationResult({
        valid: false,
        unavailable: true,
        error: err.message || 'Audit verification endpoint unreachable. Cannot verify chain state.'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleTamperSandbox = async () => {
    try {
      await api.tamperSandboxAudit();
      setTamperedState(true);
      fetchLogs('sandbox');
      handleVerifyChain();
    } catch (err) {
      console.error('Tamper injection failed', err);
    }
  };

  const handleResetSandbox = async () => {
    try {
      await api.resetSandboxAudit();
      setTamperedState(false);
      setVerificationResult(null);
      fetchLogs('sandbox');
    } catch (err) {
      console.error('Sandbox reset failed', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Page Header */}
      <div className="tm-page-header">
        <div>
          <h1 className="tm-page-title">Tamper-Evident SHA-256 Audit Ledger</h1>
          <p className="tm-page-desc">
            Canonical sorted UTF-8 JSON serialization cryptographically linked to the previous block from Genesis.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Button
            variant="primary"
            onClick={handleVerifyChain}
            loading={isVerifying}
            icon={<ShieldCheck size={14} />}
          >
            Verify Chain Integrity
          </Button>
        </div>
      </div>

      {/* Verification Result Banner (if run) */}
      {verificationResult && (
        <div style={{
          padding: '16px 20px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: verificationResult.valid
            ? 'var(--status-success-subtle)'
            : (verificationResult.unavailable ? 'var(--status-warning-subtle)' : 'var(--status-danger-subtle)'),
          border: `1.5px solid ${
            verificationResult.valid
              ? 'var(--status-success-border)'
              : (verificationResult.unavailable ? 'var(--status-warning-border)' : 'var(--status-danger-border)')
          }`,
          color: verificationResult.valid
            ? 'var(--status-success-text)'
            : (verificationResult.unavailable ? 'var(--status-warning-text)' : 'var(--status-danger-text)'),
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            {verificationResult.valid ? (
              <CheckCircle2 size={20} color="var(--status-success)" style={{ flexShrink: 0, marginTop: '2px' }} />
            ) : verificationResult.unavailable ? (
              <AlertTriangle size={20} color="var(--status-warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
            ) : (
              <AlertTriangle size={20} color="var(--status-danger)" style={{ flexShrink: 0, marginTop: '2px' }} />
            )}
            <div>
              <strong style={{ fontSize: '14px' }}>
                {verificationResult.valid
                  ? `All ${verificationResult.total_events || activeRawLogs.length} Blocks Cryptographically Verified`
                  : (verificationResult.unavailable
                    ? 'Verification Service Unavailable (Backend Disconnected)'
                    : 'Cryptographic Chain Broken (Tamper Detected)')}
              </strong>
              <p style={{ fontSize: '12px', marginTop: '2px', lineHeight: 1.45 }}>
                {verificationResult.valid
                  ? `Every linked block from Genesis (Block #0) to Head matches its canonical SHA-256 hash. Zero unauthorized modifications detected across ${verificationResult.total_events || activeRawLogs.length} events.`
                  : (verificationResult.unavailable
                    ? (verificationResult.error || 'The cryptographic verification endpoint is currently unreachable. Ledger state cannot be validated.')
                    : (verificationResult.error || `Hash severance detected at Block #${verificationResult.broken_index}. Subsequent SHA-256 signatures invalid.`))}
              </p>
            </div>
          </div>
          <button
            onClick={() => setVerificationResult(null)}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 'bold' }}
            aria-label="Dismiss verification banner"
          >
            ✕
          </button>
        </div>
      )}

      {/* Mode Switcher: Operational vs Sandbox */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div className="tm-tabs-nav">
          <button
            onClick={() => { setAuditMode('operational'); setVerificationResult(null); }}
            className={`tm-tab-button ${auditMode === 'operational' ? 'active' : ''}`}
          >
            <Database size={12} style={{ display: 'inline', marginRight: '5px' }} />
            Live Operational Ledger
          </button>
          <button
            onClick={() => { setAuditMode('sandbox'); setVerificationResult(null); }}
            className={`tm-tab-button ${auditMode === 'sandbox' ? 'active' : ''}`}
          >
            <FlaskConical size={12} style={{ display: 'inline', marginRight: '5px' }} />
            Tamper Sandbox Lab
          </button>
        </div>

        {auditMode === 'sandbox' && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              variant="danger"
              size="sm"
              onClick={handleTamperSandbox}
              disabled={tamperedState}
            >
              Simulate Tamper Attack (Block #1)
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleResetSandbox}
              icon={<RotateCcw size={12} />}
            >
              Reset Sandbox
            </Button>
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <Card style={{ padding: '14px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search event ID, action, actor, hash..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', paddingLeft: '32px', height: '34px', fontSize: '12px' }}
              />
            </div>

            <select
              value={filterInst}
              onChange={(e) => setFilterInst(e.target.value)}
              style={{ height: '34px', fontSize: '12px' }}
            >
              <option value="ALL">All Institutions</option>
              <option value="Bank">Bank A Only</option>
              <option value="Insurer">Insurer B Only</option>
              <option value="Lender">Lender C Only</option>
              <option value="Network">PriviLink Network</option>
            </select>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Showing <strong>{filteredLogs.length}</strong> chained events
          </div>
        </div>
      </Card>

      {/* Chained Events Table */}
      <Card style={{ padding: 0 }}>
        <div className="tm-table-container" style={{ border: 'none' }}>
          <table className="tm-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}></th>
                <th>Block ID</th>
                <th>Timestamp</th>
                <th>Actor / Role</th>
                <th>Action & Target</th>
                <th>Institution</th>
                <th>SHA-256 Hash</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, index) => {
                const eventId = log.event_id || log.id || `LOG-${index}`;
                const fullHash = log.fullHash || log.hash || '—';
                const isExpanded = expandedRow === eventId;

                return (
                  <React.Fragment key={eventId}>
                    <tr
                      style={{ cursor: 'pointer', backgroundColor: isExpanded ? 'var(--bg-subtle)' : undefined }}
                      onClick={() => setExpandedRow(isExpanded ? null : eventId)}
                    >
                      <td>
                        {isExpanded ? <ChevronDown size={14} color="var(--primary)" /> : <ChevronRight size={14} color="var(--text-muted)" />}
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                        {eventId}
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {formatDateTime(log.timestamp)}
                      </td>
                      <td>
                        <strong style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{log.actor || 'SYSTEM'}</strong>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{log.role || 'CORE'}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {log.action || log.event || 'OPERATION'}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {log.details || log.target_id || ''}
                        </div>
                      </td>
                      <td>
                        <Badge variant="teal" size="sm">
                          {log.institution ? (log.institution.includes('Bank') ? 'Bank A' : (log.institution.includes('Insurer') ? 'Insurer B' : (log.institution.includes('Lender') ? 'Lender C' : 'Network'))) : 'Network'}
                        </Badge>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <code style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                            {shortenHash(fullHash, 6, 4)}
                          </code>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(fullHash);
                            }}
                            title="Copy full 64-char SHA-256 hash"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedHash === fullHash ? 'var(--status-success)' : 'var(--text-muted)', padding: '2px' }}
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                      </td>
                      <td>
                        <Badge variant={log.result === 'Success' || !log.result?.includes('Quarantined') ? 'success' : 'danger'} size="sm">
                          {log.result || 'Success'}
                        </Badge>
                      </td>
                    </tr>

                    {/* Expandable Row: Canonical JSON Payload & Prev Hash */}
                    {isExpanded && (
                      <tr style={{ backgroundColor: 'var(--bg-subtle)' }}>
                        <td colSpan={8} style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-default)' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                Cryptographic Chaining Details
                              </span>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                SHA-256 Digest (64 Hex Characters)
                              </span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '10px' }}>
                              <div style={{ padding: '10px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>PREVIOUS BLOCK HASH (prev_hash):</div>
                                <code style={{ fontSize: '11px', wordBreak: 'break-all', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                                  {log.prev_hash || log.prevHash || '0000000000000000000000000000000000000000000000000000000000000000'}
                                </code>
                              </div>

                              <div style={{ padding: '10px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>CURRENT BLOCK HASH (hash):</div>
                                <code style={{ fontSize: '11px', wordBreak: 'break-all', color: 'var(--primary)', display: 'block', marginTop: '2px' }}>
                                  {fullHash}
                                </code>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
