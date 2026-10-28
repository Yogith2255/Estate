import React from 'react';
import { Link } from 'react-router-dom';
import { Bed, Bath, Square, MapPin } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { formatCurrency, formatSqFt } from '../../utils/formatters';
import './PropertyCard.css';

/**
 * Enterprise Property Card
 * @param {Object} props
 * @param {Object} props.property
 */
export default function PropertyCard({ property }) {
  if (!property) return null;

  const propertyId = property.id || property._id;
  const {
    title,
    price,
    listingType,
    propertyType,
    status,
    featured,
    address,
    specs,
    images,
  } = property;

  const primaryImage = images && images.length > 0
    ? images[0]
    : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';

  return (
    <article className="property-card content-panel">
      <Link to={`/marketplace/properties/${propertyId}`} className="property-card__image-link" tabIndex={-1}>
        <div className="property-card__image-wrapper">
          <img
            src={primaryImage}
            alt={title}
            className="property-card__image"
            loading="lazy"
          />
          <div className="property-card__badges">
            <StatusBadge status={listingType === 'sale' ? 'For Sale' : 'For Rent'} />
            {featured && <StatusBadge status="Featured" variant="warning" />}
            {status === 'pending' && <StatusBadge status="Pending" variant="neutral" />}
          </div>
        </div>
      </Link>

      <div className="property-card__content">
        <div className="property-card__price-row">
          <div className="property-card__price">
            {formatCurrency(price, true)}
            {listingType === 'rent' && <span className="property-card__period"> / mo</span>}
          </div>
          <span className="property-card__type">{propertyType}</span>
        </div>

        <h3 className="property-card__title">
          <Link to={`/marketplace/properties/${propertyId}`} className="property-card__title-link">
            {title}
          </Link>
        </h3>

        <div className="property-card__address">
          <MapPin size={12} className="property-card__address-icon" />
          <span>{address.street}, {address.city}</span>
        </div>

        <div className="property-card__specs">
          <div className="property-card__spec-item" title="Bedrooms">
            <Bed size={13} />
            <span>{specs.beds} BHK</span>
          </div>
          <div className="property-card__spec-divider" />
          <div className="property-card__spec-item" title="Bathrooms">
            <Bath size={13} />
            <span>{specs.baths} Baths</span>
          </div>
          <div className="property-card__spec-divider" />
          <div className="property-card__spec-item" title="Super Built-up Area">
            <Square size={13} />
            <span>{formatSqFt(specs.sqft)}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
