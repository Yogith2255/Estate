import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Bed, Bath, Square, Calendar, ShieldCheck, Mail, Phone, Heart, CalendarCheck, CheckCircle2 } from 'lucide-react';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Dialog from '../../components/common/Dialog';
import Input from '../../components/common/Input';
import { useAuth } from '../../context/AuthContext';
import { propertyService } from '../../services/propertyService';
import { favoriteService } from '../../services/favoriteService';
import { leadService } from '../../services/leadService';
import { operationsService } from '../../services/operationsService';
import { formatCurrency, formatSqFt, formatDate } from '../../utils/formatters';
import './PropertyDetailsPage.css';

export default function PropertyDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [saved, setSaved] = useState(false);

  // Site Visit Modal
  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const [visitSubmitted, setVisitSubmitted] = useState(false);
  const [visitSubmitting, setVisitSubmitting] = useState(false);
  const [visitError, setVisitError] = useState('');
  const [visitForm, setVisitForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    date: '2026-10-30',
    timeSlot: 'Morning (10:00 AM - 1:00 PM)',
  });

  // Enquiry state
  const [enquirySent, setEnquirySent] = useState(false);
  const [enquirySubmitting, setEnquirySubmitting] = useState(false);
  const [enquiryError, setEnquiryError] = useState('');
  const [enquiryMessage, setEnquiryMessage] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [data, isFav] = await Promise.all([
          propertyService.getPropertyById(id),
          favoriteService.checkFavorite(id),
        ]);
        setProperty(data);
        setSaved(isFav);
      } catch (err) {
        console.error('Property not found', err);
        setProperty(null);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  useEffect(() => {
    if (user) {
      setVisitForm((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user]);

  if (loading) {
    return <LoadingSpinner fullPage message="Retrieving property details..." />;
  }

  if (!property) {
    return (
      <div className="container section">
        <EmptyState
          title="Property Not Found"
          description="The property listing you requested may have been removed, sold, or is currently unlisted."
          actionLabel="Browse Available Listings"
          onAction={() => window.location.assign('/properties')}
        />
      </div>
    );
  }

  const {
    title,
    price,
    listingType,
    propertyType,
    featured,
    address,
    specs,
    images,
    agent,
    description,
    amenities,
    publishedAt,
  } = property;

  const handleToggleFavorite = async () => {
    try {
      if (saved) {
        await favoriteService.removeFavorite(id);
        setSaved(false);
      } else {
        await favoriteService.addFavorite(id);
        setSaved(true);
      }
    } catch (err) {
      console.error('Failed to update favorite', err);
    }
  };

  const handleScheduleVisit = async (e) => {
    e.preventDefault();
    setVisitError('');
    setVisitSubmitting(true);
    try {
      await operationsService.scheduleSiteVisit({
        clientName: visitForm.name || user?.name || 'Guest Buyer',
        phone: visitForm.phone || user?.phone || '+91 99999 99999',
        email: user?.email || '',
        propertyId: id,
        project: title,
        date: visitForm.date,
        timeSlot: visitForm.timeSlot,
      });
      setVisitSubmitted(true);
    } catch (err) {
      setVisitError(err.message || 'Failed to schedule visit.');
    } finally {
      setVisitSubmitting(false);
    }
  };

  const handleSendEnquiry = async (e) => {
    e.preventDefault();
    setEnquiryError('');
    setEnquirySubmitting(true);
    try {
      await leadService.submitEnquiry({
        customerName: user?.name || 'Customer',
        phone: user?.phone || '+91 99999 99999',
        email: user?.email || '',
        propertyId: id,
        interestedProject: title,
        message: enquiryMessage || 'Interested in this property listing.',
      });
      setEnquirySent(true);
    } catch (err) {
      setEnquiryError(err.message || 'Failed to send enquiry.');
    } finally {
      setEnquirySubmitting(false);
    }
  };

  return (
    <div className="prop-detail-page">
      {/* Top Breadcrumb & Action bar */}
      <div className="prop-detail-bar">
        <div className="container prop-detail-bar__inner">
          <Link to="/marketplace/properties" className="prop-detail-bar__back">
            <ArrowLeft size={14} />
            <span>Back to all properties</span>
          </Link>
          <div className="prop-detail-bar__actions">
            <Button
              variant="secondary"
              size="sm"
              icon={Heart}
              onClick={handleToggleFavorite}
            >
              {saved ? 'Saved' : 'Save Property'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={CalendarCheck}
              onClick={() => {
                setVisitSubmitted(false);
                setVisitModalOpen(true);
              }}
            >
              Schedule Site Visit
            </Button>
          </div>
        </div>
      </div>

      <div className="container section-sm">
        {/* Title and Price Header */}
        <div className="prop-detail-header">
          <div>
            <div className="prop-detail-badges">
              <StatusBadge status={listingType === 'sale' ? 'For Sale' : 'For Rent'} />
              {featured && <StatusBadge status="Featured" variant="warning" />}
              <span className="prop-detail-type-tag">{propertyType}</span>
            </div>
            <h1 className="prop-detail-title">{title}</h1>
            <div className="prop-detail-address">
              <MapPin size={14} />
              <span>{address.street}, {address.city}, {address.state} - {address.zipCode}</span>
            </div>
          </div>

          <div className="prop-detail-price-box">
            <div className="prop-detail-price">
              {formatCurrency(price, true)}
              {listingType === 'rent' && <span className="prop-detail-period"> / month</span>}
            </div>
            <div className="prop-detail-status">
              <span className="prop-detail-status-dot" />
              <span>RERA Registered & Active</span>
            </div>
          </div>
        </div>

        {/* Photography Gallery */}
        <div className="prop-gallery">
          <div className="prop-gallery__main content-panel">
            <img
              src={images[activeImageIndex] || images[0]}
              alt={title}
              className="prop-gallery__main-img"
            />
          </div>
          {images && images.length > 1 && (
            <div className="prop-gallery__thumbs">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`prop-gallery__thumb-btn ${idx === activeImageIndex ? 'prop-gallery__thumb-btn--active' : ''}`}
                  onClick={() => setActiveImageIndex(idx)}
                >
                  <img src={img} alt={`View ${idx + 1}`} className="prop-gallery__thumb-img" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Layout Grid: Left Details & Right Agent Enquiry Form */}
        <div className="prop-layout-grid">
          {/* Main Details */}
          <div className="prop-main-col">
            {/* Spec Highlights Grid */}
            <div className="prop-specs-panel content-panel">
              <div className="prop-spec-box">
                <span className="prop-spec-label">Configuration</span>
                <span className="prop-spec-val"><Bed size={16} /> {specs.beds} BHK</span>
              </div>
              <div className="prop-spec-box">
                <span className="prop-spec-label">Bathrooms</span>
                <span className="prop-spec-val"><Bath size={16} /> {specs.baths}</span>
              </div>
              <div className="prop-spec-box">
                <span className="prop-spec-label">Super Built-up Area</span>
                <span className="prop-spec-val"><Square size={16} /> {formatSqFt(specs.sqft)}</span>
              </div>
              <div className="prop-spec-box">
                <span className="prop-spec-label">Year Built / Handover</span>
                <span className="prop-spec-val"><Calendar size={16} /> {specs.yearBuilt}</span>
              </div>
            </div>

            {/* Overview */}
            <div className="prop-section content-panel" style={{ padding: '16px' }}>
              <h2 className="prop-section-heading">Property Overview</h2>
              <p className="prop-description">{description}</p>
            </div>

            {/* Amenities */}
            <div className="prop-section content-panel" style={{ padding: '16px' }}>
              <h2 className="prop-section-heading">Features & Project Amenities</h2>
              <div className="prop-amenities-grid">
                {amenities.map((item, index) => (
                  <div key={index} className="prop-amenity-item">
                    <ShieldCheck size={14} className="prop-amenity-icon" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="prop-metadata-panel">
              <span>Listing Published: {formatDate(publishedAt)}</span>
              <span>Inventory ID: #{id}</span>
              <span>Category: {propertyType}</span>
            </div>
          </div>

          {/* Right Sidebar: Agent Card & Enquiry Form */}
          <aside className="prop-sidebar-col">
            <div className="prop-agent-card content-panel">
              <div className="prop-agent-header">
                <img src={agent.avatar} alt={agent.name} className="prop-agent-avatar" />
                <div>
                  <h3 className="prop-agent-name">{agent.name}</h3>
                  <p className="prop-agent-agency">{agent.agency}</p>
                  <span className="prop-agent-verified">
                    <ShieldCheck size={13} /> Licensed Advisory Broker
                  </span>
                </div>
              </div>

              <div className="prop-agent-contact-list">
                <a href={`tel:${agent.phone}`} className="prop-agent-contact-btn">
                  <Phone size={14} />
                  <span>{agent.phone}</span>
                </a>
                <a href={`mailto:${agent.email}`} className="prop-agent-contact-btn">
                  <Mail size={14} />
                  <span>{agent.email}</span>
                </a>
              </div>

              {/* Quick Enquiry Box */}
              <div className="prop-enquiry-box">
                <h4 className="prop-enquiry-title">Enquire About This Property</h4>
                {enquirySent ? (
                  <div className="prop-enquiry-success">
                    <CheckCircle2 size={16} color="var(--color-success)" />
                    <span>Your enquiry was forwarded to {agent.name}. An advisory agent will call you shortly.</span>
                  </div>
                ) : (
                  <form onSubmit={handleSendEnquiry} className="flex flex-col gap-xs">
                    <textarea
                      className="input-field__input"
                      rows={3}
                      style={{ height: 'auto', padding: '8px' }}
                      placeholder="I am interested in this unit. Please share payment schedule and floor plan..."
                      value={enquiryMessage}
                      onChange={(e) => setEnquiryMessage(e.target.value)}
                    />
                    <Button type="submit" variant="primary" size="md" style={{ width: '100%' }}>
                      Send Enquiry
                    </Button>
                  </form>
                )}
              </div>

              <div style={{ marginTop: '12px' }}>
                <Button
                  variant="outline"
                  size="md"
                  icon={CalendarCheck}
                  style={{ width: '100%' }}
                  onClick={() => {
                    setVisitSubmitted(false);
                    setVisitModalOpen(true);
                  }}
                >
                  Book Private Site Visit
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Schedule Site Visit Modal Dialog */}
      <Dialog
        isOpen={visitModalOpen}
        onClose={() => setVisitModalOpen(false)}
        title="Schedule Property Walkthrough / Site Visit"
        size="md"
        footer={
          visitSubmitted ? (
            <Button variant="primary" size="md" onClick={() => setVisitModalOpen(false)}>
              Done
            </Button>
          ) : (
            <>
              <Button variant="secondary" size="md" onClick={() => setVisitModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="md" onClick={handleScheduleVisit}>
                Confirm Site Visit
              </Button>
            </>
          )
        }
      >
        {visitSubmitted ? (
          <div className="site-visit-confirmed">
            <CheckCircle2 size={36} color="var(--color-success)" />
            <h3>Site Visit Scheduled!</h3>
            <p className="text-xs text-muted">
              We have reserved your walkthrough slot for <strong>{visitForm.date}</strong> ({visitForm.timeSlot}).
              Broker {agent.name} has been notified and will meet you at the project reception.
            </p>
          </div>
        ) : (
          <form onSubmit={handleScheduleVisit} className="flex flex-col gap-sm">
            <p className="text-xs text-muted">
              Schedule a personalized walkthrough of <strong>{title}</strong> with our advisory representative.
            </p>
            <Input
              label="Your Full Name"
              required
              placeholder="e.g. Ramesh Chandra"
              value={visitForm.name}
              onChange={(e) => setVisitForm({ ...visitForm, name: e.target.value })}
            />
            <Input
              label="Contact Phone"
              required
              placeholder="+91 98765 43210"
              value={visitForm.phone}
              onChange={(e) => setVisitForm({ ...visitForm, phone: e.target.value })}
            />
            <div className="grid grid-cols-1 grid-cols-2-sm gap-sm">
              <Input
                label="Preferred Date"
                type="date"
                value={visitForm.date}
                onChange={(e) => setVisitForm({ ...visitForm, date: e.target.value })}
              />
              <div className="input-field">
                <label className="input-field__label">Preferred Time Slot</label>
                <select
                  className="select-field__select"
                  value={visitForm.timeSlot}
                  onChange={(e) => setVisitForm({ ...visitForm, timeSlot: e.target.value })}
                >
                  <option value="Morning (10:00 AM - 1:00 PM)">Morning (10:00 AM - 1:00 PM)</option>
                  <option value="Afternoon (2:00 PM - 4:30 PM)">Afternoon (2:00 PM - 4:30 PM)</option>
                  <option value="Evening (5:00 PM - 7:00 PM)">Evening (5:00 PM - 7:00 PM)</option>
                </select>
              </div>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  );
}
