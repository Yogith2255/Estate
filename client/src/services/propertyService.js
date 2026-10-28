import { apiClient } from './api';

export const propertyService = {
  /**
   * Get all properties from backend API with optional filtering
   */
  async getProperties(filters = {}) {
    try {
      const params = new URLSearchParams();

      if (filters.listingType && filters.listingType !== 'all') {
        params.set('listingType', filters.listingType);
      }
      if (filters.propertyType && filters.propertyType !== 'all') {
        params.set('propertyType', filters.propertyType);
      }
      if (filters.search) {
        params.set('search', filters.search);
      }
      if (filters.city && filters.city !== 'all') {
        params.set('city', filters.city);
      }
      if (filters.featuredOnly) {
        params.set('featuredOnly', 'true');
      }
      if (filters.sortBy) {
        params.set('sortBy', filters.sortBy);
      }

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const res = await apiClient(`/properties${queryString}`);

      if (res.success && Array.isArray(res.data?.properties)) {
        return res.data.properties.map((p) => ({
          ...p,
          id: p._id || p.id,
        }));
      }

      return [];
    } catch (err) {
      console.error('Failed to fetch properties from API:', err);
      return [];
    }
  },

  /**
   * Get property by ID from backend API
   */
  async getPropertyById(id) {
    const res = await apiClient(`/properties/${id}`);
    if (res.success && res.data?.property) {
      const p = res.data.property;
      return {
        ...p,
        id: p._id || p.id,
      };
    }
    throw new Error(res.message || 'Property not found');
  },

  /**
   * Create new property listing
   */
  async createProperty(propertyData) {
    const res = await apiClient('/properties', {
      method: 'POST',
      body: propertyData,
    });
    return res;
  },

  /**
   * Update existing property
   */
  async updateProperty(id, updates) {
    const res = await apiClient(`/properties/${id}`, {
      method: 'PUT',
      body: updates,
    });
    return res;
  },

  /**
   * Delete property
   */
  async deleteProperty(id) {
    const res = await apiClient(`/properties/${id}`, {
      method: 'DELETE',
    });
    return res;
  },
};
