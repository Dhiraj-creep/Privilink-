import React from 'react';

const VARIANT_STYLES = {
  primary: {
    bg: '#EEF2FF',
    color: '#3730A3',
    border: '#C7D2FE'
  },
  indigo: {
    bg: '#EEF2FF',
    color: '#3730A3',
    border: '#C7D2FE'
  },
  teal: {
    bg: '#F0FDFA',
    color: '#115E59',
    border: '#99F6E4'
  },
  cyan: {
    bg: '#F0FDFA',
    color: '#115E59',
    border: '#99F6E4'
  },
  violet: {
    bg: '#F5F3FF',
    color: '#5B21B6',
    border: '#DDD6FE'
  },
  success: {
    bg: '#F0FDF4',
    color: '#14532D',
    border: '#BBF7D0'
  },
  warning: {
    bg: '#FFFBEB',
    color: '#78350F',
    border: '#FDE68A'
  },
  danger: {
    bg: '#FEF2F2',
    color: '#7F1D1D',
    border: '#FECACA'
  },
  neutral: {
    bg: '#F1F5F9',
    color: '#334155',
    border: '#CBD5E1'
  },
  demo: {
    bg: '#F8FAFC',
    color: '#64748B',
    border: '#E2E8F0'
  },
  'risk-low': {
    bg: '#F0FDF4',
    color: '#14532D',
    border: '#BBF7D0'
  },
  'risk-medium': {
    bg: '#FFFBEB',
    color: '#78350F',
    border: '#FDE68A'
  },
  'risk-high': {
    bg: '#FEF2F2',
    color: '#7F1D1D',
    border: '#FECACA'
  },
  'risk-critical': {
    bg: '#FEF2F2',
    color: '#7F1D1D',
    border: '#FECACA'
  }
};

export function Badge({
  children,
  variant = 'neutral',
  icon = null,
  size = 'md',
  style = {},
  className = '',
  ...props
}) {
  const current = VARIANT_STYLES[variant] || VARIANT_STYLES.neutral;
  const isSm = size === 'sm';

  return (
    <span
      className={`tm-badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: isSm ? '2px 6px' : '3px 8px',
        fontSize: isSm ? '11px' : '12px',
        fontWeight: 600,
        lineHeight: 1.25,
        borderRadius: 'var(--radius-xs)',
        backgroundColor: current.bg,
        color: current.color,
        border: `1px solid ${current.border}`,
        letterSpacing: '0.03em',
        textTransform: 'uppercase',
        fontVariantNumeric: 'tabular-nums',
        fontFamily: 'var(--font-sans)',
        whiteSpace: 'nowrap',
        ...style
      }}
      {...props}
    >
      {icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </span>
  );
}

export default Badge;
