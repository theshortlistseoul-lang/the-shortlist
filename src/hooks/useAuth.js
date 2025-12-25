'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // localStorage에서 사용자 정보 복원
    const stored = localStorage.getItem('shortlist_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem('shortlist_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (participant) => {
    setUser(participant);
    localStorage.setItem('shortlist_user', JSON.stringify(participant));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('shortlist_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
