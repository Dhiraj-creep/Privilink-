import React from 'react';
import { Loader2 } from 'lucide-react';

export function Button({
  children,
  variant = 'secondary', // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
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
          border: '1px solid var(--primary)'
        };
      case 'outline':
        return {
          bg: 'transparent',
          bgHover: 'var(--bg-surface-hover)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-default)'
        };
      case 'ghost':
        return {
          bg: 'transparent',
          bgHover: 'var(--bg-surface-hover)',
          color: 'var(--text-secondary)',
          border: '1px solid transparent'
        };
      case 'danger':
        return {
          bg: 'var(--danger)',
          bgHover: '#DC2626',
          color: '#FFFFFF',
          border: '1px solid var(--danger)'
        };
      case 'secondary':
      default:
        return {
          bg: 'var(--bg-surface-raised)',
          bgHover: 'var(--bg-surface-hover)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-default)'
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'xs':
        return { padding: '3px 8px', fontSize: 'var(--text-xs)', height: '24px' };
      case 'sm':
        return { padding: '5px 10px', fontSize: 'var(--text-sm)', height: '30px' };
      case 'lg':
        return { padding: '10px 20px', fontSize: 'var(--text-base)', height: '42px' };
      case 'md':
      default:
        return { padding: '7px 14px', fontSize: 'var(--text-sm)', height: '34px' };
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
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all var(--transition-fast)',
        userSelect: 'none',
        whiteSpace: 'nowrap',
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
        <Loader2 size={13} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
      ) : icon ? (
        <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>
      ) : null}
      <span>{children}</span>
      {!loading && iconRight && (
        <span style={{ display: 'inline-flex', alignItems: 'center' }}>{iconRight}</span>
      )}
    </button>
  );
}

export default Button;
