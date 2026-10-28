import React from 'react';
import { Home } from 'lucide-react';
import Button from './Button';
import './EmptyState.css';

/**
 * Reusable EmptyState component
 * @param {Object} props
 * @param {React.ReactNode} [props.icon]
 * @param {string} props.title
 * @param {string} props.description
 * @param {string} [props.actionLabel]
 * @param {Function} [props.onAction]
 */
export default function EmptyState({
  icon: Icon = Home,
  title = 'No results found',
  description = 'Try adjusting your search criteria or filters.',
  actionLabel = null,
  onAction = null,
  className = '',
}) {
  return (
    <div className={`empty-state ${className}`}>
      <div className="empty-state__icon-wrap">
        <Icon size={28} className="empty-state__icon" />
      </div>
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__description">{description}</p>
      {actionLabel && onAction && (
        <div className="empty-state__action">
          <Button variant="secondary" size="md" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
