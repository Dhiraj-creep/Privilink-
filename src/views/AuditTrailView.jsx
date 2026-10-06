import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Lock, 
  Copy,
  ShieldCheck,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { INITIAL_AUDIT_LOGS } from '../data/syntheticData';
import { api } from '../api/client';

export default function AuditTrailView({ dynamicLogs = [] }) {
  const [filterInst, setFilterInst] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedHash, setCopiedHash] = useState(null);
  const [backendLogs, setBackendLogs] = useState([]);
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [tamperedState, setTamperedState] = useState(false);

  const fetchLogs = () => {
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
      .catch(() => {
        // Fallback to static
      });
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const allLogs = backendLogs.length > 0 ? backendLogs : [...dynamicLogs, ...INITIAL_AUDIT_LOGS];

  const filteredLogs = allLogs.filter(log => {
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
      const res = await api.verifyAuditChain();
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
      await api.simulateAuditTamper(1);
      setTamperedState(true);
      fetchLogs();
      const res = await api.verifyAuditChain();
      setVerificationResult(res);
    } catch (err) {
      setVerificationResult({
        valid: false,
        broken_index: null,
        error: `Tampering Simulation Blocked: ${err.message}. (Switch persona to Compliance Officer or Network Admin to test audit tampering)`
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
              Cryptographic Audit Trail & Compliance Ledger
            </h1>
            <span className="badge badge-success">Tamper-Evident SHA-256 Chain</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Every event is canonically serialized, linked with SHA-256 hashes, and verified for compliance (GDPR/SOC2).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleVerifyChain}
            disabled={isVerifying}
            className="btn btn-primary btn-sm"
          >
            <ShieldCheck size={14} />
            <span>{isVerifying ? 'Verifying Chain...' : 'Verify Cryptographic Chain'}</span>
          </button>

          {!tamperedState ? (
            <button
              onClick={handleSimulateTamper}
              className="btn btn-secondary btn-sm"
              title="Deliberately modifies an earlier event to prove tamper detection"
            >
              <AlertTriangle size={13} color="var(--warning-text)" />
              <span>Simulate Tampering</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setTamperedState(false);
                setVerificationResult(null);
                fetchLogs();
              }}
              className="btn btn-secondary btn-sm"
            >
              <RotateCcw size={13} />
              <span>Reset Ledger State</span>
            </button>
          )}
        </div>
      </div>

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
                {verificationResult.valid ? 'CRYPTOGRAPHIC AUDIT INTEGRITY CONFIRMED' : 'LEDGER TAMPERING DETECTED!'}
              </strong>
              <p style={{ color: verificationResult.valid ? 'var(--success-text)' : 'var(--danger-text)', fontSize: '0.765rem', marginTop: '2px' }}>
                {verificationResult.message || verificationResult.error}
              </p>
            </div>
          </div>
          <span style={{ fontSize: '0.725rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
            Verified {allLogs.length} Blocks
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
            Showing <strong>{filteredLogs.length}</strong> audited events
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
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '13px 18px', fontFamily: 'var(--font-mono)', fontSize: '0.765rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--primary-dark)' }}>{log.timestamp}</span>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.675rem' }}>{log.date || '2026-09-26'}</div>
                    </td>

                    <td style={{ padding: '13px 18px', fontWeight: 500, color: 'var(--text-primary)' }}>
                      {log.event}
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
                      <span className={`badge ${isFlagged ? 'badge-warning' : 'badge-success'}`}>
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
                          border: '1px solid var(--border-light)'
                        }}>
                          {log.hash}
                        </code>
                        <button
                          onClick={() => handleCopy(log.fullHash)}
                          title="Copy Full 64-character SHA-256 Hash"
                          style={{
                            padding: '3px',
                            color: copiedHash === log.fullHash ? 'var(--success)' : 'var(--text-muted)',
                            cursor: 'pointer'
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
