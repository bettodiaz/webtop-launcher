
import React, { createContext, useState, useContext, ReactNode, useMemo } from 'react';
import { User } from '../types';
// Fix: Corrected import path for the api service.
import { mockLogin, mockLogout } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<User | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = async (username: string, password: string): Promise<User | null> => {
    const loggedInUser = await mockLogin(username, password);
    if (loggedInUser) {
      setUser(loggedInUser);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
    }
    return loggedInUser;
  };

  const logout = () => {
    mockLogout();
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = useMemo(() => ({ user, login, logout }), [user]);

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
