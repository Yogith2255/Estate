import { apiClient } from './api';

export const operationsService = {
  // Inventory
  async getInventory(params = {}) {
    const q = new URLSearchParams(params).toString();
    const res = await apiClient(`/inventory${q ? `?${q}` : ''}`);
    return res.data?.units || [];
  },

  async addUnit(unitData) {
    return apiClient('/inventory', {
      method: 'POST',
      body: unitData,
    });
  },

  // Site Visits
  async getSiteVisits(status = 'all') {
    const res = await apiClient(`/site-visits${status !== 'all' ? `?status=${status}` : ''}`);
    return res.data?.siteVisits || [];
  },

  async scheduleSiteVisit(visitData) {
    return apiClient('/site-visits', {
      method: 'POST',
      body: visitData,
    });
  },

  async updateSiteVisit(id, updates) {
    return apiClient(`/site-visits/${id}`, {
      method: 'PUT',
      body: updates,
    });
  },

  // Bookings
  async getBookings() {
    const res = await apiClient('/bookings');
    return res.data?.bookings || [];
  },

  async createBooking(bookingData) {
    return apiClient('/bookings', {
      method: 'POST',
      body: bookingData,
    });
  },

  async updateBooking(id, updates) {
    return apiClient(`/bookings/${id}`, {
      method: 'PUT',
      body: updates,
    });
  },

  // Payments
  async getPayments() {
    const res = await apiClient('/payments');
    return res.data?.payments || [];
  },

  async recordPayment(paymentData) {
    return apiClient('/payments', {
      method: 'POST',
      body: paymentData,
    });
  },

  // Users Management
  async getUsers(filters = {}) {
    const q = new URLSearchParams(filters).toString();
    const res = await apiClient(`/users${q ? `?${q}` : ''}`);
    return res.data?.users || [];
  },

  async createUser(userData) {
    return apiClient('/users', {
      method: 'POST',
      body: userData,
    });
  },

  async updateUser(id, updates) {
    return apiClient(`/users/${id}`, {
      method: 'PUT',
      body: updates,
    });
  },

  // Dashboard KPIs
  async getAdminStats() {
    const res = await apiClient('/dashboard/admin');
    return res.data || {};
  },

  async getAgentStats() {
    const res = await apiClient('/dashboard/agent');
    return res.data || {};
  },
};
