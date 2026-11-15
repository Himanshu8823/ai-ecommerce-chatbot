import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ecom_chatbot_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('ecom_chatbot_token') || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If no user is stored, load the default demo profile for seamless experience
    if (!user) {
      api.getProfile().then(res => {
        if (res.success) {
          setUser(res.user);
          localStorage.setItem('ecom_chatbot_user', JSON.stringify(res.user));
        }
      }).catch(console.error);
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await api.login(email, password);
      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('ecom_chatbot_user', JSON.stringify(data.user));
        localStorage.setItem('ecom_chatbot_token', data.token);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (err) {
      return { success: false, message: 'Server connection error.' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const data = await api.register(userData);
      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('ecom_chatbot_user', JSON.stringify(data.user));
        localStorage.setItem('ecom_chatbot_token', data.token);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (err) {
      return { success: false, message: 'Server connection error.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('ecom_chatbot_user');
    localStorage.removeItem('ecom_chatbot_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
