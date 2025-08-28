import React, { createContext, useContext, useState, useEffect } from 'react';
import { bellagestClient } from '../api/bellagestClient';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar se há um token salvo e carregar dados do usuário
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('bellagest_token');
      if (token) {
        try {
          const userData = await bellagestClient.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Erro ao carregar dados do usuário:', error);
          bellagestClient.clearToken();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      // Fazer login
      const response = await bellagestClient.login(email, password);
      
      // Buscar dados do usuário após login bem-sucedido
      const userData = await bellagestClient.getCurrentUser();
      setUser(userData);
      
      return response;
    } catch (error) {
      setError(error.message || 'Erro ao fazer login');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    bellagestClient.clearToken();
    setUser(null);
    setError(null);
  };

  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await bellagestClient.register(userData);
      
      // Buscar dados do usuário após registro bem-sucedido
      const userInfo = await bellagestClient.getCurrentUser();
      setUser(userInfo);
      
      return response;
    } catch (error) {
      setError(error.message || 'Erro ao fazer cadastro');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    register,
    clearError,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
