import React from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  X
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

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      width: '430px',
      maxWidth: 'calc(100vw - 48px)',
      backgroundColor: 'var(--nav-bg)',
      color: '#FCFBF7',
      borderRadius: 'var(--radius-lg)',
      boxShadow: '0 20px 30px -5px rgba(11, 42, 32, 0.4), 0 8px 12px -6px rgba(11, 42, 32, 0.3)',
      border: '1px solid var(--nav-border)',
      zIndex: 100,
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 18px',
        backgroundColor: 'var(--nav-surface)',
        borderBottom: '1px solid var(--nav-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: 'var(--muted-sage)'
          }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted-sage)', letterSpacing: '0.04em' }}>
            {current.badge}
          </span>
        </div>
        <button 
          onClick={onClose}
          style={{ color: 'var(--nav-text)', padding: '2px', display: 'flex', alignItems: 'center' }}
          title="Exit Tour"
        >
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: '18px' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#FCFBF7', marginBottom: '10px' }}>
          {current.title}
        </h4>
        
        <div style={{
          backgroundColor: 'var(--nav-surface)',
          borderLeft: '3px solid var(--muted-sage)',
          padding: '10px 14px',
          borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
          marginBottom: '12px',
          fontSize: '0.815rem',
          color: '#E8EBE9',
          lineHeight: 1.45
        }}>
          <strong style={{ color: 'var(--muted-sage)' }}>Presenter Pitch: </strong>
          "{current.speakerPitch}"
        </div>

        <p style={{ fontSize: '0.765rem', color: 'var(--nav-text)', lineHeight: 1.45, marginBottom: '16px' }}>
          <strong style={{ color: '#FCFBF7' }}>Key Insight: </strong>
          {current.takeaway}
        </p>

        {/* Progress Bar & Dots */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '14px' }}>
          {TOUR_STEPS.map((s, i) => (
            <button
              key={s.step}
              onClick={() => handleStepClick(i)}
              style={{
                flex: 1,
                height: '4px',
                borderRadius: '2px',
                backgroundColor: i === currentStepIndex ? 'var(--muted-sage)' : i < currentStepIndex ? 'var(--success)' : 'var(--nav-surface)',
                cursor: 'pointer'
              }}
              title={`Step ${s.step}: ${s.title}`}
            />
          ))}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={onPrev}
            disabled={currentStepIndex === 0}
            className="btn btn-sm"
            style={{
              backgroundColor: 'var(--nav-surface)',
              color: currentStepIndex === 0 ? 'var(--nav-border)' : 'var(--nav-text)',
              border: '1px solid var(--nav-border)'
            }}
          >
            <ChevronLeft size={14} />
            <span>Previous</span>
          </button>

          <span style={{ fontSize: '0.725rem', color: 'var(--nav-text)' }}>
            {currentStepIndex + 1} of {TOUR_STEPS.length}
          </span>

          <button
            onClick={onNext}
            className="btn btn-sm"
            style={{
              backgroundColor: 'var(--secondary-green)',
              color: '#FCFBF7',
              border: '1px solid var(--muted-sage)',
              fontWeight: 600
            }}
          >
            <span>{currentStepIndex === TOUR_STEPS.length - 1 ? 'Finish Pitch' : 'Next Step'}</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
