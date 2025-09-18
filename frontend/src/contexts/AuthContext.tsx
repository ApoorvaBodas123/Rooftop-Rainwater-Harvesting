import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';

// Using Vite's import.meta.env for environment variables
const API_URL = import.meta.env.VITE_API_URL || '/api';

type User = {
  name: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{
    _id: string;
    name: string;
    email: string;
  }>;
  signup: (name: string, email: string, password: string) => Promise<{
    _id: string;
    name: string;
    email: string;
  }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get(`${API_URL}/auth/me`, { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data && response.data.data) {
          setUser(response.data.data);
          localStorage.setItem('user', JSON.stringify(response.data.data));
        } else {
          setUser(null);
          localStorage.removeItem('user');
        }
      } catch (err) {
        // If not authenticated, clear any stale data
        setUser(null);
        localStorage.removeItem('user');
      }
    };

    checkAuthStatus();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      // Clear any existing user data
      setUser(null);
      localStorage.removeItem('user');
      
      // Make the login request
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Get user data from response and update state
      const { user: userData, token } = response.data;
      
      if (!userData) {
        throw new Error('No user data received');
      }
      
      // Format user data to match our User type
      const user = {
        _id: userData._id,
        name: userData.name,
        email: userData.email
      };
      
      // Update state and storage
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set the token in localStorage for subsequent requests
      if (token) {
        localStorage.setItem('token', token);
      }
      
      return user;
    } catch (err: any) {
      // Clear any partial state on error
      setUser(null);
      localStorage.removeItem('user');
      
      const errorMessage = err.response?.data?.message || 'Failed to login. Please check your credentials.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const { user: userData, token } = response.data;
      
      if (!userData) {
        throw new Error('No user data received');
      }
      
      // Format user data to match our User type
      const user = {
        _id: userData._id,
        name: userData.name,
        email: userData.email
      };
      
      // Update state and storage
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set the token in localStorage for subsequent requests
      if (token) {
        localStorage.setItem('token', token);
      }
      
      return user;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await axios.get(`${API_URL}/auth/logout`, { withCredentials: true });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
    }
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
