import React from 'react';
import './Card.css';

/**
 * Reusable Card container component
 */
export default function Card({
  children,
  className = '',
  padding = 'md',
  hoverEffect = false,
  ...rest
}) {
  return (
    <div
      className={`card card--padding-${padding} ${hoverEffect ? 'card--interactive' : ''} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

Card.Header = function CardHeader({ children, className = '' }) {
  return <div className={`card__header ${className}`}>{children}</div>;
};

Card.Body = function CardBody({ children, className = '' }) {
  return <div className={`card__body ${className}`}>{children}</div>;
};

Card.Footer = function CardFooter({ children, className = '' }) {
  return <div className={`card__footer ${className}`}>{children}</div>;
};
