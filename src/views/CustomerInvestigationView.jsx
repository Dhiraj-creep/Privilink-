import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ArrowLeft,
  Send,
  FileCheck2,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Lock,
  Sparkles
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { RISK_CASES } from '../data/syntheticData';
import { getRiskVariant, getStatusVariant, formatRiskScore } from '../utils/formatters';

export default function CustomerInvestigationView({ 
  caseData = RISK_CASES[0], 
  currentRole = 'RISK_ANALYST',
  onBack,
  onTriggerVerification,
  onResolveVerification
}) {
  const [activeTab, setActiveTab] = useState('evidence'); // 'evidence' | 'disclosure' | 'audit'
  const [localTriggered, setLocalTriggered] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolveNotes, setResolveNotes] = useState('Customer submitted proof of payroll regularity and validated insurance policy.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const c = caseData || RISK_CASES[0];

  const isVerificationActive = c.status === 'VERIFICATION_REQUESTED' || localTriggered;
  const isResolved = c.status === 'RESOLVED';
  const riskProps = getRiskVariant(c.riskLevel);
  const statusProps = getStatusVariant(c.status);
  const scoreVal = c.score !== undefined ? c.score : c.confidence;

  const canTrigger = (currentRole === 'RISK_ANALYST' || currentRole === 'NETWORK_ADMIN') && !isResolved && !isVerificationActive;
  const canResolve = (currentRole === 'COMPLIANCE_OFFICER' || currentRole === 'NETWORK_ADMIN') && isVerificationActive && !isResolved;

  const handleTrigger = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      if (onTriggerVerification) {
        await onTriggerVerification(c.id);
      }
      setLocalTriggered(true);
      setSuccessMsg(`Step-Up KYC verification dispatched for ${c.id}. Persistent investigation task created.`);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to dispatch step-up verification.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolve = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      if (onResolveVerification) {
        await onResolveVerification(c.id, resolveNotes);
      }
      setShowResolveModal(false);
      setSuccessMsg(`Case ${c.id} cleared and resolved. Cryptographic audit trail updated.`);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to resolve verification.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Contributions fallback
  const contributions = c.contributions || [
    { name: 'Local financial behaviour (Bank A)', score: 35, color: '#4F46E5' },
    { name: 'Cross-institution signal alignment (Insurer B)', score: 28, color: '#0D9488' },
    { name: 'Borrowing behaviour deviation (Lender C)', score: 37, color: '#D97706' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Top Breadcrumb & Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <button
          onClick={onBack}
          className="btn btn-ghost btn-sm"
          style={{ gap: '6px', color: 'var(--text-secondary)' }}
        >
          <ArrowLeft size={14} />
          <span>Back to Risk Cases</span>
        </button>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isResolved ? (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              backgroundColor: 'var(--status-success-subtle)',
              color: 'var(--status-success-text)',
              border: '1px solid var(--status-success-border)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              fontWeight: 600
            }}>
              <CheckCircle2 size={14} />
              <span>Case Cleared & Resolved</span>
            </div>
          ) : isVerificationActive ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                backgroundColor: 'var(--status-warning-subtle)',
                color: 'var(--status-warning-text)',
                border: '1px solid var(--status-warning-border)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                fontWeight: 600
              }}>
                <Clock size={14} />
                <span>Verification Task Active</span>
              </div>
              {canResolve ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowResolveModal(true)}
                  disabled={isSubmitting}
                  icon={<FileCheck2 size={13} />}
                >
                  Resolve Case
                </Button>
              ) : (
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', padding: '5px 8px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-default)' }}>
                  Awaiting Compliance Clearance
                </span>
              )}
            </div>
          ) : canTrigger ? (
            <Button
              variant="primary"
              size="sm"
              onClick={handleTrigger}
              loading={isSubmitting}
              disabled={isSubmitting}
              icon={<Send size={13} />}
            >
              Trigger Step-Up Verification
            </Button>
          ) : (
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', padding: '5px 8px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-default)' }}>
              Requires Risk Analyst Role to Trigger
            </span>
          )}
        </div>
      </div>

      {/* Notifications / Alerts */}
      {errorMsg && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: 'var(--status-danger-subtle)',
          border: '1px solid var(--status-danger-border)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--status-danger-text)',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} style={{ border: 'none', background: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
        </div>
      )}

      {successMsg && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: 'var(--status-success-subtle)',
          border: '1px solid var(--status-success-border)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--status-success-text)',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} style={{ border: 'none', background: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
        </div>
      )}

      {/* Header Profile Summary Card */}
      <Card style={{ padding: '22px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '20px' }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              Case Identity & Entity
            </span>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px', letterSpacing: '-0.02em' }}>
              {c.id}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                {c.customerId}
              </span>
              <span style={{ color: 'var(--border-medium)' }}>•</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', padding: '1px 5px', borderRadius: '3px', backgroundColor: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                {c.entityRef || 'ENTITY-7F21'}
              </span>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              Collaborative Risk Evaluation
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
              <Badge variant={riskProps.variant} size="md">
                {riskProps.label} RISK
              </Badge>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                {formatRiskScore(scoreVal)}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Risk Score</span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
              Synthesized from 3 sovereign feature partitions
            </span>
          </div>

          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              Recommended Action
            </span>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '6px' }}>
              {(c.action || 'Standard monitoring').toUpperCase()}
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
              {c.lastEscalation || '14 mins ago'}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              Privacy Architecture
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
              <ShieldCheck size={16} color="var(--accent-teal)" />
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-teal)' }}>
                Sovereign Feature Custody
              </span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
              Split Learning partial logits only; raw records stay on-premise
            </span>
          </div>
        </div>
      </Card>

      {/* Tabs Navigation */}
      <div className="tm-tabs-nav">
        <button
          onClick={() => setActiveTab('evidence')}
          className={`tm-tab-button ${activeTab === 'evidence' ? 'active' : ''}`}
        >
          Institutional Evidence & Synthesis
        </button>
        <button
          onClick={() => setActiveTab('disclosure')}
          className={`tm-tab-button ${activeTab === 'disclosure' ? 'active' : ''}`}
        >
          Minimum Disclosure Matrix
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`tm-tab-button ${activeTab === 'audit' ? 'active' : ''}`}
        >
          Investigation Task & Audit Info
        </button>
      </div>

      {/* TAB 1: Evidence & Synthesis */}
      {activeTab === 'evidence' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Collaborative Synthesis Highlight Card */}
          <Card style={{
            backgroundColor: c.riskLevel === 'HIGH' ? 'var(--status-danger-subtle)' : 'var(--primary-subtle)',
            border: `1px solid ${c.riskLevel === 'HIGH' ? 'var(--status-danger-border)' : 'var(--primary-border)'}`,
            padding: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                color: c.riskLevel === 'HIGH' ? 'var(--status-danger)' : 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: 'var(--shadow-xs)'
              }}>
                <Sparkles size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Collaborative Model Discovery Rationale
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
                  {c.collaborativeSynthesis || c.explanation || 'Independent indicators slightly deviated from rolling baseline; collaborative threshold evaluated.'}
                </p>
              </div>
            </div>
          </Card>

          {/* 3 Sovereign Signal Evidence Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '16px' }}>
            {/* Bank A Evidence */}
            <Card title="Bank A — Transaction & Liquidity">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Local Assessment</span>
                  <Badge variant="neutral" size="sm">Sub-Threshold</Badge>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {c.localEvidence?.bank?.signalText || 'Repayment behaviour ratio: 0.88'}
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                  {c.localEvidence?.bank?.detail || 'Mild repayment date delay (+6 days). Within standard grace window; insufficient alone for alert.'}
                </p>
              </div>
            </Card>

            {/* Insurer B Evidence */}
            <Card title="Insurer B — Claims & Loss Exposure">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Local Assessment</span>
                  <Badge variant="neutral" size="sm">Sub-Threshold</Badge>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {c.localEvidence?.insurer?.signalText || 'Recent policy claim deviation: 0.38'}
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                  {c.localEvidence?.insurer?.detail || 'First-time property loss claim following policy tenure. Isolated claim anomaly score is non-conclusive.'}
                </p>
              </div>
            </Card>

            {/* Lender C Evidence */}
            <Card title="Lender C — Velocity & Debt Stress">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Local Assessment</span>
                  <Badge variant="neutral" size="sm">Sub-Threshold</Badge>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {c.localEvidence?.lender?.signalText || 'Application velocity: 2 inquiries'}
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                  {c.localEvidence?.lender?.detail || 'Two loan inquiries within 14-day window. Standalone threshold not breached without cross-bank context.'}
                </p>
              </div>
            </Card>
          </div>

          {/* Institutional Contribution Breakdown */}
          <Card
            title="Institutional Feature Contribution Breakdown"
            subtitle="Normalized partial logit magnitudes mathematically summing to exactly 100%."
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {contributions.map((item, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px', fontSize: '12px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</span>
                    <span style={{ fontFamily: 'var(--font-sans)', fontVariantNumeric: 'tabular-nums', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {item.score}%
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-muted)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${item.score}%`,
                        height: '100%',
                        backgroundColor: idx === 0 ? 'var(--primary)' : (idx === 1 ? 'var(--accent-teal)' : 'var(--status-warning)'),
                        borderRadius: '4px',
                        transition: 'width 0.4s ease'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: Minimum Necessary Disclosure Matrix */}
      {activeTab === 'disclosure' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px' }}>
          <Card
            title="Disclosed to Cross-Institution Risk Analyst"
            subtitle="Strict minimum required for risk actionability under DPDP / GDPR Article 5(1)(c)."
          >
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(c.minimumDisclosure?.disclosedToAnalyst || [
                `Composite Risk Level: ${c.riskLevel} (Risk Score: ${formatRiskScore(scoreVal)})`,
                'Primary Archetype: Cross-institution signal convergence / loan stacking',
                'Recommended Protocol: Step-up verification dispatch'
              ]).map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <CheckCircle2 size={16} color="var(--status-success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card
            title="Strictly Protected On-Premise"
            subtitle="Raw sensitive features that NEVER cross sovereign institutional perimeters."
          >
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(c.minimumDisclosure?.strictlyProtected || [
                'Customer Legal Name, National Identity (Aadhaar / SSN / PAN), Phone, Residential Address',
                'Specific Bank Account numbers, exact transaction counter-parties, running balances',
                'Insurer claim documentation, property loss payout checks, clinical records',
                'Lender facility contracts, employer paystubs, specific debt schedules'
              ]).map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <Lock size={15} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {/* TAB 3: Investigation Task & Audit Info */}
      {activeTab === 'audit' && (
        <Card title="Task Tracking & Regulatory Clearance">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-default)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ACTIVE TASK ID</span>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {c.activeTaskId || (isVerificationActive ? (c.verificationTask?.id || 'Pending assignment') : 'None')}
                </p>
              </div>

              <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-default)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>CASE STATUS</span>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {statusProps.label}
                </p>
              </div>

              <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-default)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>CRYPTOGRAPHIC CHAIN</span>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--status-success-text)', marginTop: '2px' }}>
                  SHA-256 Chained Block
                </p>
              </div>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              All actions taken on this case are recorded in the central coordinator database (`coordinator.db`), chained to previous events using SHA-256 hashes, and verifiable from the genesis block.
            </div>
          </div>
        </Card>
      )}

      {/* Case Resolution Modal */}
      <Modal
        isOpen={showResolveModal}
        onClose={() => setShowResolveModal(false)}
        title={`Resolve Case ${c.id}`}
        subtitle="Formal compliance case clearance and regulatory record archiving"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setShowResolveModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleResolve} loading={isSubmitting}>
              Confirm Clearance & Sign
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
              Resolution Rationale / Compliance Clearance Notes:
            </label>
            <textarea
              rows={4}
              value={resolveNotes}
              onChange={(e) => setResolveNotes(e.target.value)}
              style={{ width: '100%', fontSize: '13px', resize: 'vertical' }}
            />
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            This clearance will be permanently appended to the tamper-evident SHA-256 audit log and the active verification task marked as RESOLVED.
          </div>
        </div>
      </Modal>
    </div>
  );
}
