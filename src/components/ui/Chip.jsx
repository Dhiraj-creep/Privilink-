import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export function Chip({
  value,
  trend = 'neutral', // 'up' | 'down' | 'neutral'
  isGood = true,     // if true, positive is green; if false, positive is red
  label = null,
  style = {},
  className = '',
  ...props
}) {
  let color = '#475569';
  let bg = '#F1F5F9';
  let border = '#E2E8F0';

  if (trend === 'up') {
    if (isGood) {
      color = '#15803D';
      bg = '#F0FDF4';
      border = '#BBF7D0';
    } else {
      color = '#B91C1C';
      bg = '#FEF2F2';
      border = '#FECACA';
    }
  } else if (trend === 'down') {
    if (isGood) {
      color = '#15803D';
      bg = '#F0FDF4';
      border = '#BBF7D0';
    } else {
      color = '#B91C1C';
      bg = '#FEF2F2';
      border = '#FECACA';
    }
  }

  return (
    <span
      className={`tm-chip ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '3px',
        padding: '2px 8px',
        fontSize: '11px',
        fontWeight: 600,
        borderRadius: 'var(--radius-full)',
        backgroundColor: bg,
        color: color,
        border: `1px solid ${border}`,
        fontFamily: 'var(--font-sans)',
        fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'nowrap',
        ...style
      }}
      {...props}
    >
      {trend === 'up' && <ArrowUpRight size={11} strokeWidth={2.5} />}
      {trend === 'down' && <ArrowDownRight size={11} strokeWidth={2.5} />}
      {trend === 'neutral' && <Minus size={10} strokeWidth={2.5} />}
      <span>{value}</span>
      {label && <span style={{ color: '#64748B', marginLeft: '3px' }}>{label}</span>}
    </span>
  );
}

export default Chip;
