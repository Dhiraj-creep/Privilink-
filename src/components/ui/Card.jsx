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
      className={`tm-card card ${className}`}
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: raised ? 'var(--shadow-md)' : 'var(--shadow-xs)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
        ...style
      }}
      {...props}
    >
      {(header || title) && (
        <div
          className="tm-card-header"
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
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
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-muted)',
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

      <div style={{ padding: '20px', flex: 1 }}>{children}</div>

      {footer && (
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--border-default)',
            backgroundColor: 'var(--bg-subtle)',
            fontSize: 'var(--text-xs)',
            color: 'var(--text-muted)',
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
