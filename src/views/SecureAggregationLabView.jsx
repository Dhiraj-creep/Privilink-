import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  RotateCcw, 
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { api } from '../api/client';

export default function SecureAggregationLabView() {
  const [stage, setStage] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [simulationData, setSimulationData] = useState(null);
  const [simulateDropout, setSimulateDropout] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const timersRef = useRef([]);

  const clearAllTimers = () => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
  };

  useEffect(() => {
    return () => clearAllTimers();
  }, []);

  const runSimulation = async () => {
    clearAllTimers();
    setIsRunning(true);
    setErrorMessage(null);
    setStage(1);

    // Call live backend API for numerical SecAgg
    try {
      const backendRes = await api.simulateSecAgg(27, simulateDropout ? 'LENDER_C' : null).catch(() => null);
      if (backendRes) {
        setSimulationData(backendRes);
      }
    } catch {
      // Graceful fallback
    }

    const t1 = setTimeout(() => {
      setStage(2);
      const t2 = setTimeout(() => {
        setStage(3);
        const t3 = setTimeout(() => {
          if (simulateDropout) {
            setErrorMessage('Aggregation Aborted by Protocol: Lender C dropped out. Pairwise masks would not cancel out; central coordinator refuses to decrypt to protect client secrets.');
            setStage(3);
          } else {
            setStage(4);
          }
          setIsRunning(false);
        }, 1200);
        timersRef.current.push(t3);
      }, 1200);
      timersRef.current.push(t2);
    }, 1200);
    timersRef.current.push(t1);
  };

  const resetSimulation = () => {
    clearAllTimers();
    setStage(0);
    setIsRunning(false);
    setErrorMessage(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
              Secure Aggregation Protocol Lab
            </h1>
            <span className="badge badge-primary">SecAgg v2.1 Simulation</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Demonstrating how the central coordinator aggregates updates without ever viewing individual participant weights.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.765rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={simulateDropout} 
              onChange={(e) => setSimulateDropout(e.target.checked)} 
              disabled={isRunning}
            />
            <span>Simulate Dropout (Lender C offline)</span>
          </label>

          <button 
            onClick={runSimulation}
            disabled={isRunning}
            className="btn btn-primary btn-sm"
          >
            <Play size={14} />
            <span>{isRunning ? 'Aggregating...' : 'Run Secure Aggregation'}</span>
          </button>
          <button 
            onClick={resetSimulation}
            className="btn btn-secondary btn-sm"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Error / Abort Notification */}
      {errorMessage && (
        <div style={{
          backgroundColor: 'var(--danger-light)',
          border: '1px solid var(--danger-border)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: 'var(--danger-text)',
          fontSize: '0.8rem',
          fontWeight: 600
        }}>
          <AlertTriangle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Protocol Visual Stage Stepper */}
      <div className="card" style={{ padding: '24px' }}>
        {/* Step Progress Indicators */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          marginBottom: '28px'
        }}>
          {[
            { step: 1, title: 'Local Masking', desc: 'Pairwise keys + noise' },
            { step: 2, title: 'Encrypted Transit', desc: 'Blinded vector broadcast' },
            { step: 3, title: 'Zero-Knowledge Sum', desc: 'Pairwise masks cancel out' },
            { step: 4, title: 'Consolidated Model', desc: 'Only global weights released' }
          ].map(s => (
            <div 
              key={s.step}
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: stage >= s.step ? 'var(--sage-light)' : 'var(--bg-subtle)',
                border: stage >= s.step ? '1px solid var(--sage-border)' : '1px solid var(--border-light)',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '3px' }}>
                <span style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: stage >= s.step ? 'var(--primary-dark)' : 'var(--text-muted)',
                  color: '#F8FAFC',
                  fontSize: '0.675rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {s.step}
                </span>
                <span style={{ fontSize: '0.785rem', fontWeight: 600, color: stage >= s.step ? 'var(--primary-dark)' : 'var(--text-secondary)' }}>
                  {s.title}
                </span>
              </div>
              <span style={{ fontSize: '0.715rem', color: 'var(--text-muted)' }}>{s.desc}</span>
            </div>
          ))}
        </div>

        {/* Visual Interactive Aggregator Pipeline */}
        <div style={{
          backgroundColor: 'var(--nav-bg)',
          borderRadius: 'var(--radius-lg)',
          padding: '26px',
          border: '1px solid var(--nav-border)',
          color: '#F8FAFC'
        }}>
          {/* Top Row: 3 Participants */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '18px', marginBottom: '26px' }}>
            
            {/* Bank A */}
            <div style={{
              backgroundColor: 'var(--nav-surface)',
              border: stage >= 1 ? '1px solid var(--muted-sage)' : '1px solid var(--nav-border)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              textAlign: 'center'
            }}>
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--muted-sage)' }}>BANK A</span>
              <div style={{ marginTop: '8px', fontSize: '0.735rem', fontFamily: 'var(--font-mono)' }}>
                {stage === 0 && <span style={{ color: 'var(--nav-text)' }}>Local vector: [0.12, -0.05, 0.33, ...]</span>}
                {stage >= 1 && <span style={{ color: '#F8FAFC' }}>Blinded: v_A + S_AB + S_AC</span>}
              </div>
            </div>

            {/* Insurer B */}
            <div style={{
              backgroundColor: 'var(--nav-surface)',
              border: stage >= 1 ? '1px solid var(--muted-sage)' : '1px solid var(--nav-border)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              textAlign: 'center'
            }}>
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--muted-sage)' }}>INSURER B</span>
              <div style={{ marginTop: '8px', fontSize: '0.735rem', fontFamily: 'var(--font-mono)' }}>
                {stage === 0 && <span style={{ color: 'var(--nav-text)' }}>Local vector: [-0.08, 0.22, 0.15, ...]</span>}
                {stage >= 1 && <span style={{ color: '#F8FAFC' }}>Blinded: v_B - S_AB + S_BC</span>}
              </div>
            </div>

            {/* Lender C */}
            <div style={{
              backgroundColor: 'var(--nav-surface)',
              border: simulateDropout ? '1px solid var(--danger)' : (stage >= 1 ? '1px solid var(--muted-sage)' : '1px solid var(--nav-border)'),
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              textAlign: 'center'
            }}>
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: simulateDropout ? 'var(--danger)' : 'var(--muted-sage)' }}>
                LENDER C {simulateDropout && '(DROPPED OUT)'}
              </span>
              <div style={{ marginTop: '8px', fontSize: '0.735rem', fontFamily: 'var(--font-mono)' }}>
                {simulateDropout ? (
                  <span style={{ color: 'var(--danger-text)' }}>Connection Timeout</span>
                ) : (
                  <>
                    {stage === 0 && <span style={{ color: 'var(--nav-text)' }}>Local vector: [0.05, -0.12, 0.18, ...]</span>}
                    {stage >= 1 && <span style={{ color: '#F8FAFC' }}>Blinded: v_C - S_AC - S_BC</span>}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Central Aggregator Box */}
          <div style={{
            backgroundColor: 'var(--nav-surface)',
            border: '1.5px solid var(--nav-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            textAlign: 'center',
            maxWidth: '680px',
            margin: '0 auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
              <ShieldCheck size={18} color="var(--muted-sage)" />
              <span style={{ fontWeight: 700, fontSize: '0.925rem', color: '#F8FAFC' }}>
                CENTRAL SECURE AGGREGATOR (SecAgg Coordinator)
              </span>
            </div>

            <p style={{ fontSize: '0.765rem', color: 'var(--nav-text)', lineHeight: 1.5 }}>
              {stage < 3 ? (
                'Waiting for blinded vector submissions from all 3 institution nodes...'
              ) : simulateDropout ? (
                <strong style={{ color: 'var(--danger-text)' }}>
                  Dropout Detected: Sum of masks != 0. Aggregator ABORTS immediately to prevent exposing participant inputs.
                </strong>
              ) : (
                'Pairwise masks cancel out mathematically: (+S_AB - S_AB) + (+S_AC - S_AC) + (+S_BC - S_BC) = 0.'
              )}
            </p>

            {stage >= 3 && !simulateDropout && (
              <div style={{
                marginTop: '14px',
                padding: '10px 14px',
                backgroundColor: 'rgba(63, 125, 90, 0.2)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--success)',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                color: '#F8FAFC'
              }}>
                <div>Sum: Σ(v_i + M_i) = Σ v_i + Σ M_i = Σ v_i</div>
                <div style={{ color: 'var(--muted-sage)', marginTop: '4px' }}>
                  Resulting Global Weight Delta: {simulationData?.average_vector 
                    ? `[${simulationData.average_vector.slice(0, 5).map(v => typeof v === 'number' ? v.toFixed(3) : v).join(', ')}]` 
                    : '[0.030, 0.016, 0.220, 0.007, -0.040]'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
