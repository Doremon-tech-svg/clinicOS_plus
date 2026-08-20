import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();
const STORAGE_KEY = 'cp_session';
const SESSION_DURATION_HOURS = 12;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage on mount
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const { user: savedUser, token: savedToken, expiresAt } = JSON.parse(saved);
        // Check if session is still valid
        if (expiresAt && Date.now() < expiresAt) {
          setUser(savedUser);
          setToken(savedToken);
        } else {
          // Session expired — clear it
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, jwtToken) => {
    const expiresAt = Date.now() + SESSION_DURATION_HOURS * 60 * 60 * 1000;
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: userData, token: jwtToken, expiresAt }));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
