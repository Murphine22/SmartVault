import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { useAuth0 } from '@auth0/auth0-react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user: auth0User, isAuthenticated: isAuth0Authenticated, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    // Check local storage first
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    setLoading(false);
  }, []);

  // Sync Auth0 state with our user state if Auth0 is used
  useEffect(() => {
    const syncAuth0 = async () => {
      if (isAuth0Authenticated && auth0User && !user) {
        // Here we could register/login the Auth0 user in our backend
        // For simplicity in this demo, we mock the local state setup
        const mockUser = {
          _id: auth0User.sub,
          name: auth0User.name,
          email: auth0User.email,
          authProvider: 'auth0'
        };
        setUser(mockUser);
      }
    };
    syncAuth0();
  }, [isAuth0Authenticated, auth0User]);

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

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
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

  const logout = () => {
    try {
      api.post('/auth/logout');
    } catch (e) {
      // ignore
    }
    setUser(null);
    localStorage.removeItem('userInfo');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
