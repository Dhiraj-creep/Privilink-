import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Building2,
  CheckCircle2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { api } from '../api/client';
import { RISK_CASES } from '../data/syntheticData';
import { formatNumber, formatMetric, getRiskVariant, formatRiskScore } from '../utils/formatters';
import { getPriorityQueue } from '../utils/priorityQueue';

// Clean white chart tooltip
function CustomChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-sm)',
        padding: '8px 12px',
        fontSize: '12px',
        boxShadow: 'var(--shadow-md)',
        color: 'var(--text-primary)'
      }}
    >
      <div style={{ fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
        {label}
      </div>
      {payload.map((entry, index) => (
        <div
          key={`item-${index}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            lineHeight: 1.5
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: entry.color
              }}
            />
            <span style={{ color: 'var(--text-secondary)' }}>{entry.name}:</span>
          </span>
          <span style={{ fontFamily: 'var(--font-sans)', fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: 'var(--text-primary)' }}>
            {entry.value}%
          </span>
        </div>
      ))}
    </div>
  );
}

export default function OverviewView({
  onNavigate,
  onSelectCase,
  quarantinedLender = false
}) {
  const [cases, setCases] = useState(RISK_CASES);
  const [metrics, setMetrics] = useState(null);
  const [clusterInfo, setClusterInfo] = useState(null);
  const [auditStatus, setAuditStatus] = useState({
    status: 'CHECKING', // 'CHECKING' | 'VERIFIED' | 'TAMPER_DETECTED' | 'UNAVAILABLE'
    totalEvents: 0,
    verifiedAt: null,
    error: null
  });

  useEffect(() => {
    let isMounted = true;
    api.getCases()
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setCases(data);
        }
      })
      .catch(() => {});

    api.getModelMetrics()
      .then((m) => {
        if (isMounted && m) setMetrics(m);
      })
      .catch(() => {});

    api.clusterHealthCheck()
      .then((c) => {
        if (isMounted && c) setClusterInfo(c);
      })
      .catch(() => {});

    api.verifyAuditChain()
      .then((res) => {
        if (!isMounted) return;
        if (res && res.valid) {
          setAuditStatus({
            status: 'VERIFIED',
            totalEvents: typeof res.total_events === 'number' ? res.total_events : (res.total_events ?? 0),
            verifiedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            error: null
          });
        } else {
          setAuditStatus({
            status: 'TAMPER_DETECTED',
            totalEvents: res?.total_events || 0,
            verifiedAt: null,
            error: res?.error || 'Cryptographic chain severance detected'
          });
        }
      })
      .catch(() => {
        if (isMounted) {
          setAuditStatus({
            status: 'UNAVAILABLE',
            totalEvents: 0,
            verifiedAt: null,
            error: 'Audit verification service unreachable'
          });
        }
      });

    return () => { isMounted = false; };
  }, []);

  // Compute essential metrics from authoritative data
  const highRiskCases = cases.filter(c => c.riskLevel === 'HIGH' || c.riskLevel === 'CRITICAL');
  const mediumRiskCases = cases.filter(c => c.riskLevel === 'MEDIUM' || c.riskLevel === 'MODERATE');

  // Compute model gain dynamically from verified metrics
  const collabPr = metrics?.collaborative?.pr_auc ?? metrics?.globalMetrics?.prAuc ?? 0.71;
  const bankABaseline = metrics?.baselines?.BANK_A?.pr_auc ?? 0.45;
  const relativeModelGain = Math.round(((collabPr - bankABaseline) / bankABaseline) * 100);

  // Deterministically prioritized top cases (actionable unresolved first)
  const prioritizedQueue = getPriorityQueue(cases, 5);

  // Illustrative signal convergence chart data (clearly labeled as simulation)
  const convergenceData = [
    { period: '12:00', bankA: 28, insurerB: 22, lenderC: 25, collaborative: 32 },
    { period: '12:15', bankA: 34, insurerB: 26, lenderC: 30, collaborative: 38 },
    { period: '12:30', bankA: 38, insurerB: 31, lenderC: 35, collaborative: 44 },
    { period: '12:45', bankA: 42, insurerB: 35, lenderC: 40, collaborative: 68 },
    { period: '13:00', bankA: 44, insurerB: 38, lenderC: 45, collaborative: 98 }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div className="tm-page-header">
        <div>
          <h1 className="tm-page-title">Executive Risk & Network Overview</h1>
          <p className="tm-page-desc">
            Privacy-preserving risk intelligence synthesized across sovereign Bank, Insurer, and Lender nodes without centralizing customer records.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Button
            variant="outline"
            onClick={() => onNavigate('institutions')}
            icon={<Building2 size={14} />}
            aria-label="Inspect Sovereign Nodes"
          >
            Sovereign Nodes
          </Button>
          <Button
            variant="primary"
            onClick={() => onNavigate('risk_cases')}
            iconRight={<ArrowRight size={14} />}
            aria-label="View All Risk Cases"
          >
            View All Risk Cases
          </Button>
        </div>
      </div>

      {/* 4 Essential Operational KPI Cards */}
      <div className="tm-kpi-grid">
        {/* KPI 1: High-Risk Cases */}
        <div className="tm-kpi-card" style={{ borderLeft: '4px solid var(--status-danger)' }}>
          <div className="tm-kpi-label">
            <span>Critical & High Risk</span>
            <Badge variant="danger" size="sm">{highRiskCases.length} Active</Badge>
          </div>
          <div className="tm-kpi-value" style={{ color: 'var(--status-danger)' }}>
            {formatNumber(highRiskCases.length)}
          </div>
          <div className="tm-kpi-subtext">
            <span>{mediumRiskCases.length} medium-tier under surveillance</span>
          </div>
        </div>

        {/* KPI 2: Collaborative PR-AUC */}
        <div className="tm-kpi-card" style={{ borderLeft: '4px solid var(--accent-violet)' }}>
          <div className="tm-kpi-label">
            <span>Model PR-AUC</span>
            <Badge variant="violet" size="sm">
              <span className="tm-kpi-badge-full">+{relativeModelGain}% vs Isolated Bank</span>
              <span className="tm-kpi-badge-short">+{relativeModelGain}% Gain</span>
            </Badge>
          </div>
          <div className="tm-kpi-value" style={{ color: 'var(--accent-violet)' }}>
            {formatMetric(collabPr, 2)}
          </div>
          <div className="tm-kpi-subtext">
            <span>ROC-AUC: {metrics?.collaborative?.roc_auc ? formatMetric(metrics.collaborative.roc_auc, 2) : '0.97'} (Zero data pooling)</span>
          </div>
        </div>

        {/* KPI 3: Sovereign Nodes */}
        <div className="tm-kpi-card" style={{ borderLeft: '4px solid var(--accent-teal)' }}>
          <div className="tm-kpi-label">
            <span>Sovereign Nodes</span>
            <Badge variant={quarantinedLender || clusterInfo?.cluster_state === 'DEGRADED' ? 'warning' : 'teal'} size="sm">
              {clusterInfo ? `${clusterInfo.active_nodes_count}/${clusterInfo.total_nodes_count} Connected` : (quarantinedLender ? '2/3 Active' : '3/3 Connected')}
            </Badge>
          </div>
          <div className="tm-kpi-value" style={{ color: 'var(--accent-teal)' }}>
            {clusterInfo ? `${clusterInfo.active_nodes_count} / ${clusterInfo.total_nodes_count}` : (quarantinedLender ? '2 / 3' : '3 / 3')}
          </div>
          <div className="tm-kpi-subtext">
            <span>
              {quarantinedLender
                ? 'Lender C quarantined via Byzantine filter'
                : clusterInfo?.cluster_state === 'DEGRADED'
                ? 'One or more participant nodes offline'
                : 'Bank A, Insurer B, Lender C operational'}
            </span>
          </div>
        </div>

        {/* KPI 4: Cryptographic Audit Ledger */}
        <div className="tm-kpi-card" style={{
          borderLeft: `4px solid ${
            auditStatus.status === 'VERIFIED' ? 'var(--status-success)' :
            auditStatus.status === 'TAMPER_DETECTED' ? 'var(--status-danger)' :
            auditStatus.status === 'UNAVAILABLE' ? 'var(--status-warning)' : 'var(--text-muted)'
          }`
        }}>
          <div className="tm-kpi-label">
            <span>Audit Integrity</span>
            <Badge variant={
              auditStatus.status === 'VERIFIED' ? 'success' :
              auditStatus.status === 'TAMPER_DETECTED' ? 'danger' :
              auditStatus.status === 'UNAVAILABLE' ? 'warning' : 'neutral'
            } size="sm">
              {auditStatus.status === 'VERIFIED' ? 'Verified' :
               auditStatus.status === 'TAMPER_DETECTED' ? 'Tamper Detected' :
               auditStatus.status === 'UNAVAILABLE' ? 'Unavailable' : 'Checking...'}
            </Badge>
          </div>
          <div className="tm-kpi-value" style={{
            color:
              auditStatus.status === 'VERIFIED' ? 'var(--status-success)' :
              auditStatus.status === 'TAMPER_DETECTED' ? 'var(--status-danger)' :
              auditStatus.status === 'UNAVAILABLE' ? 'var(--status-warning)' : 'var(--text-muted)'
          }}>
            {auditStatus.status === 'VERIFIED' ? `${auditStatus.totalEvents}/${auditStatus.totalEvents} Blocks` :
             auditStatus.status === 'TAMPER_DETECTED' ? 'Chain Broken' :
             auditStatus.status === 'UNAVAILABLE' ? 'Unavailable' : 'Checking...'}
          </div>
          <div className="tm-kpi-subtext">
            <span>
              {auditStatus.status === 'VERIFIED'
                ? `SHA-256 chain verified ${auditStatus.verifiedAt ? `at ${auditStatus.verifiedAt}` : 'from Genesis'}`
                : (auditStatus.error || 'Cryptographic verification status pending')}
            </span>
          </div>
        </div>
      </div>

      {/* Principal Risk Visualization */}
      <Card
        title="Cross-Institution Signal Convergence"
        subtitle="Illustrative simulation showing how 3 independent sub-threshold local signals synthesize into cross-institution confidence."
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: 'var(--primary)' }} />
              <span style={{ fontWeight: 600 }}>Collaborative Synthesis</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)' }}>
              <span style={{ width: '10px', height: '2px', backgroundColor: '#94A3B8' }} />
              <span>Isolated Local Baselines (Sub-Threshold)</span>
            </span>
            <Badge variant="neutral" size="sm">Illustrative Simulation</Badge>
          </div>
        }
      >
        <div style={{ height: '260px', minHeight: '260px', width: '100%', marginTop: '10px' }}>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={convergenceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="collabGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis dataKey="period" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} domain={[0, 100]} />
              <RechartsTooltip content={<CustomChartTooltip />} />
              <Area
                type="monotone"
                dataKey="collaborative"
                name="Collaborative Risk"
                stroke="var(--primary)"
                strokeWidth={2.5}
                fill="url(#collabGrad)"
              />
              <Area
                type="monotone"
                dataKey="bankA"
                name="Bank A Local"
                stroke="#0D9488"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fill="none"
              />
              <Area
                type="monotone"
                dataKey="insurerB"
                name="Insurer B Local"
                stroke="#7C3AED"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fill="none"
              />
              <Area
                type="monotone"
                dataKey="lenderC"
                name="Lender C Local"
                stroke="#D97706"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fill="none"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Two Balanced Columns: Priority Investigation Queue & Node Status */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: '20px' }}>
        {/* Column 1: Priority Queue */}
        <Card
          title="Priority Investigation Queue"
          subtitle="Top actionable cases ranked by severity, resolution state, and composite risk score."
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('risk_cases')}
              iconRight={<ArrowRight size={12} />}
              aria-label="View all risk cases"
            >
              All Cases
            </Button>
          }
        >
          {prioritizedQueue.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={24} color="var(--status-success)" style={{ margin: '0 auto 8px auto' }} />
              <p style={{ fontSize: '13px', fontWeight: 600 }}>All cases resolved</p>
              <p style={{ fontSize: '12px' }}>Zero high-risk escalations pending analyst intervention.</p>
            </div>
          ) : (
            <div className="tm-table-container">
              <table className="tm-table">
                <thead>
                  <tr>
                    <th>Case ID</th>
                    <th>Customer Ref</th>
                    <th>Risk Tier</th>
                    <th className="col-num">Risk Score</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {prioritizedQueue.map((c) => {
                    const riskProps = getRiskVariant(c.riskLevel);
                    return (
                      <tr
                        key={c.id}
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          if (onSelectCase) onSelectCase(c);
                          onNavigate('customer_investigation');
                        }}
                      >
                        <td style={{ fontWeight: 600, color: 'var(--primary)' }}>
                          {c.id}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                          {c.customerId}
                        </td>
                        <td>
                          <Badge variant={riskProps.variant} size="sm">
                            {riskProps.label}
                          </Badge>
                        </td>
                        <td className="cell-num" style={{ fontWeight: 600 }}>
                          {formatRiskScore(c.score ?? c.confidence)}
                        </td>
                        <td>
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onSelectCase) onSelectCase(c);
                              onNavigate('customer_investigation');
                            }}
                            aria-label={`Investigate case ${c.id}`}
                          >
                            Investigate
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Column 2: Institutional Federation Status */}
        <Card
          title="Sovereign Federation Status"
          subtitle="Physical process and sovereign database isolation across participating institutions."
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('institutions')}
              iconRight={<ArrowRight size={12} />}
              aria-label="View sovereign network details"
            >
              Network Details
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Bank A */}
            <div style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Building2 size={16} color="var(--primary)" />
                <div>
                  <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Bank A (Port 8001)</strong>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    250,000 synthetic records • Sovereign SQLite Repayments
                  </div>
                </div>
              </div>
              <Badge variant="success" size="sm">Operational</Badge>
            </div>

            {/* Insurer B */}
            <div style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Building2 size={16} color="var(--accent-teal)" />
                <div>
                  <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Insurer B (Port 8002)</strong>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    118,000 synthetic records • Sovereign SQLite Claims
                  </div>
                </div>
              </div>
              <Badge variant="success" size="sm">Operational</Badge>
            </div>

            {/* Lender C */}
            <div style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              backgroundColor: quarantinedLender ? 'var(--status-danger-subtle)' : 'var(--bg-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Building2 size={16} color={quarantinedLender ? 'var(--status-danger)' : 'var(--status-warning)'} />
                <div>
                  <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Lender C (Port 8003)</strong>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    184,000 synthetic records • Sovereign SQLite Facilities
                  </div>
                </div>
              </div>
              <Badge variant={quarantinedLender ? 'danger' : 'success'} size="sm">
                {quarantinedLender ? 'Quarantined (Byzantine Isolation)' : 'Operational'}
              </Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
