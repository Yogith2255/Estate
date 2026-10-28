import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import './Select.css';

const Select = forwardRef(function Select(
  {
    label,
    id,
    options = [],
    error,
    helperText,
    required = false,
    className = '',
    ...rest
  },
  ref
) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`select-field ${error ? 'select-field--error' : ''} ${className}`}>
      {label && (
        <label htmlFor={selectId} className="select-field__label">
          {label}
          {required && <span className="select-field__required">*</span>}
        </label>
      )}
      <div className="select-field__wrapper">
        <select
          ref={ref}
          id={selectId}
          className="select-field__select"
          aria-invalid={Boolean(error)}
          {...rest}
        >
          {options.map((option) => (
            <option key={option.value ?? option.id ?? option} value={option.value ?? option.id ?? option}>
              {option.label ?? option.name ?? option}
            </option>
          ))}
        </select>
        <span className="select-field__arrow">
          <ChevronDown size={16} />
        </span>
      </div>
      {error && <span className="select-field__error-text">{error}</span>}
      {!error && helperText && <span className="select-field__helper-text">{helperText}</span>}
    </div>
  );
});

export default Select;
