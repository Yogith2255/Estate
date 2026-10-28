import React from 'react';
import './SummaryCard.css';

/**
 * Compact enterprise metric summary card
 * @param {Object} props
 * @param {string} props.label
 * @param {string|number} props.value
 * @param {string} [props.subtext]
 * @param {React.ElementType} [props.icon]
 * @param {string} [props.badgeText]
 * @param {'neutral'|'success'|'warning'|'primary'} [props.badgeVariant]
 */
export default function SummaryCard({
  label,
  value,
  subtext,
  icon: Icon = null,
  badgeText = null,
  badgeVariant = 'neutral',
}) {
  return (
    <div className="summary-card">
      <div className="summary-card__top">
        <span className="summary-card__label">{label}</span>
        {Icon && (
          <div className="summary-card__icon">
            <Icon size={16} />
          </div>
        )}
      </div>

      <div className="summary-card__body">
        <span className="summary-card__value">{value}</span>
        {badgeText && (
          <span className={`summary-card__badge summary-card__badge--${badgeVariant}`}>
            {badgeText}
          </span>
        )}
      </div>

      {subtext && <p className="summary-card__subtext">{subtext}</p>}
    </div>
  );
}
