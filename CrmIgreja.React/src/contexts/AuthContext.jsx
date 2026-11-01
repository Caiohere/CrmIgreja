import React, { createContext, useContext } from 'react';

// Versão de demonstração: sem login, o usuário está sempre autenticado.
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const value = { isAuthenticated: true, login: () => {}, logout: () => {} };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
