import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export function Chip({
  value,
  trend = 'neutral', // 'positive' | 'negative' | 'neutral'
  isGood = true,     // if true, positive is green; if false, positive is red (e.g. increase in fraud)
  label = null,
  style = {},
  className = '',
  ...props
}) {
  // Determine color semantic
  let color = 'var(--text-secondary)';
  let bg = 'rgba(102, 116, 143, 0.12)';
  let border = 'var(--border-default)';

  if (trend === 'up') {
    if (isGood) {
      color = 'var(--success)';
      bg = 'var(--success-subtle)';
      border = 'var(--success-border)';
    } else {
      color = 'var(--danger)';
      bg = 'var(--danger-subtle)';
      border = 'var(--danger-border)';
    }
  } else if (trend === 'down') {
    if (isGood) {
      // downward trend is good (e.g., lower latency or drop in loan stacking alerts)
      color = 'var(--success)';
      bg = 'var(--success-subtle)';
      border = 'var(--success-border)';
    } else {
      color = 'var(--danger)';
      bg = 'var(--danger-subtle)';
      border = 'var(--danger-border)';
    }
  }

  return (
    <span
      className={`tm-chip ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '3px',
        padding: '2px 7px',
        fontSize: 'var(--text-xs)',
        fontWeight: 600,
        borderRadius: 'var(--radius-full)',
        backgroundColor: bg,
        color: color,
        border: `1px solid ${border}`,
        fontFamily: 'var(--font-mono)',
        fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'nowrap',
        ...style
      }}
      {...props}
    >
      {trend === 'up' && <ArrowUpRight size={12} strokeWidth={2.4} />}
      {trend === 'down' && <ArrowDownRight size={12} strokeWidth={2.4} />}
      {trend === 'neutral' && <Minus size={11} strokeWidth={2.4} />}
      <span>{value}</span>
      {label && <span style={{ color: 'var(--text-muted)', marginLeft: '2px' }}>{label}</span>}
    </span>
  );
}

export default Chip;
