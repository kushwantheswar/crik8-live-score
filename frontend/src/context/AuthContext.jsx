import { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Initialise synchronously from localStorage so ProtectedRoute
    // doesn't see null on the very first render after login.
    try {
      const token = localStorage.getItem('token');
      const stored = localStorage.getItem('user');
      if (token && stored) return JSON.parse(stored);
    } catch (_) {}
    return null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // After mount verify token is still there (handles tab close / clear)
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const response = await api.post('token/', { username, password });
    const { access, refresh } = response.data;
    localStorage.setItem('token', access);
    localStorage.setItem('refresh', refresh);

    // Fetch profile using the just-obtained token
    const meRes = await api.get('me/', {
      headers: { Authorization: `Bearer ${access}` },
    });
    const currentUser = meRes.data;
    localStorage.setItem('user', JSON.stringify(currentUser));
    setUser(currentUser);    // sync update — React batches this before navigate
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
