import { createContext, useContext, useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('hms_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [sessionId, setSessionId] = useState(() => localStorage.getItem('hms_session'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) localStorage.setItem('hms_user', JSON.stringify(user));
    else localStorage.removeItem('hms_user');
  }, [user]);

  async function login(email, password) {
    setLoading(true);
    try {
      const { data } = await axiosClient.post('/auth/login', { email, password });
      localStorage.setItem('hms_token', data.token);
      localStorage.setItem('hms_session', data.sessionId);
      setSessionId(data.sessionId);
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  }

  async function register(payload) {
    setLoading(true);
    try {
      const { data } = await axiosClient.post('/auth/register', payload);
      localStorage.setItem('hms_token', data.token);
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      await axiosClient.post('/auth/logout', { sessionId });
    } catch {
      // ignore network errors on logout
    }
    localStorage.removeItem('hms_token');
    localStorage.removeItem('hms_session');
    setUser(null);
    setSessionId(null);
  }

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
