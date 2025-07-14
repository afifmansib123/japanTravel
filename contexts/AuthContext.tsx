'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  role: 'customer' | 'admin';
  name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (from localStorage for demo)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    // Demo authentication logic
    // In real implementation, use AWS Cognito
    if (email === 'admin@wanderlust.com' && password === 'admin123') {
      const adminUser = { id: '1', email, role: 'admin' as const, name: 'Admin User' };
      setUser(adminUser);
      localStorage.setItem('user', JSON.stringify(adminUser));
    } else if (password === 'demo123') {
      const customerUser = { id: '2', email, role: 'customer' as const, name: 'Demo Customer' };
      setUser(customerUser);
      localStorage.setItem('user', JSON.stringify(customerUser));
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    // Demo sign up logic
    // In real implementation, use AWS Cognito
    const newUser = { 
      id: Date.now().toString(), 
      email, 
      role: 'customer' as const, 
      name: name || 'New User' 
    };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}