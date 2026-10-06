import React from 'react';

export function Skeleton({
  width = '100%',
  height = '16px',
  borderRadius = 'var(--radius-sm)',
  style = {},
  className = '',
  ...props
}) {
  return (
    <div
      className={`tm-skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: 'var(--bg-surface-raised)',
        backgroundImage: 'linear-gradient(90deg, var(--bg-surface-raised) 0%, var(--bg-surface-hover) 50%, var(--bg-surface-raised) 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite linear',
        display: 'inline-block',
        ...style
      }}
      {...props}
    />
  );
}

export default Skeleton;
