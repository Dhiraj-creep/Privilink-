import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  AlertTriangle,
  Search
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { INSTITUTIONS, generateLocalSampleRows } from '../data/syntheticData';
import { api } from '../api/client';

export default function InstitutionNetworkView({ 
  selectedInstitutionId = 'BANK_A', 
  quarantinedLender = false,
  currentRole
}) {
  const [activeInstId, setActiveInstId] = useState(selectedInstitutionId);
  const [searchTerm, setSearchTerm] = useState('');
  const [boundaryError, setBoundaryError] = useState(null);
  const [backendRecords, setBackendRecords] = useState(null);
  const [clusterHealth, setClusterHealth] = useState(null);

  useEffect(() => {
    let isMounted = true;
    api.clusterHealthCheck()
      .then((h) => {
        if (isMounted && h) setClusterHealth(h);
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;

    api.getNodeRecords(activeInstId, 50, searchTerm)
      .then((records) => {
        if (!isMounted) return;
        setBoundaryError(null);
        if (Array.isArray(records)) {
          setBackendRecords(records);
        } else {
          setBackendRecords(null);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setBackendRecords(null);
        if (err.message && (err.message.includes('403') || err.message.toLowerCase().includes('forbidden') || err.message.toLowerCase().includes('boundary'))) {
          setBoundaryError(err.message);
        } else {
          setBoundaryError(null);
        }
      });

    return () => { isMounted = false; };
  }, [activeInstId, currentRole, searchTerm]);

  const currentInst = INSTITUTIONS[activeInstId] || INSTITUTIONS.BANK_A;
  const sampleRows = generateLocalSampleRows(activeInstId);

  // Normalize rows for table
  const displayRows = (backendRecords && backendRecords.length > 0)
    ? backendRecords.map(r => {
        if (activeInstId === 'BANK_A') {
          return {
            id: r.id,
            customerRef: r.customer_ref || r.customerRef,
            col1: typeof r.repayment_behaviour_ratio === 'number' ? r.repayment_behaviour_ratio.toFixed(2) : '0.94',
            col2: typeof r.transaction_velocity_anomaly === 'number' ? r.transaction_velocity_anomaly.toFixed(1) : '+0.2',
            col3: r.account_tenure_months ? `${r.account_tenure_months}m` : '36m',
            col4: typeof r.payment_consistency_index === 'number' ? r.payment_consistency_index.toFixed(2) : '0.88',
            localFlag: r.local_flag || 'Normal'
          };
        } else if (activeInstId === 'INSURER_B') {
          return {
            id: r.id,
            customerRef: r.customer_ref || r.customerRef,
            col1: typeof r.claim_frequency_rate === 'number' ? r.claim_frequency_rate.toFixed(2) : '0.18',
            col2: typeof r.claim_anomaly_score === 'number' ? Math.round(r.claim_anomaly_score) : '14',
            col3: r.policy_behaviour_tier || 'Standard',
            col4: typeof r.loss_ratio_exposure === 'number' ? r.loss_ratio_exposure.toFixed(2) : '0.45',
            localFlag: r.local_flag || 'Normal'
          };
        } else {
          return {
            id: r.id,
            customerRef: r.customer_ref || r.customerRef,
            col1: r.loan_application_velocity || '1',
            col2: typeof r.repayment_stress_indicator === 'number' ? Math.round(r.repayment_stress_indicator) : '22',
            col3: typeof r.credit_utilization_trajectory === 'number' ? `${Math.round(r.credit_utilization_trajectory)}%` : '35%',
            col4: r.dti_synthetic_band || 'Tier B',
            localFlag: r.local_flag || 'Normal'
          };
        }
      })
    : sampleRows.map(r => ({
        id: r.id,
        customerRef: r.customerRef,
        col1: r.repaymentRatio || r.claimFrequency || r.loanAppCount || '—',
        col2: r.velocityAnomaly || r.claimAnomalyScore || r.repaymentStress || '—',
        col3: r.accountAgeMonths ? `${r.accountAgeMonths}m` : (r.policyTier || r.creditUtilization || '—'),
        col4: r.consistencyIndex || r.lossRatio || r.dtiBand || '—',
        localFlag: r.localFlag || 'Normal'
      }));

  const filteredRows = displayRows.filter(r =>
    (r.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.customerRef || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const bankNode = clusterHealth?.nodes?.BANK_A;
  const isBankOnline = bankNode ? bankNode.status === 'REACHABLE' : true;

  const insNode = clusterHealth?.nodes?.INSURER_B;
  const isInsOnline = insNode ? insNode.status === 'REACHABLE' : true;

  const lenderNode = clusterHealth?.nodes?.LENDER_C;
  const isLenderQuarantine = quarantinedLender || (lenderNode && lenderNode.quarantined);
  const isLenderOnline = lenderNode ? lenderNode.status === 'REACHABLE' : true;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Page Header */}
      <div className="tm-page-header">
        <div>
          <h1 className="tm-page-title">Sovereign Institution Network</h1>
          <p className="tm-page-desc">
            Independent participant nodes maintaining sovereign physical databases. Raw features never cross institutional firewalls.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Badge variant="teal" size="sm">3 Participating Nodes</Badge>
          <Badge variant="success" size="sm">Strict Isolation (HTTP 403)</Badge>
        </div>
      </div>

      {/* 3 Sovereign Institution Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px' }}>
        {/* BANK A */}
        <div
          onClick={() => setActiveInstId('BANK_A')}
          className="card"
          style={{
            padding: '20px',
            cursor: 'pointer',
            border: activeInstId === 'BANK_A' ? '2px solid var(--primary)' : '1px solid var(--border-default)',
            boxShadow: activeInstId === 'BANK_A' ? 'var(--shadow-sm)' : 'var(--shadow-xs)',
            transition: 'all var(--transition-fast)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-subtle)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Building2 size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Bank A Node
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Port 8001 • Retail Banking</span>
              </div>
            </div>
            <Badge variant={isBankOnline ? "success" : "neutral"} size="sm">
              {bankNode ? (isBankOnline ? "Reachable" : "Unreachable") : "Connected"}
            </Badge>
          </div>

          <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Local Records:</span>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {backendRecords && activeInstId === 'BANK_A' ? `${backendRecords.length} Active` : '250,000'}
              </p>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Node Storage:</span>
              <p style={{ fontWeight: 700, color: 'var(--primary)' }}>
                {bankNode?.storage || 'Operational'}
              </p>
            </div>
          </div>
        </div>

        {/* INSURER B */}
        <div
          onClick={() => setActiveInstId('INSURER_B')}
          className="card"
          style={{
            padding: '20px',
            cursor: 'pointer',
            border: activeInstId === 'INSURER_B' ? '2px solid var(--primary)' : '1px solid var(--border-default)',
            boxShadow: activeInstId === 'INSURER_B' ? 'var(--shadow-sm)' : 'var(--shadow-xs)',
            transition: 'all var(--transition-fast)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--accent-teal-subtle)',
                color: 'var(--accent-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Building2 size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Insurer B Node
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Port 8002 • Property & Life</span>
              </div>
            </div>
            <Badge variant={isInsOnline ? "success" : "neutral"} size="sm">
              {insNode ? (isInsOnline ? "Reachable" : "Unreachable") : "Connected"}
            </Badge>
          </div>

          <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Local Records:</span>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {backendRecords && activeInstId === 'INSURER_B' ? `${backendRecords.length} Active` : '118,000'}
              </p>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Node Storage:</span>
              <p style={{ fontWeight: 700, color: 'var(--accent-teal)' }}>
                {insNode?.storage || 'Operational'}
              </p>
            </div>
          </div>
        </div>

        {/* LENDER C */}
        <div
          onClick={() => setActiveInstId('LENDER_C')}
          className="card"
          style={{
            padding: '20px',
            cursor: 'pointer',
            border: activeInstId === 'LENDER_C' ? '2px solid var(--primary)' : '1px solid var(--border-default)',
            boxShadow: activeInstId === 'LENDER_C' ? 'var(--shadow-sm)' : 'var(--shadow-xs)',
            transition: 'all var(--transition-fast)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isLenderQuarantine ? 'var(--status-danger-subtle)' : 'var(--status-warning-subtle)',
                color: isLenderQuarantine ? 'var(--status-danger)' : 'var(--status-warning)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Building2 size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Lender C Node
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Port 8003 • Digital Lending</span>
              </div>
            </div>
            <Badge variant={isLenderQuarantine ? 'danger' : (isLenderOnline ? 'warning' : 'neutral')} size="sm">
              {isLenderQuarantine ? 'Quarantined' : (lenderNode ? (isLenderOnline ? 'Reachable' : 'Unreachable') : 'Connected')}
            </Badge>
          </div>

          <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Local Records:</span>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {backendRecords && activeInstId === 'LENDER_C' ? `${backendRecords.length} Active` : '184,000'}
              </p>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Status:</span>
              <p style={{ fontWeight: 700, color: isLenderQuarantine ? 'var(--status-danger)' : 'var(--status-warning)' }}>
                {isLenderQuarantine ? 'Isolated' : (lenderNode?.storage || 'Operational')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Node Details & Boundary Enforcement */}
      <Card
        title={`${currentInst.name} — Private Schema & Sovereign Custody`}
        subtitle="Features held on-premise. Only scalar partial logits (z_k) leave the node boundary during federated evaluation."
      >
        {/* Boundary Error Alert (Visible if unauthorized cross-institution query occurs) */}
        {boundaryError && (
          <div style={{
            backgroundColor: 'var(--status-danger-subtle)',
            border: '1.5px solid var(--status-danger-border)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}>
            <AlertTriangle size={24} color="var(--status-danger)" style={{ flexShrink: 0 }} />
            <div>
              <strong style={{ fontSize: '14px', color: 'var(--status-danger-text)' }}>
                Sovereign Boundary Isolation Enforced (HTTP 403 Forbidden)
              </strong>
              <p style={{ fontSize: '12px', color: 'var(--status-danger-text)', margin: '4px 0 0' }}>
                {boundaryError}
              </p>
              <span style={{ fontSize: '11px', color: 'var(--status-danger)', marginTop: '4px', display: 'block' }}>
                Zero-Trust architecture prohibits any participating node from querying raw ledger rows of peer institutions.
              </span>
            </div>
          </div>
        )}

        {/* Private Schema Breakdown */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
            Institution Private Features
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '10px' }}>
            {currentInst.privateDataSchema.map((item, idx) => (
              <div key={idx} style={{
                padding: '12px',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-default)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <code style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary)' }}>
                    {item.field}
                  </code>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {item.type}
                  </span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Sovereign Records Table (Hidden if boundary violation 403) */}
        {!boundaryError && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>
                  Sovereign Database Sample Records
                </h4>
                <Badge variant={backendRecords ? 'success' : 'neutral'} size="sm">
                  {backendRecords
                    ? `Live Sovereign SQLite (${backendRecords.length} Rows)`
                    : 'Demonstration Fixture (Offline)'}
                </Badge>
              </div>

              <div style={{ position: 'relative', width: '220px' }}>
                <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Filter local records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: '100%', paddingLeft: '30px', height: '32px', fontSize: '12px' }}
                />
              </div>
            </div>

            {filteredRows.length === 0 ? (
              <div className="tm-empty-state" style={{ padding: '32px 16px' }}>
                <div className="tm-empty-state-icon">
                  <Search size={20} />
                </div>
                <h3 className="tm-empty-state-title">No local records match query</h3>
                <p className="tm-empty-state-desc">
                  No records match "{searchTerm}" within {currentInst.name}'s sovereign data store.
                </p>
              </div>
            ) : (
              <div className="tm-table-container">
                <table className="tm-table">
                  <thead>
                    <tr>
                      <th>Record ID</th>
                      <th>Customer Ref</th>
                    {activeInstId === 'BANK_A' && (
                      <>
                        <th className="col-num">Repayment Ratio</th>
                        <th className="col-num">Txn Velocity Z</th>
                        <th>Account Age</th>
                        <th className="col-num">Consistency</th>
                      </>
                    )}
                    {activeInstId === 'INSURER_B' && (
                      <>
                        <th className="col-num">Claim Freq Rate</th>
                        <th className="col-num">Anomaly Index</th>
                        <th>Policy Tier</th>
                        <th className="col-num">Loss Exposure</th>
                      </>
                    )}
                    {activeInstId === 'LENDER_C' && (
                      <>
                        <th className="col-num">Velocity (30d)</th>
                        <th className="col-num">Stress Index</th>
                        <th className="col-num">Utilization</th>
                        <th>DTI Band</th>
                      </>
                    )}
                    <th>Local Flag</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((r, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{r.id}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                        {r.customerRef}
                      </td>
                      <td className="cell-num">{r.col1}</td>
                      <td className="cell-num">{r.col2}</td>
                      <td style={{ textAlign: activeInstId === 'BANK_A' ? 'left' : (activeInstId === 'INSURER_B' ? 'left' : 'right') }}>
                        {r.col3}
                      </td>
                      <td className="cell-num">{r.col4}</td>
                      <td>
                        <Badge variant={r.localFlag === 'Normal' ? 'neutral' : 'warning'} size="sm">
                          {r.localFlag}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      </Card>
    </div>
  );
}
