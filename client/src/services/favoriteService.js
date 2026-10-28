import { apiClient } from './api';

export const favoriteService = {
  /**
   * Get authenticated user's saved properties
   */
  async getFavorites() {
    try {
      const res = await apiClient('/favorites');
      if (res.success && Array.isArray(res.data?.properties)) {
        return res.data.properties.map((p) => ({
          ...p,
          id: p._id || p.id,
        }));
      }
      return [];
    } catch (err) {
      console.error('Failed to fetch favorites:', err);
      return [];
    }
  },

  /**
   * Save property to favorites
   */
  async addFavorite(propertyId) {
    return apiClient('/favorites', {
      method: 'POST',
      body: { propertyId },
    });
  },

  /**
   * Remove property from favorites
   */
  async removeFavorite(propertyId) {
    return apiClient(`/favorites/${propertyId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Check if a property is saved
   */
  async checkFavorite(propertyId) {
    try {
      const res = await apiClient(`/favorites/check/${propertyId}`);
      return Boolean(res.data?.isSaved);
    } catch {
      return false;
    }
  },
};
