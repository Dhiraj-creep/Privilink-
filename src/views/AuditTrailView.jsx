import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Lock, 
  Copy,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  FlaskConical,
  Database
} from 'lucide-react';
import { INITIAL_AUDIT_LOGS } from '../data/syntheticData';
import { api } from '../api/client';

export default function AuditTrailView({ dynamicLogs = [] }) {
  const [auditMode, setAuditMode] = useState('operational'); // 'operational' | 'sandbox'
  const [filterInst, setFilterInst] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedHash, setCopiedHash] = useState(null);
  const [backendLogs, setBackendLogs] = useState([]);
  const [sandboxLogs, setSandboxLogs] = useState([]);
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [tamperedState, setTamperedState] = useState(false);

  const fetchLogs = (mode = auditMode) => {
    if (mode === 'operational') {
      api.getAuditLogs()
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            const formatted = data.map(l => ({
              id: l.event_id,
              timestamp: l.timestamp.includes('T') ? l.timestamp.split('T')[1].split('.')[0] : l.timestamp,
              date: l.timestamp.includes('T') ? l.timestamp.split('T')[0] : '2026-09-26',
              event: l.details || l.action,
              institution: l.institution,
              privacyStatus: l.privacy_status,
              result: l.result,
              hash: l.hash ? `${l.hash.slice(0, 6)}...${l.hash.slice(-4)}` : '0x...',
              fullHash: l.hash,
              prevHash: l.prev_hash
            }));
            setBackendLogs(formatted);
          }
        })
        .catch(() => {});
    } else {
      api.getSandboxLogs()
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            const formatted = data.map(l => ({
              id: l.event_id,
              timestamp: l.timestamp.includes('T') ? l.timestamp.split('T')[1].split('.')[0] : l.timestamp,
              date: l.timestamp.includes('T') ? l.timestamp.split('T')[0] : '2026-09-26',
              event: l.details || l.action,
              institution: l.institution,
              privacyStatus: l.privacy_status,
              result: l.result,
              hash: l.hash ? `${l.hash.slice(0, 6)}...${l.hash.slice(-4)}` : '0x...',
              fullHash: l.hash,
              prevHash: l.prev_hash
            }));
            setSandboxLogs(formatted);
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
    const matchesInst = filterInst === 'ALL' || log.institution.includes(filterInst);
    const matchesSearch = log.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.result.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesInst && matchesSearch;
  });

  const handleCopy = (hash) => {
    navigator.clipboard?.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 1500);
  };

  const handleVerifyChain = async () => {
    setIsVerifying(true);
    try {
      const res = auditMode === 'operational' 
        ? await api.verifyAuditChain() 
        : await api.verifySandboxAudit();
      setVerificationResult(res);
    } catch (err) {
      setVerificationResult({
        valid: false,
        broken_index: null,
        error: `Verification Request Failed: ${err.message}`,
        message: 'Cryptographic chain verification could not complete.'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSimulateTamper = async () => {
    try {
      if (auditMode !== 'sandbox') {
        setAuditMode('sandbox');
      }
      await api.simulateSandboxTamper(1);
      setTamperedState(true);
      fetchLogs('sandbox');
      const res = await api.verifySandboxAudit();
      setVerificationResult(res);
    } catch (err) {
      setVerificationResult({
        valid: false,
        broken_index: null,
        error: `Tampering Simulation Blocked: ${err.message}. Switch persona to Compliance Officer or Network Admin.`
      });
    }
  };

  const handleResetSandbox = async () => {
    try {
      await api.resetSandboxAudit();
      setTamperedState(false);
      fetchLogs('sandbox');
      const res = await api.verifySandboxAudit();
      setVerificationResult(res);
    } catch (err) {
      setVerificationResult({
        valid: false,
        broken_index: null,
        error: `Reset failed: ${err.message}`
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Title & Mode Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
              Cryptographic Audit Trail & Compliance Ledger
            </h1>
            <span className={`badge ${auditMode === 'operational' ? 'badge-success' : 'badge-warning'}`}>
              {auditMode === 'operational' ? 'Operational SHA-256 Chain' : 'Disposable Sandbox Lab'}
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {auditMode === 'operational' 
              ? 'Real-time immutable ledger of operational system events. Every block is bound by 64-char SHA-256 hashes.' 
              : 'Isolated evaluator sandbox. Deliberately modify blocks to prove that hash chain severing is mathematically detected without corrupting live operational history.'}
          </p>
        </div>

        {/* Ledger Mode Selector & Actions */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--bg-subtle)',
            padding: '3px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-light)'
          }}>
            <button
              onClick={() => {
                setAuditMode('operational');
                setVerificationResult(null);
                setTamperedState(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 11px',
                fontSize: '0.735rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: auditMode === 'operational' ? 'var(--primary-dark)' : 'transparent',
                color: auditMode === 'operational' ? '#FCFBF7' : 'var(--text-secondary)',
                transition: 'all 0.15s ease'
              }}
            >
              <Database size={12} />
              <span>Operational Ledger</span>
            </button>
            <button
              onClick={() => {
                setAuditMode('sandbox');
                setVerificationResult(null);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 11px',
                fontSize: '0.735rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: auditMode === 'sandbox' ? 'var(--primary-dark)' : 'transparent',
                color: auditMode === 'sandbox' ? '#FCFBF7' : 'var(--text-secondary)',
                transition: 'all 0.15s ease'
              }}
            >
              <FlaskConical size={12} />
              <span>Tamper Sandbox Lab</span>
            </button>
          </div>

          <button
            onClick={handleVerifyChain}
            disabled={isVerifying}
            className="btn btn-primary btn-sm"
          >
            <ShieldCheck size={14} />
            <span>{isVerifying ? 'Verifying Chain...' : `Verify ${auditMode === 'operational' ? 'Ledger' : 'Sandbox'}`}</span>
          </button>

          {auditMode === 'sandbox' ? (
            !tamperedState ? (
              <button
                onClick={handleSimulateTamper}
                className="btn btn-secondary btn-sm"
                title="Deliberately modifies an event in sandbox to demonstrate tamper detection"
              >
                <AlertTriangle size={13} color="var(--warning-text)" />
                <span>Simulate Sandbox Tampering</span>
              </button>
            ) : (
              <button
                onClick={handleResetSandbox}
                className="btn btn-secondary btn-sm"
              >
                <RotateCcw size={13} />
                <span>Reset Sandbox Snapshot</span>
              </button>
            )
          ) : (
            <button
              onClick={handleSimulateTamper}
              className="btn btn-secondary btn-sm"
              title="Switches to sandbox and demonstrates cryptographic break"
            >
              <AlertTriangle size={13} color="var(--warning-text)" />
              <span>Simulate Tampering (Sandbox)</span>
            </button>
          )}
        </div>
      </div>

      {/* Mode Information Callout */}
      {auditMode === 'sandbox' && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgba(217, 119, 6, 0.08)',
          border: '1px solid rgba(217, 119, 6, 0.25)',
          fontSize: '0.765rem',
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <FlaskConical size={16} color="var(--warning-text)" style={{ flexShrink: 0 }} />
          <div>
            <strong>Disposable Evaluation Sandbox:</strong> Modifications here demonstrate cryptographic hash chain failure without altering permanent operational records.
          </div>
        </div>
      )}

      {/* Verification Result Banner */}
      {verificationResult && (
        <div style={{
          padding: '14px 18px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: verificationResult.valid ? 'var(--success-light)' : 'var(--danger-light)',
          border: verificationResult.valid ? '1px solid var(--success-border)' : '1px solid var(--danger-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.825rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {verificationResult.valid ? (
              <ShieldCheck size={20} color="var(--success)" />
            ) : (
              <AlertTriangle size={20} color="var(--danger)" />
            )}
            <div>
              <strong style={{ color: verificationResult.valid ? 'var(--success-text)' : 'var(--danger-text)' }}>
                {verificationResult.valid 
                  ? (auditMode === 'operational' ? 'OPERATIONAL CRYPTOGRAPHIC AUDIT INTEGRITY CONFIRMED' : 'SANDBOX LEDGER INTEGRITY VERIFIED')
                  : 'CRYPTOGRAPHIC TAMPERING DETECTED!'}
              </strong>
              <p style={{ color: verificationResult.valid ? 'var(--success-text)' : 'var(--danger-text)', fontSize: '0.765rem', marginTop: '2px' }}>
                {verificationResult.message || verificationResult.error}
              </p>
            </div>
          </div>
          <span style={{ fontSize: '0.725rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
            Verified {activeRawLogs.length} Blocks
          </span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '16px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ position: 'relative', width: '270px' }}>
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-muted)' }} />
              <input 
                type="text"
                placeholder="Search audit events, results..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 34px',
                  fontSize: '0.785rem',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-sm)',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.775rem' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Node:</span>
              {['ALL', 'BANK', 'INSURER', 'LENDER', 'TRUSTMESH'].map(inst => (
                <button
                  key={inst}
                  onClick={() => setFilterInst(inst)}
                  className={`btn btn-sm ${filterInst === inst ? 'btn-primary' : 'btn-outline'}`}
                  style={{ padding: '4px 10px', fontSize: '0.725rem' }}
                >
                  {inst}
                </button>
              ))}
            </div>
          </div>

          <div style={{ fontSize: '0.765rem', color: 'var(--text-secondary)' }}>
            Showing <strong>{filteredLogs.length}</strong> audited events ({auditMode})
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
            <thead style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-light)' }}>
              <tr>
                <th style={{ padding: '13px 18px', fontWeight: 600 }}>Timestamp</th>
                <th style={{ padding: '13px 18px', fontWeight: 600 }}>Event Description</th>
                <th style={{ padding: '13px 18px', fontWeight: 600 }}>Originating Node</th>
                <th style={{ padding: '13px 18px', fontWeight: 600 }}>Privacy Status</th>
                <th style={{ padding: '13px 18px', fontWeight: 600 }}>Verification Result</th>
                <th style={{ padding: '13px 18px', fontWeight: 600 }}>Integrity Hash (SHA-256)</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, idx) => {
                const isFlagged = log.result.includes('Flagged') || log.result.includes('Anomalous') || log.result.includes('Quarantined');
                const isTampered = log.event.includes('UNAUTHORIZED') || log.event.includes('MALICIOUS');
                return (
                  <tr key={idx} style={{ 
                    borderBottom: '1px solid var(--border-light)',
                    backgroundColor: isTampered ? 'rgba(182, 74, 69, 0.06)' : 'transparent'
                  }}>
                    <td style={{ padding: '13px 18px', fontFamily: 'var(--font-mono)', fontSize: '0.765rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--primary-dark)' }}>{log.timestamp}</span>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.675rem' }}>{log.date || '2026-09-26'}</div>
                    </td>

                    <td style={{ padding: '13px 18px', fontWeight: 500, color: isTampered ? 'var(--danger-text)' : 'var(--text-primary)' }}>
                      {log.event}
                      {isTampered && (
                        <span className="badge badge-danger" style={{ marginLeft: '8px', fontSize: '0.62rem' }}>
                          TAMPERED PAYLOAD
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '13px 18px', fontSize: '0.775rem' }}>
                      <span style={{
                        padding: '3px 9px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-subtle)',
                        border: '1px solid var(--border-light)',
                        fontWeight: 600,
                        color: 'var(--primary-dark)'
                      }}>
                        {log.institution}
                      </span>
                    </td>

                    <td style={{ padding: '13px 18px' }}>
                      <span className="badge badge-success" style={{ gap: '4px' }}>
                        <Lock size={10} />
                        {log.privacyStatus}
                      </span>
                    </td>

                    <td style={{ padding: '13px 18px' }}>
                      <span className={`badge ${isFlagged || isTampered ? 'badge-warning' : 'badge-success'}`}>
                        {log.result}
                      </span>
                    </td>

                    <td style={{ padding: '13px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <code style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.715rem',
                          backgroundColor: 'var(--bg-subtle)',
                          padding: '3px 7px',
                          borderRadius: '4px',
                          color: 'var(--text-primary)',
                          border: isTampered ? '1px solid var(--danger-border)' : '1px solid var(--border-light)'
                        }}>
                          {log.hash}
                        </code>
                        <button
                          onClick={() => handleCopy(log.fullHash)}
                          title="Copy Full 64-character SHA-256 Hash"
                          style={{
                            padding: '3px',
                            color: copiedHash === log.fullHash ? 'var(--success)' : 'var(--text-muted)',
                            cursor: 'pointer',
                            background: 'none',
                            border: 'none'
                          }}
                        >
                          <Copy size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scope Disclaimer on Audit Chain */}
      <div style={{
        padding: '14px 18px',
        backgroundColor: 'var(--bg-subtle)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-light)',
        fontSize: '0.735rem',
        color: 'var(--text-secondary)'
      }}>
        <strong>Regulatory Notice:</strong> The SHA-256 audit ledger provides cryptographic tamper-evidence. Each block commits to the hash of the preceding event. A cryptographic hash chain alone does not prevent a privileged administrative actor from rewriting an entire database; in production, block hashes are committed periodically to an external decentralized timestamping authority or read-only WORM storage.
      </div>
    </div>
  );
}
