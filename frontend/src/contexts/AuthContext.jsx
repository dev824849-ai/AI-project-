import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('polaris_user');
    return saved ? JSON.parse(saved) : {
      id: 1,
      username: 'admin',
      full_name: 'Dr. Rajesh Sharma (Director NCAOR)',
      role: 'SUPER_ADMIN',
      email: 'admin@ncaor.gov.in',
      department: 'HQ Operations Command'
    };
  });
  const [token, setToken] = useState(() => localStorage.getItem('polaris_token') || 'demo-token');
  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const data = await authService.login(username, password);
      setToken(data.access_token);
      setUser(data.user);
      localStorage.setItem('polaris_token', data.access_token);
      localStorage.setItem('polaris_user', JSON.stringify(data.user));
      return { success: true };
    } catch (err) {
      // Demo fallback: switch role if demo test users
      if (username === 'admin') {
        const demoUser = { id: 1, username: 'admin', full_name: 'Dr. Rajesh Sharma (Director NCAOR)', role: 'SUPER_ADMIN', department: 'HQ Operations Command' };
        setUser(demoUser);
        localStorage.setItem('polaris_user', JSON.stringify(demoUser));
        return { success: true };
      } else if (username === 'ops_manager') {
        const demoUser = { id: 2, username: 'ops_manager', full_name: 'Commander Vivek Nair', role: 'OPERATIONS_MANAGER', department: 'Antarctic Logistics & Operations' };
        setUser(demoUser);
        localStorage.setItem('polaris_user', JSON.stringify(demoUser));
        return { success: true };
      } else if (username === 'bharati_lead') {
        const demoUser = { id: 3, username: 'bharati_lead', full_name: 'Dr. Ananya Sen', role: 'STATION_ADMIN', station_id: 'bharati', department: 'Bharati Station Leadership' };
        setUser(demoUser);
        localStorage.setItem('polaris_user', JSON.stringify(demoUser));
        return { success: true };
      } else if (username === 'scientist_lead') {
        const demoUser = { id: 4, username: 'scientist_lead', full_name: 'Dr. Priya Deshmukh', role: 'SCIENTIFIC_USER', department: 'Polar Cryosphere Science' };
        setUser(demoUser);
        localStorage.setItem('polaris_user', JSON.stringify(demoUser));
        return { success: true };
      }
      return { success: false, error: err.response?.data?.detail || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('polaris_token');
    localStorage.removeItem('polaris_user');
  };

  const switchRoleQuickly = (role) => {
    const rolesMap = {
      SUPER_ADMIN: { id: 1, username: 'admin', full_name: 'Dr. Rajesh Sharma (Director NCAOR)', role: 'SUPER_ADMIN', department: 'HQ Operations Command' },
      OPERATIONS_MANAGER: { id: 2, username: 'ops_manager', full_name: 'Commander Vivek Nair', role: 'OPERATIONS_MANAGER', department: 'Antarctic Logistics & Operations' },
      STATION_ADMIN: { id: 3, username: 'bharati_lead', full_name: 'Dr. Ananya Sen', role: 'STATION_ADMIN', station_id: 'bharati', department: 'Bharati Station Leadership' },
      SCIENTIFIC_USER: { id: 4, username: 'scientist_lead', full_name: 'Dr. Priya Deshmukh', role: 'SCIENTIFIC_USER', department: 'Polar Cryosphere Science' }
    };
    const newUser = rolesMap[role] || rolesMap.SUPER_ADMIN;
    setUser(newUser);
    localStorage.setItem('polaris_user', JSON.stringify(newUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, switchRoleQuickly, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
