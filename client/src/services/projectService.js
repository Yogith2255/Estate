import { apiClient } from './api';

export const projectService = {
  /**
   * Get all developer projects with optional filtering
   */
  async getProjects(filters = {}) {
    try {
      const params = new URLSearchParams();

      if (filters.search) params.set('search', filters.search);
      if (filters.city && filters.city !== 'all') params.set('city', filters.city);
      if (filters.status && filters.status !== 'all') params.set('status', filters.status);
      if (filters.category && filters.category !== 'all') params.set('category', filters.category);
      if (filters.featured) params.set('featured', 'true');

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const res = await apiClient(`/projects${queryString}`);

      if (res.success && Array.isArray(res.data?.projects)) {
        return res.data.projects.map((p) => ({
          ...p,
          id: p._id || p.id,
          name: p.projectName || p.name,
          location: p.location || p.fullAddress || (p.locality ? `${p.locality}, ${p.city}` : p.city),
        }));
      }

      return [];
    } catch (err) {
      console.error('Failed to fetch projects from API:', err);
      return [];
    }
  },

  /**
   * Get project by ID or slug
   */
  async getProjectById(id) {
    const res = await apiClient(`/projects/${id}`);
    if (res.success && res.data?.project) {
      const p = res.data.project;
      return {
        ...p,
        id: p._id || p.id,
        name: p.projectName || p.name,
        location: p.location || p.fullAddress || (p.locality ? `${p.locality}, ${p.city}` : p.city),
        unitTypes: res.data.unitTypes || [],
      };
    }
    throw new Error(res.message || 'Project not found');
  },

  /**
   * Create new project
   */
  async createProject(projectData) {
    return apiClient('/projects', {
      method: 'POST',
      body: projectData,
    });
  },

  /**
   * Update project
   */
  async updateProject(id, updates) {
    return apiClient(`/projects/${id}`, {
      method: 'PUT',
      body: updates,
    });
  },

  /**
   * Delete project
   */
  async deleteProject(id) {
    return apiClient(`/projects/${id}`, {
      method: 'DELETE',
    });
  },
};
