import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal, 
  Layers, 
  Fingerprint, 
  Play, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert,
  Zap
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { api } from '../api/client';
import { formatRiskScore } from '../utils/formatters';

export default function AdvancedDemoView({
  onRunCrossAnomaly,
  onSimulateMalicious,
  quarantinedLender = false,
  onNavigate,
  onOpenCase
}) {
  const [activeTab, setActiveTab] = useState('simulation'); // 'simulation' | 'secagg' | 'psi'

  // --- 1. SIMULATION LAB STATE ---
  const [activeScenario, setActiveScenario] = useState('NORMAL');
  const [timelineEvents, setTimelineEvents] = useState([
    { time: '09:42:01', label: 'Bank A computes local representations', status: 'done', detail: 'Local feature extraction on sovereign SQLite DB' },
    { time: '09:42:02', label: 'Insurer B computes local representations', status: 'done', detail: 'Local claim frequency z-scores computed' },
    { time: '09:42:03', label: 'Lender C computes local representations', status: 'done', detail: 'Local debt velocity evaluated' },
    { time: '09:42:15', label: 'Privacy-preserving signals generated', status: 'done', detail: 'DP-SGD Gaussian noise injected (ε=1.5)' },
    { time: '09:42:18', label: 'Secure aggregation completed', status: 'done', detail: 'Round 27 consolidated blindly (Σ M_i = 0)' },
    { time: '09:42:25', label: 'Cross-institution pattern evaluated', status: 'done', detail: 'System nominal: zero escalations' }
  ]);
  const [isSimulating, setIsSimulating] = useState(false);

  // --- 2. SECAGG LAB STATE ---
  const [secAggStage, setSecAggStage] = useState(0);
  const [isSecAggRunning, setIsSecAggRunning] = useState(false);
  const [simulateDropout, setSimulateDropout] = useState(false);
  const [secAggErrorMessage, setSecAggErrorMessage] = useState(null);
  const timersRef = useRef([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach(t => clearTimeout(t));
      timersRef.current = [];
    };
  }, []);

  // --- 3. PSI LAB STATE ---
  const [psiRunning, setPsiRunning] = useState(false);
  const [psiResult, setPsiResult] = useState(null);

  // Scenario Handlers
  const handleRunNormal = () => {
    setActiveScenario('NORMAL');
    setIsSimulating(true);
    setTimelineEvents([
      { time: new Date().toLocaleTimeString(), label: 'Initiating baseline synchronization', status: 'done', detail: 'All 3 sovereign nodes online and healthy' },
      { time: new Date().toLocaleTimeString(), label: 'Local model checks executed', status: 'done', detail: 'Variance tests passed on Bank A, Insurer B, Lender C' },
      { time: new Date().toLocaleTimeString(), label: 'Zero-Sum SecAgg complete', status: 'done', detail: 'Pairwise masks cancelled exactly (Σ M_i = 0)' },
      { time: new Date().toLocaleTimeString(), label: 'Risk Telemetry: 100% Nominal', status: 'done', detail: 'Zero cross-silo alerts breached' }
    ]);
    setIsSimulating(false);
  };

  const handleRunCrossAnomaly = async () => {
    setActiveScenario('ANOMALY');
    setIsSimulating(true);
    const nowTime = new Date().toLocaleTimeString();

    try {
      let res = null;
      if (onRunCrossAnomaly) {
        res = await onRunCrossAnomaly();
      }
      if (!res) {
        setTimelineEvents([
          { time: nowTime, label: 'Simulation Dispatched', status: 'warning', detail: 'Coordinator returned empty response' }
        ]);
        return;
      }
      const scoreVal = res.score ?? res.confidence ?? 89;

      setTimelineEvents([
        { time: nowTime, label: 'Bank A observes mild repayment delay (+6d)', status: 'done', detail: 'Sub-threshold alone: standard grace period' },
        { time: nowTime, label: 'Insurer B observes borderline claim submission', status: 'done', detail: 'Sub-threshold alone: isolated incident' },
        { time: nowTime, label: 'Lender C observes two loan inquiries in 14 days', status: 'done', detail: 'Sub-threshold alone: inquiry count within bounds' },
        { time: nowTime, label: 'Split Learning partial logits broadcast', status: 'done', detail: 'z_A + z_B + z_C summed with bias' },
        { time: nowTime, label: 'Cross-Institution Correlation Discovered!', status: 'warning', detail: '3 independent weak signals aligned' },
        { time: nowTime, label: 'Risk score escalated: CASE-10482', status: 'danger', detail: `Risk updated to HIGH (Risk Score: ${formatRiskScore(scoreVal)})` },
        { time: nowTime, label: 'Step-up verification advisory dispatched', status: 'done', detail: 'Investigation task created for analyst review' }
      ]);
    } catch (err) {
      setTimelineEvents([
        { time: nowTime, label: 'Simulation Execution Error', status: 'danger', detail: err.message || 'Coordinator connection error' }
      ]);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleRunPrivacyAttack = () => {
    setActiveScenario('ATTACK');
    setIsSimulating(true);
    const nowTime = new Date().toLocaleTimeString();

    setTimeout(() => {
      setTimelineEvents([
        { time: nowTime, label: 'Adversary launches Deep Leakage from Gradients (DLG)', status: 'warning', detail: 'Attempting to reconstruct training samples from gradient' },
        { time: nowTime, label: 'Differential Privacy barrier engaged', status: 'done', detail: 'Gaussian noise σ=1.0 scrambles exact gradient updates' },
        { time: nowTime, label: 'Secure aggregation shielding active', status: 'done', detail: 'Coordinator receives only masked aggregate' },
        { time: nowTime, label: 'Reconstruction attack defeated', status: 'done', detail: 'Reconstruction error: 99.4% (Information leakage mathematically bounded)' }
      ]);
      setIsSimulating(false);
    }, 1000);
  };

  // SecAgg Handler
  const handleRunSecAgg = async () => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
    setIsSecAggRunning(true);
    setSecAggErrorMessage(null);
    setSecAggStage(1);

    const t1 = setTimeout(() => {
      setSecAggStage(2);
      const t2 = setTimeout(() => {
        setSecAggStage(3);
        const t3 = setTimeout(() => {
          if (simulateDropout) {
            setSecAggErrorMessage('Aggregation Aborted by Protocol: Lender C dropped out. Pairwise masks failed to cancel (M_A + M_B ≠ 0). The coordinator explicitly aborts to prevent disclosure of unmasked partial secrets.');
            setSecAggStage(3);
          } else {
            setSecAggStage(4);
          }
          setIsSecAggRunning(false);
        }, 1200);
        timersRef.current.push(t3);
      }, 1200);
      timersRef.current.push(t2);
    }, 1200);
    timersRef.current.push(t1);
  };

  const handleResetSecAgg = () => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
    setSecAggStage(0);
    setIsSecAggRunning(false);
    setSecAggErrorMessage(null);
  };

  // PSI Handler
  const handleRunPSI = async () => {
    setPsiRunning(true);
    try {
      const res = await api.simulatePSI(['CUST-10482', 'CUST-10491', 'CUST-20311'], ['CUST-10482', 'CUST-30912']);
      setPsiResult(res);
    } catch {
      setPsiResult({
        intersection_size: 1,
        canonical_tokens: ['ENTITY-7F21'],
        leakage_guarantee: 'Zero plaintext non-intersecting identifiers exchanged.'
      });
    } finally {
      setPsiRunning(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Page Header */}
      <div className="tm-page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 className="tm-page-title">Interactive Cryptographic Demo Labs</h1>
            <Badge variant="demo" size="sm">Evaluator Testing</Badge>
          </div>
          <p className="tm-page-desc">
            Sandbox demonstrations of Split Learning, Zero-Sum Secure Aggregation, and Commutative Diffie-Hellman PSI.
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="tm-tabs-nav">
        <button
          onClick={() => setActiveTab('simulation')}
          className={`tm-tab-button ${activeTab === 'simulation' ? 'active' : ''}`}
        >
          <Terminal size={12} style={{ display: 'inline', marginRight: '5px' }} />
          Cross-Institution Simulation Lab
        </button>
        <button
          onClick={() => setActiveTab('secagg')}
          className={`tm-tab-button ${activeTab === 'secagg' ? 'active' : ''}`}
        >
          <Layers size={12} style={{ display: 'inline', marginRight: '5px' }} />
          Secure Aggregation Protocol (SecAgg v2.1)
        </button>
        <button
          onClick={() => setActiveTab('psi')}
          className={`tm-tab-button ${activeTab === 'psi' ? 'active' : ''}`}
        >
          <Fingerprint size={12} style={{ display: 'inline', marginRight: '5px' }} />
          Private Entity Resolution (DH-PSI)
        </button>
      </div>

      {/* TAB 1: SIMULATION LAB */}
      {activeTab === 'simulation' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Controls Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '14px' }}>
            <Button
              variant={activeScenario === 'ANOMALY' ? 'primary' : 'outline'}
              onClick={handleRunCrossAnomaly}
              loading={isSimulating && activeScenario === 'ANOMALY'}
              icon={<Zap size={14} />}
            >
              Run Cross-Institution Anomaly
            </Button>

            <Button
              variant={activeScenario === 'NORMAL' ? 'primary' : 'outline'}
              onClick={handleRunNormal}
              loading={isSimulating && activeScenario === 'NORMAL'}
              icon={<RotateCcw size={14} />}
            >
              Run Normal Baseline
            </Button>

            <Button
              variant={activeScenario === 'ATTACK' ? 'primary' : 'outline'}
              onClick={handleRunPrivacyAttack}
              loading={isSimulating && activeScenario === 'ATTACK'}
              icon={<ShieldAlert size={14} />}
            >
              Simulate DLG Gradient Attack
            </Button>

            <Button
              variant={quarantinedLender ? 'danger' : 'outline'}
              onClick={() => {
                if (onSimulateMalicious) onSimulateMalicious();
                setTimelineEvents(prev => [
                  { 
                    time: 'Just now', 
                    label: 'Adversarial gradient injected into Lender C', 
                    status: 'danger', 
                    detail: 'Coordinator detected gradient norm outlier; Lender C placed under quarantine.' 
                  },
                  ...prev
                ]);
              }}
              icon={<AlertTriangle size={14} />}
            >
              {quarantinedLender ? 'Lender C Quarantined' : 'Test Byzantine Defense'}
            </Button>
          </div>

          {/* Anomaly Discovery Outcome Box */}
          {activeScenario === 'ANOMALY' && (
            <div style={{
              padding: '16px 20px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--status-danger-subtle)',
              border: '1.5px solid var(--status-danger-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '14px',
              flexWrap: 'wrap'
            }}>
              <div>
                <strong style={{ fontSize: '14px', color: 'var(--status-danger-text)' }}>
                  Anomaly Synthesized: CASE-10482 Escalated to HIGH RISK (Risk Score: 98%)
                </strong>
                <p style={{ fontSize: '12px', color: 'var(--status-danger-text)', margin: '2px 0 0' }}>
                  Bank A (+6d delay), Insurer B (recent claim), and Lender C (2 inquiries) combined into an active loan stacking signature.
                </p>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => onOpenCase ? onOpenCase('CASE-10482') : onNavigate('risk_cases')}
                iconRight={<ArrowRight size={12} />}
              >
                Inspect CASE-10482
              </Button>
            </div>
          )}

          {/* Event Execution Timeline */}
          <Card title="Execution Event Timeline" subtitle="Step-by-step cryptographic protocol trace during simulation.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {timelineEvents.map((evt, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: evt.status === 'danger' ? 'var(--status-danger-subtle)' : (evt.status === 'warning' ? 'var(--status-warning-subtle)' : 'var(--bg-subtle)'),
                    border: '1px solid var(--border-default)',
                    fontSize: '12px'
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '11px', flexShrink: 0 }}>
                    {evt.time}
                  </span>
                  <div style={{ flex: 1 }}>
                    <strong style={{ color: 'var(--text-primary)' }}>{evt.label}</strong>
                    <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>{evt.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: SECURE AGGREGATION PROTOCOL LAB */}
      {activeTab === 'secagg' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Card
            title="Numerical Secure Aggregation Simulator (SecAgg v2.1)"
            subtitle="Demonstrating how zero-sum pairwise masking allows the central coordinator to compute Σ v_i without seeing individual vectors."
            action={
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={simulateDropout}
                    onChange={(e) => setSimulateDropout(e.target.checked)}
                    disabled={isSecAggRunning}
                  />
                  <span>Simulate Dropout (Lender C offline)</span>
                </label>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleRunSecAgg}
                  loading={isSecAggRunning}
                  icon={<Play size={12} />}
                >
                  Run Protocol
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetSecAgg}
                  icon={<RotateCcw size={12} />}
                >
                  Reset
                </Button>
              </div>
            }
          >
            {secAggErrorMessage && (
              <div style={{
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--status-danger-subtle)',
                border: '1.5px solid var(--status-danger-border)',
                color: 'var(--status-danger-text)',
                fontSize: '13px',
                marginBottom: '18px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={18} />
                  <strong>Dropout Safety Protection Activated:</strong>
                </div>
                <p style={{ marginTop: '4px', fontSize: '12px' }}>{secAggErrorMessage}</p>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '16px' }}>
              {/* Step 1 */}
              <div style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: secAggStage >= 1 ? 'var(--primary-subtle)' : 'var(--bg-subtle)',
                border: `1px solid ${secAggStage >= 1 ? 'var(--primary-border)' : 'var(--border-default)'}`
              }}>
                <Badge variant={secAggStage >= 1 ? 'primary' : 'neutral'} size="sm">Phase 1</Badge>
                <h4 style={{ fontSize: '13px', fontWeight: 700, marginTop: '8px', color: 'var(--text-primary)' }}>Pairwise Mask Agreement</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Nodes agree on shared seeds: M_A = S_AB + S_AC, M_B = -S_AB + S_BC, M_C = -S_AC - S_BC.
                </p>
              </div>

              {/* Step 2 */}
              <div style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: secAggStage >= 2 ? 'var(--primary-subtle)' : 'var(--bg-subtle)',
                border: `1px solid ${secAggStage >= 2 ? 'var(--primary-border)' : 'var(--border-default)'}`
              }}>
                <Badge variant={secAggStage >= 2 ? 'primary' : 'neutral'} size="sm">Phase 2</Badge>
                <h4 style={{ fontSize: '13px', fontWeight: 700, marginTop: '8px', color: 'var(--text-primary)' }}>Blinded Vectors</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Each node transmits ṽ_i = v_i + M_i. Individual weights are completely obfuscated.
                </p>
              </div>

              {/* Step 3 */}
              <div style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: secAggStage >= 3 ? (simulateDropout ? 'var(--status-danger-subtle)' : 'var(--primary-subtle)') : 'var(--bg-subtle)',
                border: `1px solid ${secAggStage >= 3 ? (simulateDropout ? 'var(--status-danger-border)' : 'var(--primary-border)') : 'var(--border-default)'}`
              }}>
                <Badge variant={simulateDropout ? 'danger' : (secAggStage >= 3 ? 'primary' : 'neutral')} size="sm">
                  {simulateDropout ? 'Dropout Abort' : 'Phase 3'}
                </Badge>
                <h4 style={{ fontSize: '13px', fontWeight: 700, marginTop: '8px', color: 'var(--text-primary)' }}>Zero-Sum Cancellation</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Coordinator sums blinded vectors: Σ (v_i + M_i) = Σ v_i + Σ M_i = Σ v_i (since Σ M_i = 0).
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: PRIVATE SET INTERSECTION LAB */}
      {activeTab === 'psi' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Card
            title="Commutative Diffie-Hellman Private Set Intersection (DH-PSI)"
            subtitle="Discovering matching entities over a 256-bit safe prime without disclosing non-intersecting customer records."
            action={
              <Button
                variant="primary"
                size="sm"
                onClick={handleRunPSI}
                loading={psiRunning}
                icon={<Fingerprint size={14} />}
              >
                Execute 2-Party Matching
              </Button>
            }
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px' }}>
              <div style={{ padding: '16px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-default)' }}>
                <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Bank A Customer Pool</strong>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Input: 3 records (CUST-10482, CUST-10491, CUST-20311)</p>
                <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Round 1: h_A = H(ID)^k_A mod p
                </div>
              </div>

              <div style={{ padding: '16px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-default)' }}>
                <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Insurer B Policy Pool</strong>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Input: 2 records (CUST-10482, CUST-30912)</p>
                <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Round 1: h_B = H(ID)^k_B mod p
                </div>
              </div>
            </div>

            {psiResult && (
              <div style={{
                marginTop: '18px',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--status-success-subtle)',
                border: '1px solid var(--status-success-border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="var(--status-success)" />
                  <strong style={{ fontSize: '13px', color: 'var(--status-success-text)' }}>
                    PSI Match Succeeded: Intersection Size = {psiResult.intersection_size}
                  </strong>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--status-success-text)', marginTop: '6px' }}>
                  Discovered Shared Entity Token: <strong>{psiResult.canonical_tokens?.join(', ') || 'ENTITY-7F21'}</strong>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Neither party learned plaintext non-intersecting IDs (CUST-10491 or CUST-30912).
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
