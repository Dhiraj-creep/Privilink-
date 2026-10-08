import React from 'react';
import { Loader2 } from 'lucide-react';

export function Button({
  children,
  variant = 'secondary', // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
  size = 'md',          // 'xs' | 'sm' | 'md' | 'lg'
  icon = null,
  iconRight = null,
  loading = false,
  disabled = false,
  style = {},
  className = '',
  onClick,
  ...props
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          bg: 'var(--primary)',
          bgHover: 'var(--primary-hover)',
          color: '#FFFFFF',
          border: '1px solid var(--primary)',
          boxShadow: 'var(--shadow-xs)'
        };
      case 'success':
        return {
          bg: 'var(--status-success)',
          bgHover: 'var(--status-success-hover)',
          color: '#FFFFFF',
          border: '1px solid var(--status-success)',
          boxShadow: 'var(--shadow-xs)'
        };
      case 'danger':
        return {
          bg: 'var(--status-danger)',
          bgHover: 'var(--status-danger-hover)',
          color: '#FFFFFF',
          border: '1px solid var(--status-danger)',
          boxShadow: 'var(--shadow-xs)'
        };
      case 'outline':
        return {
          bg: '#FFFFFF',
          bgHover: 'var(--bg-subtle)',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border-medium)',
          boxShadow: 'none'
        };
      case 'ghost':
        return {
          bg: 'transparent',
          bgHover: 'var(--bg-muted)',
          color: 'var(--text-secondary)',
          border: '1px solid transparent',
          boxShadow: 'none'
        };
      case 'secondary':
      default:
        return {
          bg: '#FFFFFF',
          bgHover: 'var(--bg-subtle)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-xs)'
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'xs':
        return { padding: '3px 8px', fontSize: '11px', height: '26px' };
      case 'sm':
        return { padding: '5px 12px', fontSize: '12px', height: '32px' };
      case 'lg':
        return { padding: '10px 20px', fontSize: '15px', height: '42px' };
      case 'md':
      default:
        return { padding: '7px 14px', fontSize: '13px', height: '36px' };
    }
  };

  const v = getVariantStyles();
  const s = getSizeStyles();

  return (
    <button
      className={`tm-button ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        fontWeight: 500,
        borderRadius: 'var(--radius-sm)',
        backgroundColor: v.bg,
        color: v.color,
        border: v.border,
        boxShadow: v.boxShadow,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        transition: 'all var(--transition-fast)',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        fontFamily: 'var(--font-sans)',
        ...s,
        ...style
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.backgroundColor = v.bgHover;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.backgroundColor = v.bg;
        }
      }}
      {...props}
    >
      {loading ? (
        <Loader2 size={size === 'xs' ? 12 : 14} className="animate-pulse" />
      ) : (
        icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>
      )}
      <span>{children}</span>
      {!loading && iconRight && (
        <span style={{ display: 'inline-flex', alignItems: 'center' }}>{iconRight}</span>
      )}
    </button>
  );
}

export default Button;
