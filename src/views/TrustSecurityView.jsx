import React from 'react';
import { 
  AlertOctagon, 
  RotateCcw, 
  ShieldAlert
} from 'lucide-react';

export default function TrustSecurityView({ 
  quarantinedLender, 
  onTriggerMaliciousSimulation, 
  onResetMaliciousSimulation 
}) {
  const bankTrust = 96;
  const insurerTrust = 92;
  const lenderTrust = quarantinedLender ? 63 : 89;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
              Trust-Aware Institution Monitoring & Byzantine Defense
            </h1>
            <span className="badge badge-primary">Zero-Trust Federation</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Continuous verification of model update consistency, cosine gradient variance, and protocol compliance.
          </p>
        </div>

        {/* Action Simulator Button */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {!quarantinedLender ? (
            <button
              onClick={onTriggerMaliciousSimulation}
              className="btn btn-danger btn-sm"
            >
              <AlertOctagon size={14} />
              <span>Simulate Malicious Participant</span>
            </button>
          ) : (
            <button
              onClick={onResetMaliciousSimulation}
              className="btn btn-secondary btn-sm"
            >
              <RotateCcw size={14} />
              <span>Reset & Re-admit Lender C</span>
            </button>
          )}
        </div>
      </div>

      {/* Quarantine Alert Banner (Visible when simulated) */}
      {quarantinedLender && (
        <div style={{
          backgroundColor: 'var(--danger-light)',
          border: '1px solid var(--danger-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '18px 22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: 'var(--danger)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <ShieldAlert size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--danger-text)' }}>
                  ANOMALOUS UPDATE DETECTED: LENDER C QUARANTINED FOR REVIEW
                </span>
                <span className="badge badge-danger">Byzantine Filter Triggered</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--danger-text)', marginTop: '3px' }}>
                Participant contribution reduced to 0%. Status: <strong>Potentially compromised / anomalous participant</strong>.
                Collaborative model protected against gradient poisoning.
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.735rem', color: 'var(--danger-text)', fontWeight: 600 }}>Action Taken:</span><br/>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--success-text)' }}>✓ Collaborative Model Protected</span>
          </div>
        </div>
      )}

      {/* 3 Institution Trust Score Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        
        {/* Bank A */}
        <div className="card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--primary-dark)' }}>BANK A</h3>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>Retail & Commercial</span>
            </div>
            <span className="badge badge-success">Verified Participant</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '2.1rem', fontWeight: 700, color: 'var(--primary-dark)', letterSpacing: '-0.02em' }}>{bankTrust}%</span>
            <span style={{ fontSize: '0.765rem', color: 'var(--text-muted)' }}>Trust Score</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', fontSize: '0.765rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Update Consistency:</span>
              <strong style={{ color: 'var(--text-primary)' }}>98.4%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Model Behaviour:</span>
              <strong style={{ color: 'var(--text-primary)' }}>Nominal</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Anomaly Frequency:</span>
              <strong style={{ color: 'var(--success-text)' }}>0.14% (Low)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Protocol Compliance:</span>
              <strong style={{ color: 'var(--success-text)' }}>100%</strong>
            </div>
          </div>
        </div>

        {/* Insurer B */}
        <div className="card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--primary-dark)' }}>INSURER B</h3>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>General & Property</span>
            </div>
            <span className="badge badge-success">Verified Participant</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '2.1rem', fontWeight: 700, color: 'var(--secondary-green)', letterSpacing: '-0.02em' }}>{insurerTrust}%</span>
            <span style={{ fontSize: '0.765rem', color: 'var(--text-muted)' }}>Trust Score</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', fontSize: '0.765rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Update Consistency:</span>
              <strong style={{ color: 'var(--text-primary)' }}>95.1%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Model Behaviour:</span>
              <strong style={{ color: 'var(--text-primary)' }}>Nominal</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Anomaly Frequency:</span>
              <strong style={{ color: 'var(--success-text)' }}>0.22% (Low)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Protocol Compliance:</span>
              <strong style={{ color: 'var(--success-text)' }}>100%</strong>
            </div>
          </div>
        </div>

        {/* Lender C */}
        <div className="card" style={{ 
          padding: '22px',
          border: quarantinedLender ? '2px solid var(--danger)' : '1px solid var(--border-light)',
          backgroundColor: quarantinedLender ? 'var(--danger-light)' : 'var(--bg-surface)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--primary-dark)' }}>LENDER C</h3>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>Digital Credit & SME Loans</span>
            </div>
            <span className={`badge ${quarantinedLender ? 'badge-danger' : 'badge-success'}`}>
              {quarantinedLender ? 'QUARANTINED FOR REVIEW' : 'Verified Participant'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '2.1rem', fontWeight: 700, color: quarantinedLender ? 'var(--danger-text)' : 'var(--warning-text)', letterSpacing: '-0.02em' }}>
              {lenderTrust}%
            </span>
            <span style={{ fontSize: '0.765rem', color: 'var(--text-muted)' }}>
              {quarantinedLender ? 'Score Dropped (89% ➔ 63%)' : 'Trust Score'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', fontSize: '0.765rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Update Consistency:</span>
              <strong style={{ color: quarantinedLender ? 'var(--danger-text)' : 'var(--text-primary)' }}>
                {quarantinedLender ? '42.8% (Severe Deviation)' : '91.8%'}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Model Behaviour:</span>
              <strong style={{ color: quarantinedLender ? 'var(--danger-text)' : 'var(--text-primary)' }}>
                {quarantinedLender ? 'Anomalous Gradient Norm' : 'Nominal'}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Anomaly Frequency:</span>
              <strong style={{ color: quarantinedLender ? 'var(--danger-text)' : 'var(--warning-text)' }}>
                {quarantinedLender ? '14.8% (Spike)' : '0.38% (Normal)'}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Protocol Status:</span>
              <strong style={{ color: quarantinedLender ? 'var(--danger-text)' : 'var(--success-text)' }}>
                {quarantinedLender ? 'Weight Zeroed Out' : 'Active Contributor'}
              </strong>
            </div>
          </div>
        </div>

      </div>

      {/* Trust & Byzantine Defense Explanation Card */}
      <div className="card" style={{ padding: '22px' }}>
        <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '10px' }}>
          Byzantine Tolerance & Weight Attenuation Protocol
        </h3>
        <p style={{ fontSize: '0.815rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
          Federated systems must withstand rogue or compromised nodes attempting model poisoning attacks (e.g. submitting adversarial gradients to create backdoor vulnerabilities).
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '14px',
          fontSize: '0.785rem'
        }}>
          <div style={{ padding: '14px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
            <strong style={{ color: 'var(--primary-dark)' }}>1. Gradient Norm Clamping</strong>
            <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
              Updates with norm ||∇W_i|| exceeding clipping threshold C=1.0 are automatically re-scaled to prevent outsized influence.
            </p>
          </div>

          <div style={{ padding: '14px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
            <strong style={{ color: 'var(--primary-dark)' }}>2. Geometric Median Defense</strong>
            <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
              Replaces vulnerable arithmetic averages with Coordinate-wise Median and Krum aggregation, neutralizing outlier vectors.
            </p>
          </div>

          <div style={{ padding: '14px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
            <strong style={{ color: 'var(--primary-dark)' }}>3. Non-Punitive Quarantine</strong>
            <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
              Nodes are labelled "Potentially compromised / anomalous" and quarantined for compliance review without ungrounded accusations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
