import { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (userData) setUser(userData);
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const response = await api.post('token/', { username, password });
    const { access, refresh } = response.data;
    localStorage.setItem('token', access);
    localStorage.setItem('refresh', refresh);

    // Fetch the authenticated user's profile from /me/
    const meRes = await api.get('me/', {
      headers: { Authorization: `Bearer ${access}` },
    });
    const currentUser = meRes.data;
    localStorage.setItem('user', JSON.stringify(currentUser));
    setUser(currentUser);
    return currentUser;
  };

  const register = async ({ username, email, password }) => {
    await api.post('register/', { username, email, password });
    // Auto-login after successful registration
    return login(username, password);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

