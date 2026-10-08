import React from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  X,
  Sparkles
} from 'lucide-react';
import { TOUR_STEPS } from '../data/tourSteps';

export default function HackathonTourModal({ 
  currentStepIndex, 
  onNext, 
  onPrev, 
  onClose, 
  onJumpToTab 
}) {
  const current = TOUR_STEPS[currentStepIndex] || TOUR_STEPS[0];

  const handleStepClick = (idx) => {
    onJumpToTab(TOUR_STEPS[idx].tab, idx);
  };

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-label="Interactive Product Tour"
      style={{
      position: 'fixed',
      bottom: '16px',
      right: '16px',
      width: '420px',
      maxWidth: 'calc(100vw - 32px)',
      backgroundColor: '#FFFFFF',
      color: 'var(--text-primary)',
      borderRadius: 'var(--radius-xl)',
      boxShadow: 'var(--shadow-lg)',
      border: '1px solid var(--border-default)',
      zIndex: 100,
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 18px',
        backgroundColor: 'var(--bg-subtle)',
        borderBottom: '1px solid var(--border-default)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={14} color="var(--primary)" />
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            {current.badge}
          </span>
        </div>
        <button 
          onClick={onClose}
          aria-label="Exit Tour"
          style={{
            color: 'var(--text-muted)',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer'
          }}
          title="Exit Tour"
        >
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: '18px' }}>
        <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
          {current.title}
        </h4>
        
        <div style={{
          backgroundColor: 'var(--primary-subtle)',
          borderLeft: '3px solid var(--primary)',
          padding: '10px 14px',
          borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
          marginBottom: '12px',
          fontSize: '12px',
          color: 'var(--primary-text)',
          lineHeight: 1.45
        }}>
          <strong>Presenter Pitch: </strong>
          "{current.speakerPitch}"
        </div>

        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '16px' }}>
          <strong style={{ color: 'var(--text-primary)' }}>Key Takeaway: </strong>
          {current.takeaway}
        </p>

        {/* Progress Bar & Dots */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '14px' }}>
          {TOUR_STEPS.map((s, i) => (
            <button
              key={s.step}
              onClick={() => handleStepClick(i)}
              aria-label={`Jump to tour step ${i + 1}`}
              style={{
                flex: 1,
                height: '4px',
                borderRadius: '2px',
                backgroundColor: i === currentStepIndex ? 'var(--primary)' : (i < currentStepIndex ? 'var(--primary-border)' : 'var(--border-default)'),
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
            />
          ))}
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
            Step {currentStepIndex + 1} of {TOUR_STEPS.length}
          </span>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onPrev}
              disabled={currentStepIndex === 0}
              className="btn btn-secondary btn-sm"
              aria-label="Previous tour step"
              style={{ padding: '4px 8px' }}
            >
              <ChevronLeft size={14} />
            </button>

            <button
              onClick={onNext}
              className="btn btn-primary btn-sm"
              style={{ padding: '4px 12px' }}
            >
              <span>{currentStepIndex === TOUR_STEPS.length - 1 ? 'Finish Tour' : 'Next'}</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
