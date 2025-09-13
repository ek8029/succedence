'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { showNotification } from '@/components/Notification';

interface User {
  name: string;
  role: 'BUYER' | 'SELLER' | 'ADMIN';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (userData: User) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Initialize auth state from localStorage
    const initializeAuth = () => {
      try {
        const userData = localStorage.getItem('dealsense_user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        localStorage.removeItem('dealsense_user');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signIn = async (userData: User): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store user data
      localStorage.setItem('dealsense_user', JSON.stringify(userData));
      setUser(userData);
      
      showNotification(`Welcome to DealSense, ${userData.name}!`, 'success');
      
      // Redirect based on role
      setTimeout(() => {
        if (userData.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      }, 500);
      
    } catch (error) {
      console.error('Sign in error:', error);
      showNotification('Authentication failed. Please try again.', 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Simulate logout delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      localStorage.removeItem('dealsense_user');
      setUser(null);
      
      showNotification('Successfully signed out', 'success', 2000);
      
      // Redirect to home
      router.push('/');
      
    } catch (error) {
      console.error('Sign out error:', error);
      showNotification('Error signing out', 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updates };
    localStorage.setItem('dealsense_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    
    showNotification('Profile updated successfully', 'success');
  };

  const value = {
    user,
    isLoading,
    signIn,
    signOut,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};