import React, { useState, useEffect, useRef } from 'react';
import { 
  Fingerprint, 
  Play, 
  RotateCcw
} from 'lucide-react';
import { api } from '../api/client';

export default function EntityResolutionView() {
  const [matchingState, setMatchingState] = useState('idle');
  const [psiResult, setPsiResult] = useState(null);
  const timersRef = useRef([]);

  const clearAllTimers = () => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
  };

  useEffect(() => {
    return () => clearAllTimers();
  }, []);

  const runEntityMatching = async () => {
    clearAllTimers();
    setMatchingState('hashing');

    // Trigger backend PSI calculation
    api.simulatePSI().then(res => {
      setPsiResult(res);
    }).catch(() => {
      // Fallback
    });

    const t1 = setTimeout(() => {
      setMatchingState('psi_computing');
      const t2 = setTimeout(() => {
        setMatchingState('resolved');
      }, 1200);
      timersRef.current.push(t2);
    }, 1200);
    timersRef.current.push(t1);
  };

  const resetMatching = () => {
    clearAllTimers();
    setMatchingState('idle');
    setPsiResult(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
              Privacy-Preserving Entity Resolution (PSI)
            </h1>
            <span className="badge badge-primary">Private Set Intersection</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Cross-institution entity linkage using cryptographic blinded commitments without exposing customer PII.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {matchingState !== 'resolved' ? (
            <button
              onClick={runEntityMatching}
              disabled={matchingState !== 'idle'}
              className="btn btn-primary btn-sm"
            >
              <Play size={14} />
              <span>{matchingState === 'idle' ? 'Run Private Entity Matching' : 'Resolving PSI...'}</span>
            </button>
          ) : (
            <button
              onClick={resetMatching}
              className="btn btn-secondary btn-sm"
            >
              <RotateCcw size={14} />
              <span>Reset Resolution</span>
            </button>
          )}
        </div>
      </div>

      {/* PSI Simulation Card */}
      <div className="card" style={{ padding: '24px' }}>
        {/* Step Status Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          marginBottom: '28px'
        }}>
          {[
            { step: 1, title: 'Local Blinded Hashing', desc: 'HMAC-SHA256 with local salt' },
            { step: 2, title: 'Commutative Encryption', desc: 'Diffie-Hellman exponentiation' },
            { step: 3, title: 'Zero-Knowledge Intersection', desc: 'Hash equality without plaintext' },
            { step: 4, title: 'Shared Canonical Ref', desc: 'Generate ENTITY-7F21 token' }
          ].map(s => {
            const isDone = (s.step === 1 && matchingState !== 'idle') ||
                           (s.step === 2 && (matchingState === 'psi_computing' || matchingState === 'resolved')) ||
                           (s.step === 3 && (matchingState === 'psi_computing' || matchingState === 'resolved')) ||
                           (s.step === 4 && matchingState === 'resolved');
            return (
              <div 
                key={s.step}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isDone ? 'var(--sage-light)' : 'var(--bg-subtle)',
                  border: isDone ? '1px solid var(--sage-border)' : '1px solid var(--border-light)',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '3px' }}>
                  <span style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: isDone ? 'var(--primary-dark)' : 'var(--text-muted)',
                    color: '#F8FAFC',
                    fontSize: '0.675rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {s.step}
                  </span>
                  <span style={{ fontSize: '0.785rem', fontWeight: 600, color: isDone ? 'var(--primary-dark)' : 'var(--text-secondary)' }}>
                    {s.title}
                  </span>
                </div>
                <span style={{ fontSize: '0.715rem', color: 'var(--text-muted)' }}>{s.desc}</span>
              </div>
            );
          })}
        </div>

        {/* Visual Matching Stage */}
        <div style={{
          backgroundColor: 'var(--nav-bg)',
          borderRadius: 'var(--radius-lg)',
          padding: '26px',
          border: '1px solid var(--nav-border)',
          color: '#F8FAFC'
        }}>
          {/* Top 3 Participant Inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '18px', marginBottom: '26px' }}>
            
            {/* Bank A */}
            <div style={{
              backgroundColor: 'var(--nav-surface)',
              border: '1px solid var(--muted-sage)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              textAlign: 'center'
            }}>
              <span style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--muted-sage)' }}>BANK A IDENTIFIER</span>
              <div style={{ marginTop: '8px', fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                B-48291
              </div>
              <div style={{ marginTop: '6px', fontSize: '0.72rem', color: 'var(--nav-text)' }}>
                {matchingState === 'idle' ? 'Local Pseudonym' : 'Blinded: 0x4a92...e1c8'}
              </div>
            </div>

            {/* Insurer B */}
            <div style={{
              backgroundColor: 'var(--nav-surface)',
              border: '1px solid var(--muted-sage)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              textAlign: 'center'
            }}>
              <span style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--muted-sage)' }}>INSURER B IDENTIFIER</span>
              <div style={{ marginTop: '8px', fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                I-90312
              </div>
              <div style={{ marginTop: '6px', fontSize: '0.72rem', color: 'var(--nav-text)' }}>
                {matchingState === 'idle' ? 'Local Pseudonym' : 'Blinded: 0x4a92...e1c8'}
              </div>
            </div>

            {/* Lender C */}
            <div style={{
              backgroundColor: 'var(--nav-surface)',
              border: '1px solid var(--warning)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              textAlign: 'center'
            }}>
              <span style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--warning)' }}>LENDER C IDENTIFIER</span>
              <div style={{ marginTop: '8px', fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                L-77120
              </div>
              <div style={{ marginTop: '6px', fontSize: '0.72rem', color: 'var(--nav-text)' }}>
                {matchingState === 'idle' ? 'Local Pseudonym' : 'Blinded: 0x4a92...e1c8'}
              </div>
            </div>

          </div>

          {/* Central Cryptographic Intersection Engine */}
          <div style={{
            maxWidth: '540px',
            margin: '0 auto',
            backgroundColor: 'var(--primary-dark)',
            border: matchingState === 'resolved' ? '2px solid var(--success)' : '1px solid var(--nav-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '22px',
            textAlign: 'center',
            boxShadow: '0 8px 24px rgba(11, 42, 32, 0.5)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
              <Fingerprint size={22} color={matchingState === 'resolved' ? 'var(--muted-sage)' : 'var(--muted-sage)'} />
              <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#F8FAFC' }}>
                CRYPTOGRAPHIC BLIND INTERSECTION
              </h4>
            </div>

            <p style={{ fontSize: '0.765rem', color: 'var(--nav-text)', marginBottom: '16px' }}>
              Commutative ElGamal/RSA encryption ensures that both sides can test if E_A(E_B(ID)) == E_B(E_A(ID)) without either revealing plaintext PII.
            </p>

            {matchingState === 'resolved' ? (
              <div style={{
                backgroundColor: 'var(--nav-surface)',
                border: '1px solid var(--success)',
                borderRadius: 'var(--radius-md)',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--muted-sage)' }}>MATCH CONFIDENCE</span>
                    <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#F8FAFC', fontFamily: 'var(--font-mono)' }}>
                      98%
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--muted-sage)' }}>SHARED CANONICAL REF</span>
                    <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--muted-sage)', fontFamily: 'var(--font-mono)' }}>
                      {psiResult?.matched_case_ref || 'ENTITY-7F21'}
                    </p>
                  </div>
                </div>
                <p style={{ fontSize: '0.735rem', color: '#F8FAFC', marginTop: '10px' }}>
                  ✓ Match confirmed across Bank A, Insurer B, and Lender C with zero PII disclosure ({psiResult?.protocol || 'Diffie-Hellman Commutative PSI'}).
                </p>
              </div>
            ) : (
              <div style={{ padding: '16px', backgroundColor: 'var(--nav-surface)', borderRadius: 'var(--radius-sm)', fontSize: '0.765rem', color: 'var(--nav-text)' }}>
                {matchingState === 'idle' && 'Click "Run Private Entity Matching" to initiate zero-knowledge alignment.'}
                {matchingState === 'hashing' && 'Applying local salts and computing cryptographic commitments...'}
                {matchingState === 'psi_computing' && 'Comparing blinded exponentiations in encrypted domain...'}
              </div>
            )}
          </div>
        </div>

        {/* Section 17 Notice */}
        <div style={{
          marginTop: '18px',
          padding: '14px 18px',
          backgroundColor: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.765rem',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border-light)'
        }}>
          <strong style={{ color: 'var(--primary-dark)' }}>Notice: </strong>
          No Aadhaar, PAN, phone number, email, or real personal information is ever requested, processed, or displayed. 
          This is a prototype simulation of privacy-preserving entity matching.
        </div>
      </div>
    </div>
  );
}
