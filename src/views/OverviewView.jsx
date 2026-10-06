import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ArrowRight,
  Building,
  Activity,
  Copy,
  Check,
  Eye,
  Sparkles
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell
} from 'recharts';

import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Chip } from '../components/ui/Chip';
import { Button } from '../components/ui/Button';
import { Sparkline } from '../components/ui/Sparkline';
import { api } from '../api/client';
import { RISK_CASES, INITIAL_AUDIT_LOGS } from '../data/syntheticData';

// Chart Tooltip Component
function CustomChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface-raised)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-sm)',
        padding: '8px 12px',
        fontSize: 'var(--text-xs)',
        boxShadow: 'var(--shadow-md)',
        color: 'var(--text-primary)'
      }}
    >
      <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
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
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: entry.color
              }}
            />
            <span style={{ color: 'var(--text-secondary)' }}>{entry.name}:</span>
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function OverviewView({
  onNavigate,
  onSelectInstitution,
  quarantinedLender = false
}) {
  const [copiedHash, setCopiedHash] = useState(null);
  const [liveCases, setLiveCases] = useState(RISK_CASES);
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);
  const [lastVerifiedTime] = useState('2m ago');

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [casesRes, auditRes] = await Promise.all([
          api.getCases().catch(() => null),
          api.getAuditLogs().catch(() => null)
        ]);

        if (!isMounted) return;

        if (Array.isArray(casesRes) && casesRes.length > 0) {
          setLiveCases(casesRes);
        }
        if (Array.isArray(auditRes) && auditRes.length > 0) {
          setAuditLogs(auditRes);
        }
      } catch (err) {
        if (!isMounted) return;
        console.warn('Overview data fetch notice:', err);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, []);

  const handleCopyHash = (hash, eventId) => {
    navigator.clipboard?.writeText(hash);
    setCopiedHash(eventId);
    setTimeout(() => setCopiedHash(null), 1500);
  };

  // Mock Realistic Chart Data (Alerts Over Time - 7 Days)
  const alertsChartData = [
    { time: 'Mon', bankA: 28, insurerB: 14, lenderC: 42, collaborativeAlerts: 8 },
    { time: 'Tue', bankA: 34, insurerB: 18, lenderC: 49, collaborativeAlerts: 11 },
    { time: 'Wed', bankA: 40, insurerB: 22, lenderC: 61, collaborativeAlerts: 16 },
    { time: 'Thu', bankA: 38, insurerB: 19, lenderC: 58, collaborativeAlerts: 14 },
    { time: 'Fri', bankA: 52, insurerB: 31, lenderC: 78, collaborativeAlerts: 24 },
    { time: 'Sat', bankA: 46, insurerB: 24, lenderC: 66, collaborativeAlerts: 19 },
    { time: 'Sun', bankA: 35, insurerB: 17, lenderC: 53, collaborativeAlerts: 12 }
  ];

  // Risk Score Distribution Histogram Data (5 Color-Coded Bands)
  const distributionData = [
    { band: '0-20', label: 'Low', count: 642, color: 'var(--risk-low)' },
    { band: '20-40', label: 'Low-Med', count: 388, color: 'var(--chart-1)' },
    { band: '40-60', label: 'Medium', count: 184, color: 'var(--risk-medium)' },
    { band: '60-80', label: 'High', count: 52, color: 'var(--risk-high)' },
    { band: '80-100', label: 'Critical', count: 18, color: 'var(--risk-critical)' }
  ];

  const recentCases = liveCases.slice(0, 5);
  const recentAudit = auditLogs.slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {/* Page Header: Title, Subtitle, & Primary Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '12px',
          paddingBottom: '4px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1
              style={{
                fontSize: 'var(--text-xl)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                margin: 0
              }}
            >
              Executive Risk Intelligence
            </h1>
            <Badge variant="cyan" size="sm">
              Split Learning Active
            </Badge>
            <Badge variant="neutral" size="sm">
              Round #27
            </Badge>
          </div>
          <p
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
              marginTop: '4px',
              margin: 0
            }}
          >
            Real-time cross-institution systemic risk intelligence across 3 sovereign financial nodes.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('collaborative_risk')}
          >
            <span>Explore Cases ({liveCases.length})</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<Sparkles size={13} />}
            onClick={() => onNavigate('simulation_lab')}
          >
            <span>Launch Simulation Lab</span>
          </Button>
        </div>
      </div>

      {/* Row 1: 5 KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: 'var(--space-2)'
        }}
      >
        {/* KPI 1: Fraud Prevented */}
        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Fraud Prevented
            </span>
            <Chip value="+14.2%" trend="up" isGood={true} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '6px' }}>
            <div
              style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em'
              }}
            >
              $4.82M
            </div>
            <Sparkline data={[2.9, 3.2, 3.5, 3.9, 4.1, 4.5, 4.82]} color="var(--primary)" width={72} height={24} />
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Estimated risk exposure averted
          </div>
        </Card>

        {/* KPI 2: Loan-Stacking Alerts */}
        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Loan-Stacking Alerts
            </span>
            <Chip value="-8.4%" trend="down" isGood={true} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '6px' }}>
            <div
              style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em'
              }}
            >
              142
            </div>
            <Sparkline data={[168, 160, 172, 155, 150, 146, 142]} color="var(--accent-cyan)" width={72} height={24} />
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Multi-lender velocity flags
          </div>
        </Card>

        {/* KPI 3: Active Institutions */}
        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Active Institutions
            </span>
            <Badge variant="success" size="sm">
              3 Online
            </Badge>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '6px' }}>
            <div
              style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em'
              }}
            >
              3 / 3
            </div>
            <Sparkline data={[3, 3, 3, 3, 3, 3, 3]} color="var(--success)" width={72} height={24} />
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Bank A, Insurer B, Lender C
          </div>
        </Card>

        {/* KPI 4: Collaborative Model AUC */}
        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Model ROC-AUC
            </span>
            <Chip value="+0.018" trend="up" isGood={true} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '6px' }}>
            <div
              style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em'
              }}
            >
              0.972
            </div>
            <Sparkline data={[0.91, 0.93, 0.94, 0.952, 0.961, 0.968, 0.972]} color="var(--primary)" width={72} height={24} />
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Vertical Split Learning benchmark
          </div>
        </Card>

        {/* KPI 5: Avg. Score Latency */}
        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Avg. Score Latency
            </span>
            <Chip value="-14ms" trend="down" isGood={true} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '6px' }}>
            <div
              style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em'
              }}
            >
              148ms
            </div>
            <Sparkline data={[182, 174, 168, 162, 155, 151, 148]} color="var(--success)" width={72} height={24} />
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '4px' }}>
            P95 blinded RPC round-trip
          </div>
        </Card>
      </div>

      {/* Row 2: Charts Area (2/3 Alerts-Over-Time Area Chart + 1/3 Risk-Score Distribution Histogram) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: 'var(--space-2)'
        }}
      >
        {/* Left Chart: Alerts Over Time Area Chart */}
        <Card
          title="Cross-Institution Risk Inquiries & Alert Signals"
          subtitle="Chronological volume of local inquiries vs synthesized collaborative alerts"
          action={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--chart-1)' }} />
                Bank A
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--chart-2)' }} />
                Insurer B
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--chart-3)' }} />
                Lender C
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', color: 'var(--text-primary)', fontWeight: 600 }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--chart-4)' }} />
                Joint Flag
              </span>
            </div>
          }
        >
          <div style={{ height: '230px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={alertsChartData} margin={{ top: 8, right: 10, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradBank" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="gradInsurer" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#22D3EE" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="gradLender" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FBBF24" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#FBBF24" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="gradCollab" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FB7185" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#FB7185" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <RechartsTooltip content={<CustomChartTooltip />} />
                <Area type="monotone" dataKey="bankA" name="Bank A" stroke="#3B82F6" strokeWidth={1.6} fill="url(#gradBank)" />
                <Area type="monotone" dataKey="insurerB" name="Insurer B" stroke="#22D3EE" strokeWidth={1.6} fill="url(#gradInsurer)" />
                <Area type="monotone" dataKey="lenderC" name="Lender C" stroke="#FBBF24" strokeWidth={1.6} fill="url(#gradLender)" />
                <Area type="monotone" dataKey="collaborativeAlerts" name="Joint Risk Flag" stroke="#FB7185" strokeWidth={2.2} fill="url(#gradCollab)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Right Chart: Risk-Score Distribution Histogram */}
        <Card
          title="Risk Score Distribution"
          subtitle="Score frequencies across 1,284 evaluated customer entities"
        >
          <div style={{ height: '230px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData} margin={{ top: 8, right: 10, left: -24, bottom: 0 }}>
                <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="band" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <RechartsTooltip content={<CustomChartTooltip />} />
                <Bar dataKey="count" name="Evaluated Entities" radius={[4, 4, 0, 0]}>
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Row 3: Strips (Institution Network Health Strip + Differential Privacy Budget Gauge) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: 'var(--space-2)'
        }}
      >
        {/* Left: Institution Network Health Strip */}
        <Card
          title="Sovereign Participant Node Health"
          subtitle="Zero raw feature exchange: Nodes compute partial logits on-premise"
          action={
            <Button
              variant="outline"
              size="xs"
              onClick={() => onNavigate('institutions')}
            >
              <span>Manage Nodes</span>
              <ArrowRight size={11} />
            </Button>
          }
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '10px' }}>
            {/* Node 1: Bank A */}
            <div
              onClick={() => onSelectInstitution && onSelectInstitution('BANK_A')}
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-default)',
                cursor: 'pointer',
                transition: 'border-color var(--transition-fast)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <Building size={14} color="var(--primary-hover)" />
                  <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>BANK A NODE</span>
                </div>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', color: 'var(--success)' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--success)', display: 'inline-block' }} />
                  Online
                </span>
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                Retail & Commercial Banking
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                <span>Sync: <strong style={{ color: 'var(--text-primary)' }}>38s ago</strong></span>
                <Badge variant="cyan" size="sm">250k Synthetic</Badge>
              </div>
            </div>

            {/* Node 2: Insurer B */}
            <div
              onClick={() => onSelectInstitution && onSelectInstitution('INSURER_B')}
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-default)',
                cursor: 'pointer',
                transition: 'border-color var(--transition-fast)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-cyan)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <ShieldCheck size={14} color="var(--accent-cyan)" />
                  <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>INSURER B NODE</span>
                </div>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', color: 'var(--success)' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--success)', display: 'inline-block' }} />
                  Online
                </span>
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                General & Life Claims
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                <span>Sync: <strong style={{ color: 'var(--text-primary)' }}>52s ago</strong></span>
                <Badge variant="cyan" size="sm">118k Synthetic</Badge>
              </div>
            </div>

            {/* Node 3: Lender C */}
            <div
              onClick={() => onSelectInstitution && onSelectInstitution('LENDER_C')}
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface-raised)',
                border: quarantinedLender ? '1px solid var(--danger)' : '1px solid var(--border-default)',
                cursor: 'pointer',
                transition: 'border-color var(--transition-fast)'
              }}
              onMouseEnter={(e) => { if (!quarantinedLender) e.currentTarget.style.borderColor = 'var(--warning)'; }}
              onMouseLeave={(e) => { if (!quarantinedLender) e.currentTarget.style.borderColor = 'var(--border-default)'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <Activity size={14} color={quarantinedLender ? 'var(--danger)' : 'var(--warning)'} />
                  <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>LENDER C NODE</span>
                </div>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', color: quarantinedLender ? 'var(--danger)' : 'var(--success)' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: quarantinedLender ? 'var(--danger)' : 'var(--success)', display: 'inline-block' }} />
                  {quarantinedLender ? 'Quarantined' : 'Online'}
                </span>
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                Digital Credit & Loan Facilities
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                <span>Trust: <strong style={{ color: quarantinedLender ? 'var(--danger)' : 'var(--text-primary)' }}>{quarantinedLender ? '63%' : '89%'}</strong></span>
                <Badge variant={quarantinedLender ? 'danger' : 'cyan'} size="sm">
                  {quarantinedLender ? 'Quarantine Active' : '184k Synthetic'}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Right: Differential Privacy Budget Gauge */}
        <Card
          title="Differential Privacy Budget"
          subtitle="Gaussian Mechanism (σ=1.0, δ=10⁻⁵)"
          action={
            <Button
              variant="outline"
              size="xs"
              onClick={() => onNavigate('privacy_center')}
            >
              <span>Audit</span>
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Cumulative ε Spent
                </span>
                <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', marginTop: '2px' }}>
                  1.42 <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: 400 }}>/ 3.0 ε cap</span>
                </div>
              </div>
              <Badge variant="success" size="sm">
                47.3% Consumed
              </Badge>
            </div>

            {/* Gauge Progress Bar */}
            <div
              style={{
                height: '8px',
                width: '100%',
                backgroundColor: 'var(--bg-app)',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden',
                border: '1px solid var(--border-default)'
              }}
            >
              <div
                style={{
                  width: '47.3%',
                  height: '100%',
                  backgroundColor: 'var(--primary)',
                  borderRadius: 'var(--radius-full)'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              <span>Noise Calibration: <strong>Optimal (σ=1.0)</strong></span>
              <span>Remaining: <strong style={{ color: 'var(--success)' }}>1.58 ε</strong></span>
            </div>
          </div>
        </Card>
      </div>

      {/* Row 4: High-Risk Cases Table (3/5) + Audit Trail Panel (2/5) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '3fr 2fr',
          gap: 'var(--space-2)'
        }}
      >
        {/* Left: Recent High-Risk Cases Table */}
        <Card
          title="Priority Cross-Institution Cases"
          subtitle="Entities triggering collaborative correlation across disparate nodes"
          action={
            <Button
              variant="outline"
              size="xs"
              onClick={() => onNavigate('collaborative_risk')}
            >
              <span>View All Cases</span>
              <ArrowRight size={11} />
            </Button>
          }
        >
          <div style={{ overflowX: 'auto', margin: '-6px -18px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-xs)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-default)', textAlign: 'left' }}>
                  <th style={{ padding: '8px 18px', color: 'var(--text-muted)', fontWeight: 600 }}>Case ID</th>
                  <th style={{ padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>Risk Tier</th>
                  <th style={{ padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>Confidence</th>
                  <th style={{ padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>Nodes</th>
                  <th style={{ padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '8px 18px', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 600 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentCases.map((c) => {
                  const isHigh = c.riskLevel === 'HIGH';
                  const isCritical = c.riskLevel === 'CRITICAL';
                  const isMed = c.riskLevel === 'MEDIUM';

                  return (
                    <tr
                      key={c.id}
                      style={{
                        borderBottom: '1px solid var(--border-default)',
                        transition: 'background-color var(--transition-fast)'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <td style={{ padding: '10px 18px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{c.id}</span>
                          {c.id === 'CASE-10482' && (
                            <Badge variant="cyan" size="sm">Benchmark</Badge>
                          )}
                        </div>
                      </td>

                      <td style={{ padding: '10px 12px' }}>
                        <Badge
                          variant={isCritical ? 'risk-critical' : isHigh ? 'risk-high' : isMed ? 'risk-medium' : 'risk-low'}
                          size="sm"
                        >
                          {c.riskLevel}
                        </Badge>
                      </td>

                      <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {c.confidence || c.score}%
                      </td>

                      <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>A • B • C</span>
                      </td>

                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                          {c.status || 'NORMAL'}
                        </span>
                      </td>

                      <td style={{ padding: '10px 18px', textAlign: 'right' }}>
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => onNavigate('customer_investigation')}
                        >
                          <Eye size={12} />
                          <span>Inspect</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Right: Cryptographic Audit Trail Panel */}
        <Card
          title="Cryptographic Audit Trail"
          subtitle="Tamper-evident SHA-256 event ledger linked to genesis block"
          action={
            <Badge variant="success" size="sm">
              <ShieldCheck size={11} style={{ marginRight: '3px' }} />
              Chain Verified ({lastVerifiedTime})
            </Badge>
          }
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Genesis Hash: <code style={{ color: 'var(--text-primary)' }}>00000000...0000</code></span>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => onNavigate('audit_trail')}
              >
                <span>Full Audit Ledger</span>
                <ArrowRight size={11} />
              </Button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentAudit.map((log, idx) => {
              const eventId = log.event_id || log.id || `EVT-${idx}`;
              const fullHash = log.fullHash || log.hash || '0x00';
              const truncHash = fullHash.length > 16
                ? `${fullHash.slice(0, 8)}...${fullHash.slice(-6)}`
                : fullHash;
              const isCopied = copiedHash === eventId;

              return (
                <div
                  key={eventId}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-surface-raised)',
                    border: '1px solid var(--border-default)',
                    fontSize: 'var(--text-xs)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px'
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {log.details || log.event || log.action || 'System Verification Event'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '11px' }}>
                      <span>{log.institution || 'COORDINATOR'}</span>
                      <span>•</span>
                      <span>{log.timestamp || 'Just now'}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                    <code
                      style={{
                        padding: '2px 5px',
                        backgroundColor: 'var(--bg-app)',
                        borderRadius: 'var(--radius-xs)',
                        border: '1px solid var(--border-default)',
                        color: 'var(--accent-cyan)',
                        fontSize: '11px'
                      }}
                    >
                      {truncHash}
                    </code>
                    <button
                      onClick={() => handleCopyHash(fullHash, eventId)}
                      title="Copy full SHA-256 block hash"
                      style={{
                        padding: '3px 4px',
                        borderRadius: 'var(--radius-xs)',
                        color: isCopied ? 'var(--success)' : 'var(--text-muted)',
                        backgroundColor: 'transparent'
                      }}
                    >
                      {isCopied ? <Check size={12} strokeWidth={2.4} /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
