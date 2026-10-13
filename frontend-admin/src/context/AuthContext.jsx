import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('adminToken');
    if (savedToken) {
      setToken(savedToken);
      // Try to get admin info from token payload
      try {
        const payload = JSON.parse(atob(savedToken.split('.')[1]));
        setAdmin({ id: payload.id, role: payload.role });
      } catch { /* invalid token */ }
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/admin-login', { email, password });
    const { token: newToken, admin: adminData } = res.data.data;
    localStorage.setItem('adminToken', newToken);
    setToken(newToken);
    setAdmin(adminData);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
    setAdmin(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ admin, token, isLoading, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
