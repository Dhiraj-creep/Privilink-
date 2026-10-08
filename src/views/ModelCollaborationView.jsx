import React, { useState, useEffect } from 'react';
import { 
  Layers
} from 'lucide-react';
import { GLOBAL_MODEL_METRICS } from '../data/syntheticData';
import { api } from '../api/client';

export default function ModelCollaborationView() {
  const [metricsData, setMetricsData] = useState(GLOBAL_MODEL_METRICS);

  useEffect(() => {
    let isMounted = true;
    api.getModelMetrics()
      .then(res => {
        if (!isMounted || !res) return;
        const collab = res.collaborative || {};
        const baselines = res.baselines || {};

        setMetricsData({
          round: res.dataset_summary?.total_records ? 27 : GLOBAL_MODEL_METRICS.round,
          totalRounds: 30,
          participatingNodes: '3 Nodes (Bank, Insurer, Lender)',
          globalMetrics: {
            prAuc: collab.pr_auc !== undefined ? Number(collab.pr_auc.toFixed(3)) : GLOBAL_MODEL_METRICS.globalMetrics.prAuc,
            f1Score: collab.f1 !== undefined ? Number(collab.f1.toFixed(3)) : GLOBAL_MODEL_METRICS.globalMetrics.f1Score,
            precision: collab.precision !== undefined ? Number(collab.precision.toFixed(3)) : GLOBAL_MODEL_METRICS.globalMetrics.precision,
            recall: collab.recall !== undefined ? Number(collab.recall.toFixed(3)) : GLOBAL_MODEL_METRICS.globalMetrics.recall,
            aucRoc: collab.roc_auc !== undefined ? Number(collab.roc_auc.toFixed(3)) : GLOBAL_MODEL_METRICS.globalMetrics.aucRoc,
          },
          localMetricsComparison: [
            {
              institution: 'Bank A Alone (Isolated)',
              features: 'Repayment ratio, txn velocity, balance, age',
              prAuc: baselines.BANK_A?.pr_auc !== undefined ? Number(baselines.BANK_A.pr_auc.toFixed(3)) : 0.54,
              f1Score: baselines.BANK_A?.f1 !== undefined ? Number(baselines.BANK_A.f1.toFixed(3)) : 0.51,
              weakness: 'Cannot observe insurance claim spikes or external credit inquiries'
            },
            {
              institution: 'Insurer B Alone (Isolated)',
              features: 'Claim frequency, anomaly index, policy tier, loss ratio',
              prAuc: baselines.INSURER_B?.pr_auc !== undefined ? Number(baselines.INSURER_B.pr_auc.toFixed(3)) : 0.49,
              f1Score: baselines.INSURER_B?.f1 !== undefined ? Number(baselines.INSURER_B.f1.toFixed(3)) : 0.46,
              weakness: 'Blind to banking transactions and debt leverage'
            },
            {
              institution: 'Lender C Alone (Isolated)',
              features: 'Inquiry count, repayment stress, utilization, DTI',
              prAuc: baselines.LENDER_C?.pr_auc !== undefined ? Number(baselines.LENDER_C.pr_auc.toFixed(3)) : 0.52,
              f1Score: baselines.LENDER_C?.f1 !== undefined ? Number(baselines.LENDER_C.f1.toFixed(3)) : 0.48,
              weakness: 'Blind to real-time cash flow and claim histories'
            },
            {
              institution: 'PriviLink Collaborative VFL Model',
              features: 'All 12 vertically-partitioned cross-institutional features',
              prAuc: collab.pr_auc !== undefined ? Number(collab.pr_auc.toFixed(3)) : GLOBAL_MODEL_METRICS.globalMetrics.prAuc,
              f1Score: collab.f1 !== undefined ? Number(collab.f1.toFixed(3)) : GLOBAL_MODEL_METRICS.globalMetrics.f1Score,
              weakness: 'Full cross-silo visibility with zero raw customer PII sharing'
            }
          ]
        });
      })
      .catch(() => {
        // Fallback to static
      });

    return () => { isMounted = false; };
  }, []);

  const m = metricsData;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
              Vertical Federated Learning & Model Collaboration
            </h1>
            <span className="badge badge-demo">Synthetic Benchmark</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Collaborative model convergence across heterogeneous institutional data partitions.
          </p>
        </div>
      </div>

      {/* Global Model Status Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px' }}>
        <div className="card" style={{ padding: '18px' }}>
          <span style={{ fontSize: '0.675rem', fontWeight: 700, color: 'var(--text-muted)' }}>CURRENT ROUND</span>
          <p style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--primary-dark)', marginTop: '3px' }}>
            #{m.round} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ {m.totalRounds}</span>
          </p>
          <span style={{ fontSize: '0.72rem', color: 'var(--secondary-green)', fontWeight: 600 }}>Converged state</span>
        </div>

        <div className="card" style={{ padding: '18px' }}>
          <span style={{ fontSize: '0.675rem', fontWeight: 700, color: 'var(--text-muted)' }}>PARTICIPANTS</span>
          <p style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--success-text)', marginTop: '3px' }}>
            {m.participatingNodes}
          </p>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Nodes synchronized</span>
        </div>

        <div className="card" style={{ padding: '18px' }}>
          <span style={{ fontSize: '0.675rem', fontWeight: 700, color: 'var(--text-muted)' }}>COLLABORATIVE PR-AUC</span>
          <p style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--primary-dark)', marginTop: '3px' }}>
            {m.globalMetrics.prAuc}
          </p>
          <span style={{ fontSize: '0.72rem', color: 'var(--success-text)', fontWeight: 600 }}>+15% to +19% vs Isolated</span>
        </div>

        <div className="card" style={{ padding: '18px' }}>
          <span style={{ fontSize: '0.675rem', fontWeight: 700, color: 'var(--text-muted)' }}>F1-SCORE</span>
          <p style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--primary-dark)', marginTop: '3px' }}>
            {m.globalMetrics.f1Score}
          </p>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Precision: {m.globalMetrics.precision}</span>
        </div>

        <div className="card" style={{ padding: '18px' }}>
          <span style={{ fontSize: '0.675rem', fontWeight: 700, color: 'var(--text-muted)' }}>DRIFT STATUS</span>
          <p style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--success-text)', marginTop: '3px' }}>
            Normal
          </p>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Wasserstein: 0.038</span>
        </div>
      </div>

      {/* Model Benchmark Comparison (Section 15) */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
              Isolated Local Models vs PriviLink Collaborative Model
            </h3>
            <p style={{ fontSize: '0.765rem', color: 'var(--text-secondary)' }}>
              Synthetic benchmark for prototype demonstration — not production performance.
            </p>
          </div>
          <span className="badge badge-success">Superior Detection Power</span>
        </div>

        <div className="card-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {m.localMetricsComparison.map((item, idx) => {
              const isCollaborative = item.institution.includes('PriviLink') || item.institution.includes('TRUSTMESH');
              return (
                <div key={idx} style={{
                  padding: '18px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isCollaborative ? 'var(--sage-light)' : 'var(--bg-subtle)',
                  border: isCollaborative ? '1.5px solid var(--secondary-green)' : '1px solid var(--border-light)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '0.875rem', color: isCollaborative ? 'var(--primary-dark)' : 'var(--text-primary)' }}>
                        {item.institution}
                      </span>
                      <p style={{ fontSize: '0.735rem', color: 'var(--text-secondary)' }}>
                        Features: {item.features}
                      </p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        color: isCollaborative ? 'var(--primary-dark)' : 'var(--text-secondary)'
                      }}>
                        PR-AUC: {item.prAuc}
                      </span>
                      <p style={{ fontSize: '0.715rem', color: 'var(--text-muted)' }}>F1: {item.f1Score}</p>
                    </div>
                  </div>

                  {/* Horizontal Bar */}
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-light)', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
                    <div style={{
                      width: `${item.prAuc * 100}%`,
                      height: '100%',
                      backgroundColor: isCollaborative ? 'var(--primary-dark)' : 'var(--border-dark)',
                      borderRadius: '4px'
                    }} />
                  </div>

                  <div style={{ fontSize: '0.735rem', color: isCollaborative ? 'var(--primary-dark)' : 'var(--text-muted)' }}>
                    <strong>Blind spot / Limit:</strong> {item.weakness}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Section 16: HETEROGENEOUS DATA HANDLING & EMBEDDING ALIGNMENT */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
              Data Heterogeneity & Common Risk Representation
            </h3>
            <p style={{ fontSize: '0.765rem', color: 'var(--text-secondary)' }}>
              Institutions do not need identical raw schemas to contribute useful risk intelligence.
            </p>
          </div>
          <span className="badge badge-primary">Schema Agnostic</span>
        </div>

        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '22px' }}>
            
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <span style={{ fontWeight: 700, fontSize: '0.825rem', color: 'var(--primary-dark)' }}>BANK A LOCAL SCHEMA</span>
              <p style={{ fontSize: '0.735rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                • Transactions velocity<br/>
                • Repayment ratio<br/>
                • Account age & balance tiers
              </p>
            </div>

            <div style={{ padding: '16px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <span style={{ fontWeight: 700, fontSize: '0.825rem', color: 'var(--secondary-green)' }}>INSURER B LOCAL SCHEMA</span>
              <p style={{ fontSize: '0.735rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                • Claims history & frequency<br/>
                • Claim anomaly score<br/>
                • Underwriting policy tiers
              </p>
            </div>

            <div style={{ padding: '16px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <span style={{ fontWeight: 700, fontSize: '0.825rem', color: 'var(--warning-text)' }}>LENDER C LOCAL SCHEMA</span>
              <p style={{ fontSize: '0.735rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                • Loan inquiries count<br/>
                • Repayment stress index<br/>
                • Credit line utilization & DTI
              </p>
            </div>

          </div>

          {/* Projection into Unified Embedding Vector */}
          <div style={{
            backgroundColor: 'var(--nav-bg)',
            color: '#F8FAFC',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            border: '1px solid var(--nav-border)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Layers size={18} color="var(--muted-sage)" />
              <h4 style={{ fontSize: '0.925rem', fontWeight: 700, color: '#F8FAFC' }}>
                LOCAL ENCODER ➔ COMMON RISK REPRESENTATION (LATENT EMBEDDING)
              </h4>
            </div>

            <p style={{ fontSize: '0.765rem', color: 'var(--nav-text)', marginBottom: '16px' }}>
              Each participant runs a private local neural encoder head that maps raw disparate features into a shared, privacy-preserving 64-dimensional latent embedding vector:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
              <div style={{ padding: '12px', backgroundColor: 'var(--nav-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--nav-border)' }}>
                <span style={{ fontSize: '0.685rem', color: 'var(--nav-text)' }}>Dimension: Repayment Stress</span>
                <p style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--muted-sage)', fontFamily: 'var(--font-mono)' }}>0.71</p>
              </div>
              <div style={{ padding: '12px', backgroundColor: 'var(--nav-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--nav-border)' }}>
                <span style={{ fontSize: '0.685rem', color: 'var(--nav-text)' }}>Dimension: Behavioural Anomaly</span>
                <p style={{ fontSize: '1.2rem', fontWeight: 700, color: '#F8FAFC', fontFamily: 'var(--font-mono)' }}>0.64</p>
              </div>
              <div style={{ padding: '12px', backgroundColor: 'var(--nav-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--nav-border)' }}>
                <span style={{ fontSize: '0.685rem', color: 'var(--nav-text)' }}>Dimension: Financial Instability</span>
                <p style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--warning)', fontFamily: 'var(--font-mono)' }}>0.53</p>
              </div>
            </div>

            <div style={{ marginTop: '14px', fontSize: '0.735rem', color: 'var(--nav-text)' }}>
              Values shown are synthetic demonstration representations. Only these normalized latent vectors and differential gradients are coordinated across the network.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
