import React from 'react';

export function Card({
  children,
  title,
  subtitle,
  action,
  header,
  footer,
  raised = false,
  style = {},
  className = '',
  ...props
}) {
  return (
    <div
      className={`tm-card ${className}`}
      style={{
        backgroundColor: raised ? 'var(--bg-surface-raised)' : 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'border-color var(--transition-normal), background-color var(--transition-normal)',
        ...style
      }}
      {...props}
    >
      {(header || title) && (
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          {header ? (
            header
          ) : (
            <div>
              <h3
                style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.01em',
                  margin: 0
                }}
              >
                {title}
              </h3>
              {subtitle && (
                <p
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-secondary)',
                    marginTop: '2px',
                    margin: 0
                  }}
                >
                  {subtitle}
                </p>
              )}
            </div>
          )}
          {action && <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>{action}</div>}
        </div>
      )}

      <div style={{ padding: '18px', flex: 1 }}>{children}</div>

      {footer && (
        <div
          style={{
            padding: '10px 18px',
            borderTop: '1px solid var(--border-default)',
            backgroundColor: 'rgba(0, 0, 0, 0.15)',
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)',
            borderBottomLeftRadius: 'var(--radius-lg)',
            borderBottomRightRadius: 'var(--radius-lg)'
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}

export default Card;
