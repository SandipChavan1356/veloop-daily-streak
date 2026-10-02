import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import * as authApi from '../services/authApi';

const AuthContext = createContext(null);

const TOKEN_KEY = 'veloop_token';
const USER_KEY = 'veloop_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const persist = (nextToken, nextUser) => {
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  };

  const login = useCallback(async (email, password) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await authApi.login({ email, password });
      persist(res.token, res.user);
      return true;
    } catch (err) {
      setAuthError(err.message || 'Login failed.');
      return false;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const register = useCallback(async (username, email, password) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await authApi.register({ username, email, password });
      persist(res.token, res.user);
      return true;
    } catch (err) {
      setAuthError(err.message || 'Registration failed.');
      return false;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  // If the backend ever rejects the token (expired/invalid), log out cleanly.
  useEffect(() => {
    const onUnauthorized = () => logout();
    window.addEventListener('veloop:unauthorized', onUnauthorized);
    return () => window.removeEventListener('veloop:unauthorized', onUnauthorized);
  }, [logout]);

  const value = useMemo(
    () => ({ user, token, isAuthenticated: Boolean(token), authLoading, authError, login, register, logout }),
    [user, token, authLoading, authError, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
