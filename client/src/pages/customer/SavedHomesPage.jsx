import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import PropertyCard from '../../components/property/PropertyCard';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { favoriteService } from '../../services/favoriteService';

export default function SavedHomesPage() {
  const [savedProperties, setSavedProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSaved() {
      setLoading(true);
      try {
        const data = await favoriteService.getFavorites();
        setSavedProperties(data);
      } catch (err) {
        console.error('Failed to load saved properties', err);
      } finally {
        setLoading(false);
      }
    }
    loadSaved();
  }, []);

  return (
    <div className="container section">
      <div className="section-header">
        <h1 className="section-title">Saved Properties</h1>
        <p className="section-subtitle">
          Keep track of homes you are evaluating and monitor price adjustments or status changes.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading your saved properties..." />
      ) : savedProperties.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No saved properties yet"
          description="Click the save button on any property listing to monitor it here."
          actionLabel="Explore Available Homes"
          onAction={() => window.location.assign('/marketplace/properties')}
        />
      ) : (
        <div className="grid grid-cols-1 grid-cols-2-sm grid-cols-3-md gap-md">
          {savedProperties.map((property) => (
            <PropertyCard key={property.id || property._id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}
