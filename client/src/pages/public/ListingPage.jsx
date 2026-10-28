import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, RefreshCw } from 'lucide-react';
import PropertyCard from '../../components/property/PropertyCard';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { propertyService } from '../../services/propertyService';
import { propertyTypes } from '../../data/mockCategories';
import './ListingPage.css';

export default function ListingPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const typeParam = searchParams.get('type') || 'all';
  const propertyTypeParam = searchParams.get('propertyType') || 'all';
  const queryParam = searchParams.get('search') || '';

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [listingType, setListingType] = useState(typeParam);
  const [propertyType, setPropertyType] = useState(propertyTypeParam);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    async function fetchListings() {
      setLoading(true);
      try {
        const data = await propertyService.getProperties({
          listingType: listingType !== 'all' ? listingType : undefined,
          propertyType: propertyType !== 'all' ? propertyType : undefined,
          search: searchQuery || undefined,
        });
        setProperties(data);
      } catch (err) {
        console.error('Failed to load listings', err);
      } finally {
        setLoading(false);
      }
    }

    fetchListings();
  }, [listingType, propertyType, searchQuery]);

  const sortedProperties = useMemo(() => {
    const list = [...properties];
    if (sortBy === 'price-low') {
      return list.sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'price-high') {
      return list.sort((a, b) => b.price - a.price);
    }
    if (sortBy === 'sqft') {
      return list.sort((a, b) => b.specs.sqft - a.specs.sqft);
    }
    return list;
  }, [properties, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setListingType('all');
    setPropertyType('all');
    setSortBy('newest');
    setSearchParams({});
  };

  return (
    <div className="listing-page">
      {/* Top Filter Bar */}
      <section className="listing-header">
        <div className="container">
          <div className="listing-header__top">
            <div>
              <h1 className="listing-header__title">Residential Property Listings</h1>
              <p className="listing-header__subtitle">
                Verified developer projects, penthouses, and gated community villas across top Indian metropolitan regions.
              </p>
            </div>
            <div className="listing-header__count">
              <span className="listing-header__count-num">{properties.length}</span>
              <span className="listing-header__count-label">Active Listings Found</span>
            </div>
          </div>

          <div className="listing-controls content-panel">
            {/* Search input */}
            <div className="listing-controls__search">
              <Input
                placeholder="Search by city, micro-market, landmark..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={Search}
              />
            </div>

            {/* Type selector */}
            <div className="listing-controls__filter">
              <Select
                value={listingType}
                onChange={(e) => setListingType(e.target.value)}
                options={[
                  { value: 'all', label: 'All Transactions (Sale & Rent)' },
                  { value: 'sale', label: 'For Sale' },
                  { value: 'rent', label: 'For Rent' },
                ]}
              />
            </div>

            {/* Property category selector */}
            <div className="listing-controls__filter">
              <Select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                options={propertyTypes.map((t) => ({ value: t.id, label: t.label }))}
              />
            </div>

            {/* Sort selector */}
            <div className="listing-controls__filter">
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                options={[
                  { value: 'newest', label: 'Sort: Newest First' },
                  { value: 'price-low', label: 'Price: Low to High' },
                  { value: 'price-high', label: 'Price: High to Low' },
                  { value: 'sqft', label: 'Area: Largest First' },
                ]}
              />
            </div>

            {(searchQuery || listingType !== 'all' || propertyType !== 'all') && (
              <Button
                variant="ghost"
                size="md"
                icon={RefreshCw}
                onClick={handleResetFilters}
                className="listing-controls__reset"
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Property Results Grid */}
      <section className="section listing-results">
        <div className="container">
          {loading ? (
            <LoadingSpinner message="Searching verified property database..." />
          ) : sortedProperties.length === 0 ? (
            <EmptyState
              title="No properties match your current filters"
              description="Try adjusting your micro-market location, clearing specific filters, or viewing both sale and rental units."
              actionLabel="Reset All Filters"
              onAction={handleResetFilters}
            />
          ) : (
            <div className="grid grid-cols-1 grid-cols-2-sm grid-cols-3-md gap-md">
              {sortedProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
