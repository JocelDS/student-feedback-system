import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { checkSession, login as apiLogin } from './api.js';

const AuthContext = createContext(null);
const STORAGE_KEY = 'sfs_admin_token';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY));
  const [checking, setChecking] = useState(Boolean(localStorage.getItem(STORAGE_KEY)));

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
  }, []);

  // On first load, make sure a saved token is still valid
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    checkSession(saved)
      .catch(() => logout())
      .finally(() => setChecking(false));
  }, [logout]);

  const login = useCallback(async (username, password) => {
    const { token: newToken } = await apiLogin(username, password);
    localStorage.setItem(STORAGE_KEY, newToken);
    setToken(newToken);
  }, []);

  const value = useMemo(
    () => ({ token, isAdmin: Boolean(token), checking, login, logout }),
    [token, checking, login, logout]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
