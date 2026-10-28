import React from 'react';
import './Button.css';

/**
 * Reusable Button component
 * @param {Object} props
 * @param {'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'} props.variant
 * @param {'sm' | 'md' | 'lg'} props.size
 * @param {boolean} props.isLoading
 * @param {React.ReactNode} props.icon
 * @param {'left' | 'right'} props.iconPosition
 * @param {React.ElementType} props.as
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon = null,
  iconPosition = 'left',
  className = '',
  as: Component = 'button',
  type = 'button',
  ...rest
}) {
  const isButton = Component === 'button';
  const buttonProps = isButton ? { type, disabled: disabled || isLoading } : {};

  return (
    <Component
      className={`btn btn--${variant} btn--${size} ${isLoading ? 'btn--loading' : ''} ${className}`}
      {...buttonProps}
      {...rest}
    >
      {isLoading && (
        <span className="btn__spinner" aria-hidden="true" />
      )}
      {!isLoading && Icon && iconPosition === 'left' && (
        <span className="btn__icon btn__icon--left"><Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} /></span>
      )}
      <span className="btn__text">{children}</span>
      {!isLoading && Icon && iconPosition === 'right' && (
        <span className="btn__icon btn__icon--right"><Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} /></span>
      )}
    </Component>
  );
}
