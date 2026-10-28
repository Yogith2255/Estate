import React from 'react';
import './LoadingSpinner.css';

/**
 * Reusable Loading Spinner component
 * @param {Object} props
 * @param {'sm' | 'md' | 'lg'} props.size
 * @param {string} [props.message]
 * @param {boolean} [props.fullPage]
 */
export default function LoadingSpinner({
  size = 'md',
  message = null,
  fullPage = false,
  className = '',
}) {
  const content = (
    <div className={`loading-spinner-container ${className}`}>
      <div className={`loading-spinner loading-spinner--${size}`} role="status" aria-label="Loading">
        <span className="sr-only">Loading...</span>
      </div>
      {message && <p className="loading-spinner__message">{message}</p>}
    </div>
  );

  if (fullPage) {
    return <div className="loading-spinner-overlay">{content}</div>;
  }

  return content;
}
