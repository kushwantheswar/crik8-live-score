import { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
        // In a real app, you'd verify the token or fetch user profile
        const userData = JSON.parse(localStorage.getItem('user'));
        if (userData) setUser(userData);
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const response = await api.post('token/', { username, password });
    localStorage.setItem('token', response.data.access);
    localStorage.setItem('refresh', response.data.refresh);
    
    // Fetch user details or decode token
    // For simplicity, we'll assume the API returns enough or we fetch it
    // Let's mock a user fetch
    const userRes = await api.get('users/'); 
    const currentUser = userRes.data.find(u => u.username === username);
    
    localStorage.setItem('user', JSON.stringify(currentUser));
    setUser(currentUser);
    return currentUser;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
