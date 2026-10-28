import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Building, ArrowRight, ShieldCheck, Layers, CalendarCheck } from 'lucide-react';
import PropertyCard from '../../components/property/PropertyCard';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { propertyService } from '../../services/propertyService';
import { projectService } from '../../services/projectService';
import { propertyTypes } from '../../data/mockCategories';
import { formatCurrency } from '../../utils/formatters';
import './HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listingTypeTab, setListingTypeTab] = useState('sale');
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    async function loadFeatured() {
      setLoading(true);
      try {
        const [propsData, projsData] = await Promise.all([
          propertyService.getProperties({ featuredOnly: true }),
          projectService.getProjects(),
        ]);
        setProperties(propsData);
        setProjects(projsData);
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (listingTypeTab) params.set('type', listingTypeTab);
    if (searchLocation.trim()) params.set('search', searchLocation.trim());
    if (selectedType && selectedType !== 'all') params.set('propertyType', selectedType);
    navigate(`/marketplace/properties?${params.toString()}`);
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="home-hero">
        <div className="container home-hero__container">
          <div className="home-hero__content">
            <span className="home-hero__badge">
              <ShieldCheck size={14} />
              <span>Verified Indian Real Estate Platform & RERA Direct</span>
            </span>

            <h1 className="home-hero__title">
              Find verified residential properties and developer projects.
            </h1>
            <p className="home-hero__subtitle">
              EstateHub provides transparent pricing, real-time inventory tracking, and licensed broker coordination across Hyderabad, Bengaluru, Mumbai, Pune, and Chennai.
            </p>

            {/* Practical Search Box */}
            <div className="home-search-panel content-panel">
              <div className="home-search-panel__tabs">
                <button
                  type="button"
                  className={`home-search-panel__tab ${listingTypeTab === 'sale' ? 'home-search-panel__tab--active' : ''}`}
                  onClick={() => setListingTypeTab('sale')}
                >
                  Buy Homes
                </button>
                <button
                  type="button"
                  className={`home-search-panel__tab ${listingTypeTab === 'rent' ? 'home-search-panel__tab--active' : ''}`}
                  onClick={() => setListingTypeTab('rent')}
                >
                  Rental Residences
                </button>
                <button
                  type="button"
                  className="home-search-panel__tab"
                  onClick={() => navigate('/admin/projects')}
                >
                  Developer Projects
                </button>
              </div>

              <form onSubmit={handleSearchSubmit} className="home-search-panel__form">
                <div className="home-search-panel__field">
                  <label htmlFor="home-loc" className="home-search-panel__label">Location / Micro-market</label>
                  <div className="home-search-panel__input-wrap">
                    <MapPin size={15} className="home-search-panel__icon" />
                    <input
                      id="home-loc"
                      type="text"
                      className="home-search-panel__input"
                      placeholder="e.g. Financial District, Whitefield, Worli..."
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                    />
                  </div>
                </div>

                <div className="home-search-panel__field">
                  <label htmlFor="home-type" className="home-search-panel__label">Property Category</label>
                  <div className="home-search-panel__input-wrap">
                    <Building size={15} className="home-search-panel__icon" />
                    <select
                      id="home-type"
                      className="home-search-panel__select"
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                    >
                      {propertyTypes.map((t) => (
                        <option key={t.id} value={t.id}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="home-search-panel__submit-col">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    icon={Search}
                    style={{ width: '100%' }}
                  >
                    Search Listings
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Developer Projects */}
      <section className="section home-section">
        <div className="container">
          <div className="home-section-header">
            <div>
              <span className="home-section-tag">New Developments</span>
              <h2 className="home-section-title">Verified Real Estate Projects</h2>
              <p className="home-section-sub">
                Under-construction and ready-to-move integrated master planned communities.
              </p>
            </div>
            <Link to="/admin/projects" className="home-view-all">
              <span>View all projects</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 grid-cols-2-sm grid-cols-3-md gap-md">
            {projects.slice(0, 3).map((project) => (
              <div key={project.id} className="home-project-card content-panel">
                <div className="home-project-card__top">
                  <span className="home-project-card__id">{project.id}</span>
                  <StatusBadge status={project.status} />
                </div>
                <h3 className="home-project-card__name">{project.name}</h3>
                <p className="home-project-card__loc">{project.location}</p>
                <div className="home-project-card__bottom">
                  <div>
                    <span className="home-project-card__lbl">Starting At</span>
                    <span className="home-project-card__price">{formatCurrency(project.startingPrice, true)}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="home-project-card__lbl">Available Units</span>
                    <span className="home-project-card__units">{project.availableUnits} / {project.totalUnits}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="section home-section home-section--alt">
        <div className="container">
          <div className="home-section-header">
            <div>
              <span className="home-section-tag">Curated Portfolio</span>
              <h2 className="home-section-title">Featured Residential Properties</h2>
              <p className="home-section-sub">
                Handpicked ready penthouses, family apartments, and luxury villas.
              </p>
            </div>
            <Link to="/marketplace/properties" className="home-view-all">
              <span>View all properties</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading listings..." />
          ) : (
            <div className="grid grid-cols-1 grid-cols-2-sm grid-cols-3-md gap-md">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Practical Capabilities */}
      <section className="section home-section">
        <div className="container">
          <div className="home-section-header" style={{ justifyContent: 'center', textAlign: 'center' }}>
            <div>
              <span className="home-section-tag">The Platform Standard</span>
              <h2 className="home-section-title">Engineered for Transparency & Verification</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 grid-cols-3-md gap-md">
            <div className="home-feature-card content-panel">
              <div className="home-feature-card__icon">
                <ShieldCheck size={20} />
              </div>
              <h3 className="home-feature-card__title">State RERA Verification</h3>
              <p className="home-feature-card__desc">
                Every residential listing is validated with official RERA registration certificates, ensuring legal approvals and verified land titles.
              </p>
            </div>

            <div className="home-feature-card content-panel">
              <div className="home-feature-card__icon">
                <Layers size={20} />
              </div>
              <h3 className="home-feature-card__title">Live Inventory Tracking</h3>
              <p className="home-feature-card__desc">
                Real-time unit availability sheets direct from developer sales offices. Eliminates duplicate or already-sold listings.
              </p>
            </div>

            <div className="home-feature-card content-panel">
              <div className="home-feature-card__icon">
                <CalendarCheck size={20} />
              </div>
              <h3 className="home-feature-card__title">Coordinated Site Visits</h3>
              <p className="home-feature-card__desc">
                Schedule in-person property walkthroughs with licensed advisory brokers without unsolicited cold calls.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
