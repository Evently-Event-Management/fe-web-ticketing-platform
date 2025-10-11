'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import mockKeycloak from './keycloak';

// Define the context type
interface AuthContextType {
  isAuthenticated: boolean;
  keycloak: any;
  isLoading: boolean;
  error: string | null;
  login: () => void;
  logout: () => void;
}

// Create a default context value
const defaultAuthContext: AuthContextType = {
  isAuthenticated: true,
  keycloak: mockKeycloak,
  isLoading: false,
  error: null,
  login: () => {},
  logout: () => {}
};

// Create the context
const AuthContext = createContext<AuthContextType>(defaultAuthContext);

// Create a provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Return the mock context provider
  return (
    <AuthContext.Provider value={defaultAuthContext}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a hook for using the auth context
export const useAuth = () => useContext(AuthContext);

export default AuthContext;