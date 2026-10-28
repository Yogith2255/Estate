import { apiClient, tokenStorage } from './api';

export const authService = {
  demoCredentials: [
    { role: 'Customer', email: 'customer@demo.com', password: 'Customer@123' },
    { role: 'Agent', email: 'agent@demo.com', password: 'Agent@123' },
    { role: 'Admin', email: 'admin@demo.com', password: 'Admin@123' },
  ],

  /**
   * Authenticate user with backend API
   */
  async signIn(email, password, rememberMe = false) {
    if (!email || !password) {
      return { success: false, error: 'Please enter both email and password.' };
    }

    try {
      const res = await apiClient('/auth/login', {
        method: 'POST',
        body: {
          email: email.trim().toLowerCase(),
          password,
        },
      });

      if (res.success && res.data?.token) {
        tokenStorage.setToken(res.data.token);
        tokenStorage.setUser(res.data.user);
        return { success: true, user: res.data.user };
      }

      return { success: false, error: res.message || 'Login failed.' };
    } catch (err) {
      return { success: false, error: err.message || 'Login failed. Please check credentials.' };
    }
  },


  /**
   * Register a customer or organisation admin with the backend API
   */
  async register({ name, email, phone, password, role = 'customer', organisationName }) {
    if (!name || !email || !password) {
      return { success: false, error: 'Name, email, and password are required.' };
    }

    try {
      const res = await apiClient('/auth/register', {
        method: 'POST',
        body: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone ? phone.trim() : '',
          password,
          role,
          organisationName: organisationName?.trim() || '',
        },
      });

      if (res.success && res.data?.token) {
        tokenStorage.setToken(res.data.token);
        tokenStorage.setUser(res.data.user);
        return { success: true, user: res.data.user };
      }

      return { success: false, error: res.message || 'Registration failed.' };
    } catch (err) {
      return { success: false, error: err.message || 'Registration failed.' };
    }
  },


  /**
   * Restore and verify active session with backend API
   */
  async restoreSession() {
    const token = tokenStorage.getToken();
    if (!token) return null;

    try {
      const res = await apiClient('/auth/me');
      if (res.success && res.data?.user) {
        tokenStorage.setUser(res.data.user);
        return res.data.user;
      }
      tokenStorage.clear();
      return null;
    } catch (err) {
      tokenStorage.clear();
      return null;
    }
  },

  /**
   * Return current cached user from session
   */
  getCurrentUser() {
    return tokenStorage.getUser();
  },

  /**
   * Check if token is present
   */
  isAuthenticated() {
    return Boolean(tokenStorage.getToken());
  },

  /**
   * Sign out user
   */
  async signOut() {
    try {
      await apiClient('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    } finally {
      tokenStorage.clear();
    }
  },

  /**
   * Return default home route for role
   */
  getHomeRoute(role) {
    switch (role) {
      case 'admin': return '/admin';
      case 'agent': return '/agent/listings';
      case 'customer': return '/marketplace';
      default: return '/login';
    }
  },
};
