import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const rawUserInfo = localStorage.getItem('userInfo');
        if (!rawUserInfo) {
          setUser(null);
          return;
        }

        const parsedUserInfo = JSON.parse(rawUserInfo);
        if (!parsedUserInfo?.token) {
          throw new Error('No auth token found');
        }

        const { data } = await api.get('/auth/profile');
        if (data?.success && data?.user) {
          setUser(data.user);
          localStorage.setItem('userInfo', JSON.stringify({ ...parsedUserInfo, user: data.user }));
        } else {
          throw new Error('Invalid profile response');
        }
      } catch (error) {
        console.warn('Session restore failed', error);
        setUser(null);
        localStorage.removeItem('userInfo');
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.success) {
      const authData = {
        ...data,
        user: data.user,
        token: data.token,
      };
      setUser(authData.user);
      localStorage.setItem('userInfo', JSON.stringify(authData));
      return authData;
    }
    throw new Error('Login failed');
  };

  const register = async (name, email, password, inviteToken) => {
    const { data } = await api.post('/auth/register', { name, email, password, inviteToken });
    if (data.success) {
      const authData = {
        ...data,
        user: data.user,
        token: data.token,
      };
      setUser(authData.user);
      localStorage.setItem('userInfo', JSON.stringify(authData));
      return authData;
    }
    throw new Error('Registration failed');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    const stored = localStorage.getItem('userInfo');
    if (stored) {
      const parsed = JSON.parse(stored);
      const next = { ...parsed, user: updatedUser, token: parsed.token };
      localStorage.setItem('userInfo', JSON.stringify(next));
    }
  };

  const logout = async () => {
    try {
      const stored = localStorage.getItem('userInfo');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.token) {
          await api.post('/auth/logout', {}, { withCredentials: true });
        }
      }
    } catch (e) {
      console.warn('Logout request failed', e);
    } finally {
      setUser(null);
      localStorage.removeItem('userInfo');
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
