import React from 'react';
import './StatusBadge.css';

/**
 * Enterprise status badge component for Leads, Projects, and Properties
 * @param {Object} props
 * @param {string} props.status
 * @param {string} [props.variant]
 * @param {string} [props.className]
 */
export default function StatusBadge({ status, variant, className = '' }) {
  if (!status) return null;

  const normalized = status.toLowerCase().trim();

  // Automatic variant detection if not explicitly passed
  let resolvedVariant = variant;
  if (!resolvedVariant) {
    if (['converted', 'ready to move', 'active', 'completed', 'operational', 'verified'].includes(normalized)) {
      resolvedVariant = 'success';
    } else if (['negotiation', 'under construction', 'pending', 'in review'].includes(normalized)) {
      resolvedVariant = 'warning';
    } else if (['lost', 'danger', 'rejected', 'failed', 'cancelled'].includes(normalized)) {
      resolvedVariant = 'danger';
    } else if (['new', 'newly launched', 'booking', 'for sale'].includes(normalized)) {
      resolvedVariant = 'primary';
    } else if (['site visit', 'qualified', 'for rent'].includes(normalized)) {
      resolvedVariant = 'info';
    } else {
      resolvedVariant = 'neutral';
    }
  }

  return (
    <span className={`status-badge status-badge--${resolvedVariant} ${className}`}>
      <span className="status-badge__dot" />
      <span className="status-badge__text">{status}</span>
    </span>
  );
}
