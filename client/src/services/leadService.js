import { apiClient } from './api';

export const leadService = {
  /**
   * Get leads for current authorized user / role
   */
  async getLeads(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.status && filters.status !== 'all') params.set('status', filters.status);
      if (filters.agent && filters.agent !== 'all') params.set('agent', filters.agent);
      if (filters.project && filters.project !== 'all') params.set('project', filters.project);
      if (filters.search) params.set('search', filters.search);

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const res = await apiClient(`/leads${queryString}`);

      if (res.success && Array.isArray(res.data?.leads)) {
        return res.data.leads.map((l) => ({
          ...l,
          id: l._id || l.id,
          leadName: l.customerName || l.leadName,
          nextFollowup: l.nextFollowUpAt || l.nextFollowup || 'Pending',
        }));
      }

      return [];
    } catch (err) {
      console.error('Failed to fetch leads from API:', err);
      return [];
    }
  },

  /**
   * Get lead by ID with its activity log
   */
  async getLeadById(id) {
    return apiClient(`/leads/${id}`);
  },

  /**
   * Customer / Public enquiry submission
   */
  async submitEnquiry(enquiryData) {
    return apiClient('/leads/enquiry', {
      method: 'POST',
      body: enquiryData,
    });
  },

  /**
   * Create lead manually
   */
  async createLead(leadData) {
    return apiClient('/leads', {
      method: 'POST',
      body: leadData,
    });
  },

  /**
   * Update lead status, notes, or assigned agent
   */
  async updateLead(id, updates) {
    return apiClient(`/leads/${id}`, {
      method: 'PUT',
      body: updates,
    });
  },
};
