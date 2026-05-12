import React, { createContext, useContext, useState, useEffect } from 'react';
import { TokenService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = TokenService.getAccessToken();
    setIsAuthenticated(!!token);
  }, []);

  const login = (accessToken, refreshToken) => {
    TokenService.setTokens(accessToken, refreshToken);
    setIsAuthenticated(true);
  };

  const logout = () => {
    TokenService.clearTokens();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
