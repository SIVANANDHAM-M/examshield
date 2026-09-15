import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('examshield_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('examshield_token') || null);
  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const response = await authService.login(username, password);
      const data = response.data;
      const userInfo = {
        id: data.id,
        username: data.username,
        fullName: data.fullName,
        email: data.email,
        roles: data.roles || [],
      };
      setToken(data.token);
      setUser(userInfo);
      localStorage.setItem('examshield_token', data.token);
      localStorage.setItem('examshield_user', JSON.stringify(userInfo));
      return userInfo;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('examshield_token');
    localStorage.removeItem('examshield_user');
  };

  const hasRole = (role) => {
    if (!user || !user.roles) return false;
    const target = role.startsWith('ROLE_') ? role : `ROLE_${role}`;
    return user.roles.includes(target);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
