import React from 'react';
import './Badge.css';

/**
 * Reusable Badge component
 * @param {Object} props
 * @param {'primary' | 'neutral' | 'success' | 'warning' | 'outline'} props.variant
 * @param {'sm' | 'md'} props.size
 */
export default function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  icon: Icon = null,
  className = '',
}) {
  return (
    <span className={`badge-pill badge-pill--${variant} badge-pill--${size} ${className}`}>
      {Icon && <Icon size={size === 'sm' ? 12 : 14} className="badge-pill__icon" />}
      <span className="badge-pill__label">{children}</span>
    </span>
  );
}
