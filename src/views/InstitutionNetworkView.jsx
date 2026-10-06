import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  TrendingUp, 
  EyeOff,
  AlertTriangle
} from 'lucide-react';
import { INSTITUTIONS, generateLocalSampleRows } from '../data/syntheticData';
import { api } from '../api/client';

export default function InstitutionNetworkView({ 
  selectedInstitutionId, 
  quarantinedLender,
  currentRole
}) {
  const [activeInstId, setActiveInstId] = useState(selectedInstitutionId || 'BANK_A');
  const [searchTerm, setSearchTerm] = useState('');
  const [boundaryError, setBoundaryError] = useState(null);
  const [backendRecords, setBackendRecords] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadRecords = async () => {
      try {
        const records = await api.getNodeRecords(activeInstId, 50, searchTerm);
        if (!isMounted) return;
        setBoundaryError(null);
        if (Array.isArray(records) && records.length > 0) {
          setBackendRecords(records);
        } else {
          setBackendRecords(null);
        }
      } catch (err) {
        if (!isMounted) return;
        setBackendRecords(null);
        if (err.message && (err.message.includes('403') || err.message.toLowerCase().includes('forbidden') || err.message.toLowerCase().includes('boundary'))) {
          setBoundaryError(err.message);
        } else {
          setBoundaryError(null);
        }
      }
    };

    loadRecords();

    return () => { isMounted = false; };
  }, [activeInstId, currentRole, searchTerm]);

  const currentInst = INSTITUTIONS[activeInstId] || INSTITUTIONS.BANK_A;
  const sampleRows = generateLocalSampleRows(activeInstId);

  const displayRows = (backendRecords && backendRecords.length > 0)
    ? backendRecords.map(r => {
        if (activeInstId === 'BANK_A') {
          return {
            id: r.id,
            customerRef: r.customer_ref || r.customerRef,
            repaymentRatio: typeof r.repayment_behaviour_ratio === 'number' ? r.repayment_behaviour_ratio.toFixed(2) : r.repaymentRatio,
            velocityAnomaly: typeof r.transaction_velocity_anomaly === 'number' ? r.transaction_velocity_anomaly.toFixed(1) : r.velocityAnomaly,
            accountAgeMonths: r.account_tenure_months || r.accountAgeMonths,
            consistencyIndex: typeof r.payment_consistency_index === 'number' ? r.payment_consistency_index.toFixed(2) : r.consistencyIndex,
            localFlag: r.local_flag || r.localFlag || 'Normal'
          };
        } else if (activeInstId === 'INSURER_B') {
          return {
            id: r.id,
            customerRef: r.customer_ref || r.customerRef,
            claimFrequency: typeof r.claim_frequency_rate === 'number' ? r.claim_frequency_rate.toFixed(2) : r.claimFrequency,
            claimAnomalyScore: typeof r.claim_anomaly_score === 'number' ? Math.round(r.claim_anomaly_score) : r.claimAnomalyScore,
            policyTier: r.policy_behaviour_tier || r.policyTier,
            lossRatio: typeof r.loss_ratio_exposure === 'number' ? r.loss_ratio_exposure.toFixed(2) : r.lossRatio,
            localFlag: r.local_flag || r.localFlag || 'Normal'
          };
        } else {
          return {
            id: r.id,
            customerRef: r.customer_ref || r.customerRef,
            loanAppCount: r.loan_application_velocity || r.loanAppCount,
            repaymentStress: typeof r.repayment_stress_indicator === 'number' ? Math.round(r.repayment_stress_indicator) : r.repaymentStress,
            creditUtilization: typeof r.credit_utilization_trajectory === 'number' ? `${Math.round(r.credit_utilization_trajectory)}%` : r.creditUtilization,
            dtiBand: r.dti_synthetic_band || r.dtiBand,
            localFlag: r.local_flag || r.localFlag || 'Normal'
          };
        }
      })
    : sampleRows;

  const filteredRows = displayRows.filter(r => 
    r.id?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.customerRef?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Page Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
              Institution Network & Private Local Schemas
            </h1>
            <span className="badge badge-demo">Synthetic Demo Data</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Each institution maintains full autonomy and sovereign custody over its private customer records.
          </p>
        </div>
      </div>

      {/* 3 Institution Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '16px'
      }}>
        {/* BANK A CARD */}
        <div 
          onClick={() => setActiveInstId('BANK_A')}
          className="card"
          style={{
            padding: '20px',
            cursor: 'pointer',
            border: activeInstId === 'BANK_A' ? '2px solid var(--primary-dark)' : '1px solid var(--border-light)',
            backgroundColor: activeInstId === 'BANK_A' ? 'var(--sage-light)' : 'var(--bg-surface)',
            boxShadow: activeInstId === 'BANK_A' ? 'var(--shadow-md)' : 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--primary-dark)',
                color: 'var(--text-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Building2 size={20} color="var(--muted-sage)" />
              </div>
              <div>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
                  BANK A
                </h3>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>Retail & Commercial Banking</span>
              </div>
            </div>
            <span className="badge badge-success">Connected</span>
          </div>

          <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.775rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Data records:</span>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>250,000 synthetic</p>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Local model:</span>
              <p style={{ fontWeight: 600, color: 'var(--success-text)' }}>Healthy</p>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Last update:</span>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>42 seconds ago</p>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Trust score:</span>
              <p style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>96%</p>
            </div>
          </div>
        </div>

        {/* INSURER B CARD */}
        <div 
          onClick={() => setActiveInstId('INSURER_B')}
          className="card"
          style={{
            padding: '20px',
            cursor: 'pointer',
            border: activeInstId === 'INSURER_B' ? '2px solid var(--secondary-green)' : '1px solid var(--border-light)',
            backgroundColor: activeInstId === 'INSURER_B' ? 'var(--sage-light)' : 'var(--bg-surface)',
            boxShadow: activeInstId === 'INSURER_B' ? 'var(--shadow-md)' : 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--secondary-green)',
                color: 'var(--text-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShieldCheck size={20} color="#FCFBF7" />
              </div>
              <div>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
                  INSURER B
                </h3>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>General & Property Insurance</span>
              </div>
            </div>
            <span className="badge badge-success">Connected</span>
          </div>

          <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.775rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Data records:</span>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>118,000 synthetic</p>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Local model:</span>
              <p style={{ fontWeight: 600, color: 'var(--success-text)' }}>Healthy</p>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Last update:</span>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>58 seconds ago</p>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Trust score:</span>
              <p style={{ fontWeight: 700, color: 'var(--secondary-green)' }}>92%</p>
            </div>
          </div>
        </div>

        {/* LENDER C CARD */}
        <div 
          onClick={() => setActiveInstId('LENDER_C')}
          className="card"
          style={{
            padding: '20px',
            cursor: 'pointer',
            border: quarantinedLender 
              ? '2px solid var(--danger)' 
              : activeInstId === 'LENDER_C' ? '2px solid var(--warning)' : '1px solid var(--border-light)',
            backgroundColor: quarantinedLender 
              ? 'var(--danger-light)' 
              : activeInstId === 'LENDER_C' ? 'var(--warning-light)' : 'var(--bg-surface)',
            boxShadow: activeInstId === 'LENDER_C' ? 'var(--shadow-md)' : 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: quarantinedLender ? 'var(--danger)' : 'var(--warning)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <TrendingUp size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
                  LENDER C
                </h3>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>Digital Credit & SME Loans</span>
              </div>
            </div>
            <span className={`badge ${quarantinedLender ? 'badge-danger' : 'badge-success'}`}>
              {quarantinedLender ? 'Quarantined' : 'Connected'}
            </span>
          </div>

          <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.775rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Data records:</span>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>184,000 synthetic</p>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Local model:</span>
              <p style={{ fontWeight: 600, color: quarantinedLender ? 'var(--danger-text)' : 'var(--success-text)' }}>
                {quarantinedLender ? 'Under Review' : 'Healthy'}
              </p>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Last update:</span>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>1 minute ago</p>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Trust score:</span>
              <p style={{ fontWeight: 700, color: quarantinedLender ? 'var(--danger-text)' : 'var(--warning-text)' }}>
                {quarantinedLender ? '63% (Penalized)' : '89%'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Strict Privacy Demarcation Banner */}
      <div style={{
        backgroundColor: 'var(--nav-bg)',
        color: 'var(--text-light)',
        borderRadius: 'var(--radius-lg)',
        padding: '18px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        border: '1px solid var(--nav-border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            backgroundColor: 'rgba(143, 175, 157, 0.15)',
            color: 'var(--muted-sage)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <EyeOff size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontWeight: 700, fontSize: '0.925rem', color: '#FCFBF7', letterSpacing: '0.03em' }}>
                STRICT PRIVACY BOUNDARY: PRIVATE TO {currentInst.shortName.toUpperCase()}
              </span>
              <span className="badge badge-demo" style={{ fontSize: '0.65rem', backgroundColor: '#1A4335', color: '#E8EBE9', borderColor: '#2F6B4F' }}>
                Zero External Visibility
              </span>
            </div>
            <p style={{ fontSize: '0.785rem', color: 'var(--nav-text)', marginTop: '3px' }}>
              The raw features and records below exist strictly within {currentInst.name}'s perimeter. They are 
              <strong style={{ color: '#FCFBF7' }}> NOT visible to other participants</strong> and 
              <strong style={{ color: '#FCFBF7' }}> NEVER transmitted</strong> to the central TRUSTMESH node.
            </p>
          </div>
        </div>

        <div style={{
          padding: '6px 14px',
          backgroundColor: 'var(--nav-surface)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--nav-border)',
          fontSize: '0.75rem',
          textAlign: 'right'
        }}>
          <span style={{ color: 'var(--muted-sage)', fontWeight: 600 }}>Local Model:</span><br/>
          <span style={{ color: '#FCFBF7', fontFamily: 'var(--font-mono)' }}>PyTorch FedPer Local Head</span>
        </div>
      </div>

      {/* Private Schema Breakdown & Sample Data Inspector */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
              {currentInst.name} — Private Schema & Local Telemetry
            </h3>
            <span style={{ fontSize: '0.765rem', color: 'var(--text-secondary)' }}>
              Heterogeneous institutional schema transformed locally into normalized privacy-preserving embeddings.
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input 
              type="text"
              placeholder="Search local records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '6px 12px',
                fontSize: '0.775rem',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                outline: 'none',
                width: '200px'
              }}
            />
          </div>
        </div>

        <div className="card-body">
          {/* Schema Spec Cards */}
          <div style={{ marginBottom: '22px' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
              Institution-Specific Private Features (Held On-Premise)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '12px' }}>
              {currentInst.privateDataSchema.map((item, idx) => (
                <div key={idx} style={{
                  padding: '12px',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-light)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <code style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary-dark)' }}>
                      {item.field}
                    </code>
                    <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>
                      {item.type}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.735rem', color: 'var(--text-secondary)' }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {boundaryError && (
            <div style={{
              backgroundColor: 'var(--danger-light)',
              border: '1.5px solid var(--danger-border)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px'
            }}>
              <AlertTriangle size={24} color="var(--danger-text)" style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: '0.875rem', color: 'var(--danger-text)' }}>
                  Sovereign Boundary Isolation Enforced (HTTP 403 Forbidden)
                </strong>
                <p style={{ fontSize: '0.785rem', color: 'var(--danger-text)', margin: '4px 0 0' }}>
                  {boundaryError}. Zero-Trust architecture prohibits any participating node from querying raw ledger rows of peer institutions.
                </p>
              </div>
            </div>
          )}

          {/* Sample Table */}
          {!boundaryError ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Local Data Records (Showing {filteredRows.length} Records)
              </h4>
              <span className={`badge ${backendRecords ? 'badge-success' : 'badge-neutral'}`} style={{ fontSize: '0.68rem' }}>
                {backendRecords ? `✓ Sovereign Node DB (${backendRecords.length} Rows)` : 'Client Synthetic Demo Fallback'}
              </span>
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.785rem', textAlign: 'left' }}>
                <thead style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-light)' }}>
                  <tr>
                    <th style={{ padding: '10px 14px', fontWeight: 600 }}>Local Record ID</th>
                    <th style={{ padding: '10px 14px', fontWeight: 600 }}>Internal Ref</th>
                    {activeInstId === 'BANK_A' && (
                      <>
                        <th style={{ padding: '10px 14px', fontWeight: 600 }}>Repayment Ratio</th>
                        <th style={{ padding: '10px 14px', fontWeight: 600 }}>Txn Velocity (Z)</th>
                        <th style={{ padding: '10px 14px', fontWeight: 600 }}>Account Age</th>
                        <th style={{ padding: '10px 14px', fontWeight: 600 }}>Consistency</th>
                      </>
                    )}
                    {activeInstId === 'INSURER_B' && (
                      <>
                        <th style={{ padding: '10px 14px', fontWeight: 600 }}>Claim Freq (/yr)</th>
                        <th style={{ padding: '10px 14px', fontWeight: 600 }}>Claim Anomaly Index</th>
                        <th style={{ padding: '10px 14px', fontWeight: 600 }}>Policy Tier</th>
                        <th style={{ padding: '10px 14px', fontWeight: 600 }}>Loss Ratio</th>
                      </>
                    )}
                    {activeInstId === 'LENDER_C' && (
                      <>
                        <th style={{ padding: '10px 14px', fontWeight: 600 }}>Inquiry Count (30d)</th>
                        <th style={{ padding: '10px 14px', fontWeight: 600 }}>Repayment Stress</th>
                        <th style={{ padding: '10px 14px', fontWeight: 600 }}>Credit Util</th>
                        <th style={{ padding: '10px 14px', fontWeight: 600 }}>DTI Band</th>
                      </>
                    )}
                    <th style={{ padding: '10px 14px', fontWeight: 600 }}>Local Isolated Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.slice(0, 10).map((row, i) => (
                    <tr key={i} style={{ 
                      borderBottom: '1px solid var(--border-light)',
                      backgroundColor: row.id.includes('10482') ? 'var(--warning-light)' : (i % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-subtle)')
                    }}>
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--primary-dark)' }}>
                        {row.id}
                        {row.id.includes('10482') && (
                          <span className="badge badge-warning" style={{ marginLeft: '6px', fontSize: '0.6rem' }}>
                            Case-10482 Subject
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>{row.customerRef}</td>
                      {activeInstId === 'BANK_A' && (
                        <>
                          <td style={{ padding: '10px 14px' }}>{row.repaymentRatio}</td>
                          <td style={{ padding: '10px 14px' }}>{row.velocityAnomaly}</td>
                          <td style={{ padding: '10px 14px' }}>{row.accountAgeMonths} mos</td>
                          <td style={{ padding: '10px 14px' }}>{row.consistencyIndex}</td>
                        </>
                      )}
                      {activeInstId === 'INSURER_B' && (
                        <>
                          <td style={{ padding: '10px 14px' }}>{row.claimFrequency}</td>
                          <td style={{ padding: '10px 14px' }}>{row.claimAnomalyScore} / 100</td>
                          <td style={{ padding: '10px 14px' }}>{row.policyTier}</td>
                          <td style={{ padding: '10px 14px' }}>{row.lossRatio}</td>
                        </>
                      )}
                      {activeInstId === 'LENDER_C' && (
                        <>
                          <td style={{ padding: '10px 14px' }}>{row.loanAppCount}</td>
                          <td style={{ padding: '10px 14px' }}>{row.repaymentStress}</td>
                          <td style={{ padding: '10px 14px' }}>{row.creditUtilization}</td>
                          <td style={{ padding: '10px 14px' }}>{row.dtiBand}</td>
                        </>
                      )}
                      <td style={{ padding: '10px 14px' }}>
                        <span className={`badge ${row.localFlag === 'Normal' ? 'badge-success' : 'badge-warning'}`}>
                          {row.localFlag}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p style={{ fontSize: '0.735rem', color: 'var(--text-secondary)', marginTop: '10px' }}>
              Note how <strong>Row B-10482</strong> only shows a "Weak Anomaly" at Bank A. Without TrustMesh, Bank A would discard it as normal background variance.
            </p>
          </div>
          ) : (
            <div style={{ padding: '24px', textAlign: 'center', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-medium)' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem' }}>
                Local telemetry and ledger records for <strong>{currentInst.name}</strong> are locked behind sovereign institutional boundaries.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
