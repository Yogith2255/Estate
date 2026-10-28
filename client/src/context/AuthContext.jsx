import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [loading, setLoading] = useState(true);

  // Restore and verify session on load
  useEffect(() => {
    let isMounted = true;
    async function restore() {
      try {
        const verifiedUser = await authService.restoreSession();
        if (isMounted) {
          setUser(verifiedUser);
        }
      } catch {
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    restore();

    const handleExpired = () => {
      setUser(null);
    };
    window.addEventListener('auth:expired', handleExpired);

    return () => {
      isMounted = false;
      window.removeEventListener('auth:expired', handleExpired);
    };
  }, []);

  const signIn = useCallback(async (email, password, rememberMe = false) => {
    setLoading(true);
    try {
      const result = await authService.signIn(email, password, rememberMe);
      if (result.success) {
        setUser(result.user);
      }
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (fields) => {
    setLoading(true);
    try {
      const result = await authService.register(fields);
      if (result.success) {
        setUser(result.user);
      }
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      await authService.signOut();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const getHomeRoute = useCallback(
    (role) => authService.getHomeRoute(role ?? user?.role),
    [user]
  );

  const value = {
    user,
    loading,
    isAuthenticated: user !== null,
    isCustomer: user?.role === 'customer',
    isAgent: user?.role === 'agent',
    isAdmin: user?.role === 'admin',
    signIn,
    register,
    signOut,
    getHomeRoute,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
