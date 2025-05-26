import React, { createContext, useContext, useState, useEffect } from 'react';

type User = {
  id: string;
  name: string;
  email: string;
  isGuest: boolean;
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loginAsGuest: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Simulate checking for existing session on app load
  useEffect(() => {
    const checkSession = async () => {
      try {
        // In a real app, check for stored tokens or session data
        // For demo purposes, we'll create a mock guest user
        setUser({
          id: 'guest-user',
          name: 'Invitado',
          email: '',
          isGuest: true,
        });
      } catch (error) {
        console.error('Session check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  // Mock authentication functions
  const login = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, validate credentials with your auth service
      setUser({
        id: 'user-123',
        name: 'Usuario Autenticado',
        email: email,
        isGuest: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, register with your auth service
      setUser({
        id: 'user-123',
        name: name,
        email: email,
        isGuest: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Clear user data
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const loginAsGuest = async () => {
    setLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUser({
        id: 'guest-user',
        name: 'Invitado',
        email: '',
        isGuest: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, handle Google OAuth
      setUser({
        id: 'google-user-123',
        name: 'Usuario Google',
        email: 'usuario@gmail.com',
        isGuest: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const loginWithApple = async () => {
    setLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, handle Apple OAuth
      setUser({
        id: 'apple-user-123',
        name: 'Usuario Apple',
        email: 'usuario@icloud.com',
        isGuest: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    loginAsGuest,
    loginWithGoogle,
    loginWithApple,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};