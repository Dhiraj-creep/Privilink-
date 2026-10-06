import React, { useState } from 'react';
import { 
  CheckCircle2, 
  TrendingUp, 
  EyeOff, 
  ArrowRight,
  ShieldAlert,
  Zap
} from 'lucide-react';

export default function SimulationLabView({ 
  onRunCrossAnomaly, 
  onSimulateMalicious, 
  onNavigate,
  onOpenCase 
}) {
  const [activeScenario, setActiveScenario] = useState('NORMAL');
  const [timelineEvents, setTimelineEvents] = useState([
    { time: '09:42:01', label: 'Bank A processes local data', status: 'done', detail: 'Local feature extraction complete (250k synthetic records)' },
    { time: '09:42:02', label: 'Insurer B processes local data', status: 'done', detail: 'Local claim frequency z-scores computed' },
    { time: '09:42:03', label: 'Lender C processes local data', status: 'done', detail: 'Local borrowing stress evaluated' },
    { time: '09:42:15', label: 'Privacy-preserving signals generated', status: 'done', detail: 'DP-SGD Gaussian noise injected (ε=1.5)' },
    { time: '09:42:18', label: 'Secure aggregation completed', status: 'done', detail: 'Round 27 consolidated blindly' },
    { time: '09:42:25', label: 'Cross-institution pattern evaluated', status: 'done', detail: 'System nominal: zero escalations' }
  ]);
  const [isSimulating, setIsSimulating] = useState(false);

  // 1. Run Normal Scenario
  const handleRunNormal = () => {
    setActiveScenario('NORMAL');
    setIsSimulating(true);
    setTimelineEvents([
      { time: '10:01:00', label: 'Initiating baseline synchronization', status: 'active', detail: 'Polling 3 connected institution nodes' }
    ]);

    setTimeout(() => {
      setTimelineEvents([
        { time: '10:01:00', label: 'Initiating baseline synchronization', status: 'done', detail: 'All 3 nodes online and healthy' },
        { time: '10:01:04', label: 'Local model checks executed', status: 'done', detail: 'Bank A, Insurer B, Lender C passed variance test' },
        { time: '10:01:08', label: 'Numerical Secure Aggregation complete', status: 'done', detail: 'Global model weights updated without error' },
        { time: '10:01:12', label: 'Risk Telemetry: 100% Nominal', status: 'done', detail: 'Zero anomalies flagged across 1,284 customer entities' }
      ]);
      setIsSimulating(false);
    }, 1200);
  };

  // 2. Run Cross-Institution Anomaly Scenario (Key Demo)
  const handleRunCrossAnomaly = async () => {
    setActiveScenario('ANOMALY');
    setIsSimulating(true);
    setTimelineEvents([
      { time: new Date().toLocaleTimeString(), label: 'Scanning network for multi-signal convergence...', status: 'active', detail: 'Correlating latent vectors' }
    ]);

    let res = null;
    if (onRunCrossAnomaly) {
      res = await onRunCrossAnomaly();
    }
    const conf = res?.score || res?.confidence || 98.4;
    const nowTime = new Date().toLocaleTimeString();

    setTimelineEvents([
      { time: nowTime, label: 'Bank A processes local data', status: 'done', detail: 'Bank notes mild repayment delay (+6d) — alone below alarm threshold' },
      { time: nowTime, label: 'Insurer B processes local data', status: 'done', detail: 'Insurer notes recent borderline claim — alone below alarm threshold' },
      { time: nowTime, label: 'Lender C processes local data', status: 'done', detail: 'Lender notes two inquiries — alone below alarm threshold' },
      { time: nowTime, label: 'Privacy-preserving signals generated', status: 'done', detail: 'Differentially private latent embeddings broadcast' },
      { time: nowTime, label: 'Secure aggregation initiated', status: 'done', detail: 'Blinded aggregation computes cosine cross-similarity' },
      { time: nowTime, label: 'Cross-institution pattern detected!', status: 'warning', detail: 'CORRELATION DISCOVERED: 3 independent weak signals aligned' },
      { time: nowTime, label: 'Risk score escalated: CASE-10482', status: 'danger', detail: `Risk updated to HIGH (Confidence: ${conf}%)` },
      { time: nowTime, label: 'Explainable risk result generated', status: 'done', detail: 'Step-up verification advisory dispatched to analyst HUD' }
    ]);
    setIsSimulating(false);
  };

  // 3. Simulate Privacy Attack (Inference / Gradient Inversion)
  const handleRunPrivacyAttack = () => {
    setActiveScenario('ATTACK');
    setIsSimulating(true);

    setTimeout(() => {
      setTimelineEvents([
        { time: '10:03:00', label: 'Adversary launches Deep Leakage from Gradients (DLG)', status: 'warning', detail: 'Attempting to reconstruct training samples from gradient' },
        { time: '10:03:03', label: 'Differential Privacy barrier engaged', status: 'done', detail: 'Gaussian noise σ=1.0 scrambles pixel/feature exact gradients' },
        { time: '10:03:06', label: 'Secure aggregation shielding active', status: 'done', detail: 'Adversary cannot isolate individual institution vector' },
        { time: '10:03:09', label: 'Reconstruction attack defeated', status: 'done', detail: 'Reconstruction error: 99.4% (Information leakage mathematically bounded)' }
      ]);
      setIsSimulating(false);
    }, 1200);
  };

  // 4. Simulate Malicious Participant (Lender C)
  const handleRunMalicious = () => {
    setActiveScenario('MALICIOUS');
    setIsSimulating(true);

    setTimeout(() => {
      setTimelineEvents([
        { time: '10:04:00', label: 'Lender C submits abnormal gradient update', status: 'warning', detail: 'Gradient norm ||∇W_C|| = 14.8 (Threshold = 1.0)' },
        { time: '10:04:02', label: 'Byzantine anomaly detector triggered', status: 'danger', detail: 'Outlier gradient detected via coordinate-wise median filter' },
        { time: '10:04:05', label: 'Participant contribution reduced to 0%', status: 'danger', detail: 'Lender C trust score slashed: 89% ➔ 63%' },
        { time: '10:04:08', label: 'Lender C quarantined for forensic review', status: 'warning', detail: 'Status: Potentially compromised / anomalous participant' },
        { time: '10:04:12', label: 'Collaborative model protected', status: 'done', detail: 'Global Round 27 completed without corrupted weights' }
      ]);
      setIsSimulating(false);
      onSimulateMalicious();
    }, 1200);
  };

  // 5. Simulate Data Drift
  const handleRunConceptDrift = () => {
    setActiveScenario('DRIFT');
    setIsSimulating(true);

    setTimeout(() => {
      setTimelineEvents([
        { time: '10:05:00', label: 'Monitoring feature distribution baseline', status: 'done', detail: 'Tracking 30-day moving average shifts' },
        { time: '10:05:03', label: 'Distribution shift detected in lending sector', status: 'warning', detail: 'Macroeconomic rate adjustments induce spending velocity shift' },
        { time: '10:05:06', label: 'Model drift alert triggered', status: 'warning', detail: 'Wasserstein distance exceeded tolerance: 0.082 > 0.050' },
        { time: '10:05:09', label: 'Collaborative retraining initiated', status: 'done', detail: 'Adaptive learning rate applied to accommodate distribution shift' }
      ]);
      setIsSimulating(false);
    }, 1200);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
              Simulation Lab & Demonstration Control Center
            </h1>
            <span className="badge badge-demo">Live Event Engine</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Interactive testing harness for hackathon presentation and stress-testing edge scenarios.
          </p>
        </div>
      </div>

      {/* 5 Scenario Buttons Bar */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <span style={{ fontSize: '0.735rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Execute Pre-Configured Demonstration Scenarios:
        </span>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          marginTop: '14px'
        }}>
          <button 
            onClick={handleRunNormal}
            disabled={isSimulating}
            className={`btn ${activeScenario === 'NORMAL' ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.785rem', fontWeight: 600 }}
          >
            <CheckCircle2 size={14} />
            <span>Normal Baseline</span>
          </button>

          <button 
            onClick={handleRunCrossAnomaly}
            disabled={isSimulating}
            className={`btn ${activeScenario === 'ANOMALY' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ 
              fontSize: '0.785rem', 
              fontWeight: 700
            }}
          >
            <Zap size={14} />
            <span>Cross-Institution Anomaly</span>
          </button>

          <button 
            onClick={handleRunPrivacyAttack}
            disabled={isSimulating}
            className={`btn ${activeScenario === 'ATTACK' ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.785rem', fontWeight: 600 }}
          >
            <EyeOff size={14} />
            <span>Privacy Attack Demo</span>
          </button>

          <button 
            onClick={handleRunMalicious}
            disabled={isSimulating}
            className={`btn ${activeScenario === 'MALICIOUS' ? 'btn-danger' : 'btn-outline'}`}
            style={{ fontSize: '0.785rem', fontWeight: 600 }}
          >
            <ShieldAlert size={14} />
            <span>Malicious Participant</span>
          </button>

          <button 
            onClick={handleRunConceptDrift}
            disabled={isSimulating}
            className={`btn ${activeScenario === 'DRIFT' ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.785rem', fontWeight: 600 }}
          >
            <TrendingUp size={14} />
            <span>Concept Drift</span>
          </button>
        </div>
      </div>

      {/* Main Execution Split: Animated Timeline vs Scenario Result Telemetry */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '22px' }}>
        
        {/* Animated Event Timeline (Section 20) */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
                Live Event Timeline Execution
              </h3>
              <p style={{ fontSize: '0.765rem', color: 'var(--text-secondary)' }}>
                Real-time chronological events during federated evaluation.
              </p>
            </div>
            <span className="badge badge-success">Telemetry Stream</span>
          </div>

          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {timelineEvents.map((evt, idx) => (
              <div 
                key={idx} 
                style={{
                  display: 'flex',
                  gap: '14px',
                  alignItems: 'flex-start',
                  position: 'relative'
                }}
              >
                <div style={{
                  padding: '4px 8px',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-light)',
                  flexShrink: 0
                }}>
                  {evt.time}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: 600,
                    fontSize: '0.825rem',
                    color: evt.status === 'danger' ? 'var(--danger-text)' : evt.status === 'warning' ? 'var(--warning-text)' : 'var(--primary-dark)'
                  }}>
                    {evt.label}
                  </div>
                  <p style={{ fontSize: '0.735rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {evt.detail}
                  </p>
                </div>

                <span className={`badge ${
                  evt.status === 'danger' ? 'badge-danger' : 
                  evt.status === 'warning' ? 'badge-warning' : 
                  evt.status === 'active' ? 'badge-primary' : 'badge-success'
                }`} style={{ fontSize: '0.625rem' }}>
                  {evt.status === 'active' ? 'Processing' : 'OK'}
                </span>
              </div>
            ))}

            {activeScenario === 'ANOMALY' && (
              <div style={{
                marginTop: '12px',
                padding: '14px 16px',
                backgroundColor: 'var(--sage-light)',
                border: '1px solid var(--sage-border)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-dark)' }}>
                  Case CASE-10482 Ready For Human Investigation
                </span>
                <button
                  onClick={() => {
                    if (onOpenCase) {
                      onOpenCase('CASE-10482');
                    } else {
                      onNavigate('customer_investigation');
                    }
                  }}
                  className="btn btn-primary btn-sm"
                  style={{ padding: '5px 12px', fontSize: '0.725rem' }}
                >
                  <span>Open Case CASE-10482</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Educational Scenarios (Section 21 Attack & Section 22 Drift) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Section 21: Privacy Attack Demo */}
          <div className="card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <EyeOff size={16} color="var(--warning)" />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
                  Privacy Attack Benchmark (Gradient Inversion)
                </h3>
              </div>
              <span className="badge badge-demo" style={{ fontSize: '0.65rem' }}>Educational Demo</span>
            </div>

            <p style={{ fontSize: '0.765rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Scenario: An attacker intercepts model updates to reconstruct raw private records.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={{ padding: '14px', backgroundColor: 'var(--danger-light)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--danger-border)', fontSize: '0.735rem' }}>
                <strong style={{ color: 'var(--danger-text)' }}>Standard FL (No Noise)</strong>
                <p style={{ color: 'var(--danger-text)', marginTop: '4px', lineHeight: 1.45 }}>
                  • Leakage Risk: <strong>Elevated</strong><br/>
                  • Raw gradients unmasked<br/>
                  • Inversion attack recovers customer features
                </p>
              </div>

              <div style={{ padding: '14px', backgroundColor: 'var(--success-light)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--success-border)', fontSize: '0.735rem' }}>
                <strong style={{ color: 'var(--success-text)' }}>TRUSTMESH (DP + SecAgg)</strong>
                <p style={{ color: 'var(--success-text)', marginTop: '4px', lineHeight: 1.45 }}>
                  • Leakage Risk: <strong>Reduced / Negligible</strong><br/>
                  • DP Gaussian noise masks rows<br/>
                  • SecAgg hides individual vectors
                </p>
              </div>
            </div>
          </div>

          {/* Section 22: Data Drift Simulation */}
          <div className="card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={16} color="var(--primary-dark)" />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
                  Concept Drift & Continuous Adaptation
                </h3>
              </div>
              <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>Adaptive ML</span>
            </div>

            <p style={{ fontSize: '0.765rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Detecting macro-economic shifts in repayment behavior across institutions without centralized logging:
            </p>

            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.735rem',
              backgroundColor: 'var(--bg-subtle)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-light)',
              lineHeight: 1.65,
              color: 'var(--text-primary)'
            }}>
              <div>Historical Baseline (Wasserstein: 0.024)</div>
              <div>──▶ New Behaviour Pattern Observed</div>
              <div>──▶ Distribution Shift Detected (0.082 &gt; 0.050)</div>
              <div>──▶ Model Drift Alert Triggered</div>
              <div style={{ color: 'var(--success-text)', fontWeight: 600 }}>──▶ Collaborative Retraining Scheduled</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
