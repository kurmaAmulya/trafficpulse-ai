import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('traffic_token') || '');
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState({ connected: false, mode: 'Initializing...' });
  const [demoUsers, setDemoUsers] = useState([]);

  // Fetch db health and demo users
  const refreshSystemInfo = async () => {
    try {
      const [healthRes, demoRes] = await Promise.all([
        api.get('/health').catch(() => ({ data: { database: { connected: false, mode: 'Local Demo Store' } } })),
        api.get('/auth/demo-users').catch(() => ({ data: { demoUsers: [] } }))
      ]);
      if (healthRes?.data?.database) {
        setDbStatus(healthRes.data.database);
      }
      if (demoRes?.data?.demoUsers) {
        setDemoUsers(demoRes.data.demoUsers);
      }
    } catch (e) {
      console.warn('System status fetch notice:', e);
    }
  };

  // Verify stored token or default to Traffic Officer for instant first demo experience
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      await refreshSystemInfo();

      const savedToken = localStorage.getItem('traffic_token');
      if (savedToken) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
        } catch (err) {
          console.warn('Auto-login failed, falling back to demo login:', err.message);
          await quickSwitchRole('officer');
        }
      } else {
        // Default to officer for immediate hackathon wow-factor
        await quickSwitchRole('officer');
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: newToken, user: newUser } = res.data;
      localStorage.setItem('traffic_token', newToken);
      setToken(newToken);
      setUser(newUser);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please check credentials.'
      };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      const { token: newToken, user: newUser } = res.data;
      localStorage.setItem('traffic_token', newToken);
      setToken(newToken);
      setUser(newUser);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed.'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('traffic_token');
    setToken('');
    setUser(null);
  };

  // 1-Click fast role switcher for live hackathon judging
  const quickSwitchRole = async (targetRole) => {
    const roleEmailMap = {
      officer: 'officer@traffic.gov',
      admin: 'admin@traffic.gov',
      owner: 'owner@citizen.in',
      driver: 'driver@citizen.in',
      citizen: 'citizen@citizen.in',
    };

    const targetEmail = roleEmailMap[targetRole] || 'officer@traffic.gov';
    return await login(targetEmail, 'password123');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        dbStatus,
        demoUsers,
        login,
        register,
        logout,
        quickSwitchRole,
        refreshSystemInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
