import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Lock, 
  EyeOff, 
  CheckCircle2, 
  ArrowLeft,
  Send,
  FileCheck2,
  Clock
} from 'lucide-react';
import { RISK_CASES } from '../data/syntheticData';

export default function CustomerInvestigationView({ 
  caseData = RISK_CASES[0], 
  onBack,
  onTriggerVerification,
  onResolveVerification
}) {
  const [localTriggered, setLocalTriggered] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolveNotes, setResolveNotes] = useState('Customer submitted proof of payroll deposit regularity and policy verification.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState(null);

  const c = caseData || RISK_CASES[0];
  const isVerificationActive = c.status === 'VERIFICATION_REQUESTED' || localTriggered;
  const isResolved = c.status === 'RESOLVED';

  const handleTrigger = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    setActionSuccessMsg(null);
    try {
      if (onTriggerVerification) {
        await onTriggerVerification(c.id);
      }
      setLocalTriggered(true);
      setActionSuccessMsg(`Step-Up KYC verification dispatched for ${c.id}. Persistent investigation task created.`);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to dispatch step-up verification.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolve = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    setActionSuccessMsg(null);
    try {
      if (onResolveVerification) {
        await onResolveVerification(c.id, resolveNotes);
      }
      setShowResolveModal(false);
      setActionSuccessMsg(`Case ${c.id} cleared and resolved. Cryptographic audit trail updated.`);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to resolve verification.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Honest Feedback Banners */}
      {errorMsg && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: 'var(--danger-light)',
          border: '1.5px solid var(--danger-border)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--danger-text)',
          fontSize: '0.825rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} />
            <span><strong>Access Control / Validation Notice:</strong> {errorMsg}</span>
          </div>
          <button 
            onClick={() => setErrorMsg(null)} 
            style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'inherit', fontWeight: 'bold', fontSize: '1rem' }}
          >
            ✕
          </button>
        </div>
      )}

      {actionSuccessMsg && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: 'var(--success-light)',
          border: '1.5px solid var(--success-border)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--success-text)',
          fontSize: '0.825rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} />
            <span>{actionSuccessMsg}</span>
          </div>
          <button 
            onClick={() => setActionSuccessMsg(null)} 
            style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'inherit', fontWeight: 'bold', fontSize: '1rem' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Navigation & Case Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button 
            onClick={onBack}
            className="btn btn-secondary btn-sm"
            style={{ padding: '6px 12px' }}
          >
            <ArrowLeft size={14} />
            <span>Back to Case List</span>
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
                Investigation: {c.id}
              </h1>
              <span className={`badge ${c.riskLevel === 'HIGH' ? 'badge-danger' : (c.riskLevel === 'MEDIUM' ? 'badge-warning' : 'badge-success')}`}>
                Risk: {c.riskLevel}
              </span>
              <span className="badge badge-success">
                <Lock size={10} style={{ marginRight: '3px' }} />
                Privacy: {c.privacyStatus || 'Protected'}
              </span>
              <span className="badge badge-primary">
                Status: {c.status || 'NORMAL_PROCESSING'}
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Entity Reference: <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary-dark)', fontWeight: 600 }}>{c.entityRef}</code> | Pseudonym: {c.customerId}
            </p>
          </div>
        </div>

        {/* Action Button: Step-up Verification & Resolution Lifecycle */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {isResolved ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 16px',
              backgroundColor: 'var(--success-light)',
              color: 'var(--success-text)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8rem',
              fontWeight: 600,
              border: '1px solid var(--success-border)'
            }}>
              <CheckCircle2 size={16} />
              <span>Case Cleared & Resolved</span>
            </div>
          ) : isVerificationActive ? (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                backgroundColor: 'var(--warning-light)',
                color: 'var(--warning-text)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8rem',
                fontWeight: 600,
                border: '1px solid var(--warning-border)'
              }}>
                <Clock size={15} />
                <span>Verification Task Active</span>
              </div>
              <button
                onClick={() => setShowResolveModal(true)}
                className="btn btn-primary btn-sm"
              >
                <FileCheck2 size={13} />
                <span>Resolve Verification</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleTrigger}
              disabled={isSubmitting}
              className="btn btn-primary btn-sm"
            >
              <Send size={13} />
              <span>{isSubmitting ? 'Dispatching...' : 'Trigger Step-Up Verification'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Top Profile Summary Card */}
      <div className="card" style={{ padding: '22px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '18px' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              Identity & Pseudonym
            </span>
            <p style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary-dark)', marginTop: '4px' }}>
              {c.customerId}
            </p>
            <span style={{ fontSize: '0.715rem', color: 'var(--success-text)', fontWeight: 500 }}>
              ✓ No PII (Aadhaar/PAN/SSN/Name) Stored
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              Collaborative Risk Evaluation
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
              <span style={{ 
                fontSize: '1.3rem', 
                fontWeight: 700, 
                color: c.riskLevel === 'HIGH' ? 'var(--danger-text)' : (c.riskLevel === 'MEDIUM' ? 'var(--warning-text)' : 'var(--success-text)') 
              }}>
                {c.riskLevel}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                (Confidence: {c.confidence}%)
              </span>
            </div>
            <span style={{ fontSize: '0.715rem', color: 'var(--text-secondary)' }}>
              Cross-institution model synthesis
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              Recommended Action
            </span>
            <p style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--primary-dark)', marginTop: '4px' }}>
              {(c.action || 'Standard monitoring').toUpperCase()}
            </p>
            <span style={{ fontSize: '0.715rem', color: 'var(--text-secondary)' }}>
              Decision-support; human auditor confirms
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              Privacy Boundary
            </span>
            <p style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--success-text)', marginTop: '4px' }}>
              Zero Raw Data Exchanged
            </p>
            <span style={{ fontSize: '0.715rem', color: 'var(--text-secondary)' }}>
              Federated latent representation only
            </span>
          </div>
        </div>
      </div>

      {/* Main Investigation Split: Why escalated vs Minimum Disclosure */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '22px' }}>
        
        {/* Left: Why was this case evaluated? */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
                Cross-Institutional Signal Breakdown
              </h3>
              <p style={{ fontSize: '0.765rem', color: 'var(--text-secondary)' }}>
                Multi-institution signal alignment with strict sovereign cryptographic boundaries.
              </p>
            </div>
            <span className="badge badge-warning">Isolated Weak Signals</span>
          </div>

          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Bank A Signal */}
            <div style={{
              padding: '14px',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-sm)',
              borderLeft: '4px solid var(--primary-dark)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.785rem', color: 'var(--primary-dark)' }}>
                  BANK A SIGNAL (Local Node)
                </span>
                <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>
                  {c.localEvidence?.bank?.severity || 'Normal'}
                </span>
              </div>
              <p style={{ fontSize: '0.815rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                "{c.localEvidence?.bank?.signalText || 'Repayment telemetry consistent.'}"
              </p>
              <p style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {c.localEvidence?.bank?.detail || 'Mild variance within baseline tolerance.'}
              </p>
            </div>

            {/* Insurer B Signal */}
            <div style={{
              padding: '14px',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-sm)',
              borderLeft: '4px solid var(--secondary-green)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.785rem', color: 'var(--secondary-green)' }}>
                  INSURER B SIGNAL (External Node)
                </span>
                <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>
                  Zero Raw Record Exchanged
                </span>
              </div>
              <p style={{ fontSize: '0.815rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                "{c.localEvidence?.insurer?.signalText || 'Privacy-preserving anomaly score within bounds.'}"
              </p>
              <p style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {c.localEvidence?.insurer?.detail || 'Insurer policy records remain sovereign behind local firewall.'}
              </p>
            </div>

            {/* Lender C Signal */}
            <div style={{
              padding: '14px',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-sm)',
              borderLeft: '4px solid var(--warning)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.785rem', color: 'var(--warning-text)' }}>
                  LENDER C SIGNAL (External Node)
                </span>
                <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>
                  Zero Raw Record Exchanged
                </span>
              </div>
              <p style={{ fontSize: '0.815rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                "{c.localEvidence?.lender?.signalText || 'Borrowing baseline nominal.'}"
              </p>
              <p style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {c.localEvidence?.lender?.detail || 'Standalone lender thresholds not breached.'}
              </p>
            </div>

            {/* Collaborative Result Box */}
            <div style={{
              padding: '16px',
              backgroundColor: c.riskLevel === 'HIGH' ? 'var(--danger-light)' : 'var(--sage-light)',
              border: c.riskLevel === 'HIGH' ? '1px solid var(--danger-border)' : '1px solid var(--sage-border)',
              borderRadius: 'var(--radius-sm)'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                color: c.riskLevel === 'HIGH' ? 'var(--danger-text)' : 'var(--primary-dark)', 
                fontWeight: 700, 
                fontSize: '0.825rem', 
                marginBottom: '6px' 
              }}>
                <AlertTriangle size={15} />
                <span>COLLABORATIVE SYNTHESIS RESULT</span>
              </div>
              <p style={{ fontSize: '0.815rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                {c.collaborativeSynthesis || c.explanation}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Explainable Contributions & Dynamic Minimum Disclosure */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Explainability Contribution Scores */}
          <div className="card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
                Explainable Risk Contribution Scores
              </h3>
              <span className="badge badge-demo" style={{ fontSize: '0.65rem' }}>Model Attribution</span>
            </div>
            
            <p style={{ fontSize: '0.765rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Relative feature importance estimated via collaborative representation weights:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {c.contributions?.map((item, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.785rem', marginBottom: '5px' }}>
                    <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{item.name}</span>
                    <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--primary-dark)' }}>{item.score}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${item.score}%`,
                      height: '100%',
                      backgroundColor: item.color || 'var(--primary-dark)',
                      borderRadius: '4px'
                    }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: '18px',
              padding: '12px 14px',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.735rem',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-light)'
            }}>
              <strong style={{ color: 'var(--primary-dark)' }}>Decision Support Mandate:</strong> The system does NOT autonomously decline customers. It provides actionable reasoning to risk officers to request targeted step-up proof.
            </div>
          </div>

          {/* DYNAMIC MINIMUM NECESSARY DISCLOSURE MATRIX (FIXED BUG: NO HARDCODED VALUES) */}
          <div className="card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--success-light)',
                color: 'var(--success-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Lock size={15} />
              </div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
                Minimum Necessary Disclosure Matrix
              </h3>
            </div>

            <p style={{ fontSize: '0.765rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              What does an institution analyst actually learn vs what is strictly blocked?
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {/* Learned Box (Dynamic) */}
              <div style={{
                padding: '14px',
                backgroundColor: 'var(--success-light)',
                border: '1px solid var(--success-border)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.765rem'
              }}>
                <div style={{ fontWeight: 700, color: 'var(--success-text)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={13} />
                  <span>WHAT IS LEARNED:</span>
                </div>
                <ul style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '5px', color: 'var(--text-primary)' }}>
                  {c.minimumDisclosure?.disclosedToAnalyst?.map((item, idx) => (
                    <li key={idx}><strong>{item}</strong></li>
                  )) || (
                    <>
                      <li>Risk Level: <strong>{c.riskLevel}</strong></li>
                      <li>Confidence: <strong>{c.confidence}%</strong></li>
                      <li>Decision: <strong>{c.action}</strong></li>
                    </>
                  )}
                </ul>
              </div>

              {/* Not Disclosed Box (Dynamic) */}
              <div style={{
                padding: '14px',
                backgroundColor: 'var(--danger-light)',
                border: '1px solid var(--danger-border)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.765rem'
              }}>
                <div style={{ fontWeight: 700, color: 'var(--danger-text)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <EyeOff size={13} />
                  <span>STRICTLY NOT DISCLOSED:</span>
                </div>
                <ul style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '5px', color: 'var(--danger-text)' }}>
                  {c.minimumDisclosure?.strictlyProtected?.map((item, idx) => (
                    <li key={idx}>✕ {item}</li>
                  )) || (
                    <>
                      <li>✕ Customer Legal Name / PII</li>
                      <li>✕ Specific Account Numbers</li>
                      <li>✕ Detailed Transaction Logs</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Resolve Verification Modal */}
      {showResolveModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(18, 55, 42, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '8px' }}>
              Resolve Step-Up Verification
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Confirm that customer provided acceptable verification documents to resolve the cross-institution flag.
            </p>
            <textarea
              value={resolveNotes}
              onChange={(e) => setResolveNotes(e.target.value)}
              rows={4}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-medium)',
                fontSize: '0.8rem',
                fontFamily: 'inherit',
                marginBottom: '16px'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setShowResolveModal(false)}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleResolve}
                disabled={isSubmitting}
                className="btn btn-primary btn-sm"
              >
                {isSubmitting ? 'Saving...' : 'Submit Resolution'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
