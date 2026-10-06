import React, { useState } from 'react';

export function Tooltip({
  children,
  content,
  position = 'top',
  style = {},
  ...props
}) {
  const [visible, setVisible] = useState(false);

  if (!content) return children;

  const getPositionStyles = () => {
    switch (position) {
      case 'bottom':
        return {
          top: 'calc(100% + 6px)',
          left: '50%',
          transform: 'translateX(-50%)'
        };
      case 'left':
        return {
          right: 'calc(100% + 6px)',
          top: '50%',
          transform: 'translateY(-50%)'
        };
      case 'right':
        return {
          left: 'calc(100% + 6px)',
          top: '50%',
          transform: 'translateY(-50%)'
        };
      case 'top':
      default:
        return {
          bottom: 'calc(100% + 6px)',
          left: '50%',
          transform: 'translateX(-50%)'
        };
    }
  };

  return (
    <div
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
      {...props}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          style={{
            position: 'absolute',
            zIndex: 100,
            padding: '4px 8px',
            fontSize: 'var(--text-xs)',
            fontWeight: 500,
            color: 'var(--text-primary)',
            backgroundColor: 'var(--bg-surface-raised)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-xs)',
            boxShadow: 'var(--shadow-md)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            animation: 'fadeIn var(--transition-fast)',
            ...getPositionStyles(),
            ...style
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
}

export default Tooltip;
