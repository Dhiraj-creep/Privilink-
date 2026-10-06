import React from 'react';

const VARIANT_STYLES = {
  primary: {
    bg: 'var(--primary-subtle)',
    color: 'var(--primary-hover)',
    border: 'var(--primary-border)'
  },
  cyan: {
    bg: 'var(--accent-cyan-subtle)',
    color: 'var(--accent-cyan)',
    border: 'var(--accent-cyan-border)'
  },
  success: {
    bg: 'var(--success-subtle)',
    color: 'var(--success)',
    border: 'var(--success-border)'
  },
  warning: {
    bg: 'var(--warning-subtle)',
    color: 'var(--warning)',
    border: 'var(--warning-border)'
  },
  danger: {
    bg: 'var(--danger-subtle)',
    color: 'var(--danger)',
    border: 'var(--danger-border)'
  },
  neutral: {
    bg: 'rgba(102, 116, 143, 0.12)',
    color: 'var(--text-secondary)',
    border: 'var(--border-default)'
  },
  'risk-low': {
    bg: 'rgba(34, 197, 94, 0.12)',
    color: 'var(--risk-low)',
    border: 'rgba(34, 197, 94, 0.3)'
  },
  'risk-medium': {
    bg: 'rgba(245, 158, 11, 0.12)',
    color: 'var(--risk-medium)',
    border: 'rgba(245, 158, 11, 0.3)'
  },
  'risk-high': {
    bg: 'rgba(249, 115, 22, 0.12)',
    color: 'var(--risk-high)',
    border: 'rgba(249, 115, 22, 0.3)'
  },
  'risk-critical': {
    bg: 'rgba(239, 68, 68, 0.12)',
    color: 'var(--risk-critical)',
    border: 'rgba(239, 68, 68, 0.3)'
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
        padding: isSm ? '1.5px 6px' : '2.5px 8px',
        fontSize: isSm ? 'var(--text-xs)' : 'var(--text-sm)',
        fontWeight: 600,
        lineHeight: 1.25,
        borderRadius: 'var(--radius-xs)',
        backgroundColor: current.bg,
        color: current.color,
        border: `1px solid ${current.border}`,
        letterSpacing: '0.03em',
        textTransform: 'uppercase',
        fontVariantNumeric: 'tabular-nums',
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
