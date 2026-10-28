import React, { forwardRef } from 'react';
import './Input.css';

const Input = forwardRef(function Input(
  {
    label,
    id,
    type = 'text',
    error,
    helperText,
    icon: Icon = null,
    iconPosition = 'left',
    required = false,
    className = '',
    ...rest
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`input-field ${error ? 'input-field--error' : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className="input-field__label">
          {label}
          {required && <span className="input-field__required">*</span>}
        </label>
      )}
      <div className={`input-field__wrapper ${Icon ? `input-field__wrapper--has-icon-${iconPosition}` : ''}`}>
        {Icon && (
          <span className={`input-field__icon input-field__icon--${iconPosition}`}>
            <Icon size={18} />
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className="input-field__input"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...rest}
        />
      </div>
      {error && (
        <span id={`${inputId}-error`} className="input-field__error-text">
          {error}
        </span>
      )}
      {!error && helperText && (
        <span className="input-field__helper-text">{helperText}</span>
      )}
    </div>
  );
});

export default Input;
