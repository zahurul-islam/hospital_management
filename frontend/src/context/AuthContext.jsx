import { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.getProfile();

      const { user: userData, profile } = response.data;

      // Update user with profile data
      const updatedUser = { ...userData, profile };

      localStorage.setItem('user', JSON.stringify(updatedUser));

      setUser(updatedUser);

      return updatedUser;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to get profile');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      // Check if user is logged in
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      if (storedUser && token) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        // Always fetch fresh profile data
        try {
          await getProfile();
        } catch (err) {
          console.error('Error fetching profile:', err);
        }
      }

      setLoading(false);
    };

    init();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.login({ email, password });

      const { user, token } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      setUser(user);

      // Fetch profile data immediately after login
      try {
        await getProfile();
      } catch (err) {
        console.error('Error fetching profile after login:', err);
      }

      return user;
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.register(userData);

      const { user, token } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      setUser(user);

      // Fetch profile data immediately after registration
      try {
        await getProfile();
      } catch (err) {
        console.error('Error fetching profile after registration:', err);
      }

      return user;
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        getProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
