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
      className={`tm-skeleton animate-pulse ${className}`}
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: '#F1F5F9',
        display: 'inline-block',
        ...style
      }}
      {...props}
    />
  );
}

export default Skeleton;
