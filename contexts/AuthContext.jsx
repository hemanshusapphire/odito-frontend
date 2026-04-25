"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { SessionProvider, useSession, signOut } from 'next-auth/react';
import apiService from '@/lib/apiService';
import { clearPaymentIntent } from '@/utils/paymentUtils';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasProjects, setHasProjects] = useState(null); // null = not checked yet

  useEffect(() => {
    // Check if user is authenticated on app load
    const checkAuth = async () => {
      try {
        if (apiService.isAuthenticated()) {
          const response = await apiService.getProfile();
          
          if (response.success && response.data) {
            setUser(response.data);
          } else {
            throw new Error('Invalid profile response');
          }
        }
      } catch (error) {
        // Token might be expired or invalid - clean up
        apiService.removeToken();
        setUser(null);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password, rememberMe = false) => {
    try {
      const result = await apiService.login(email, password, rememberMe);
      apiService.setToken(result.data.token);
      setUser(result.data.user);
      return { success: true, user: result.data.user };
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const result = await apiService.register(userData);
      
      // DO NOT auto-login unverified users
      // Only set token and user if email is verified
      if (result.data.token && result.data.user.isEmailVerified) {
        apiService.setToken(result.data.token);
        setUser(result.data.user);
      }
      
      return { success: true, user: result.data.user };
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      // Silent error handling
    } finally {
      apiService.removeToken();
      setUser(null);
      setHasProjects(null); // Clear project cache on logout
      // Clear payment intent on logout
      clearPaymentIntent();
    }
  };

  const checkProjectExistence = async () => {
    // If we already know the result, return it
    if (hasProjects !== null) {
      return hasProjects;
    }

    try {
      const response = await apiService.getProjects(1, 1);
      const projects = response?.data?.projects || [];
      const projectExists = projects.length > 0;
      
      setHasProjects(projectExists);
      
      return projectExists;
    } catch (error) {
      setHasProjects(false);
      return false;
    }
  };

  const clearProjectCache = () => {
    setHasProjects(null);
    localStorage.removeItem('user_projects_cache');
  };

  const value = {
    user,
    isLoading,
    isInitialized,
    isAuthenticated: !!user,
    hasProjects,
    checkProjectExistence,
    clearProjectCache,
    login,
    register,
    logout,
    setUser, // Add setUser to the value object
    loginWithGoogle: async () => {
      // This will be handled by the NextAuth signIn flow
      // The actual Google login will be triggered from the UI components
      return { success: true };
    }
  };

  return (
    <SessionProvider>
      <AuthContextInner value={value}>
        {children}
      </AuthContextInner>
    </SessionProvider>
  );
}

// Inner component to handle NextAuth session
function AuthContextInner({ value, children }) {
  const { data: session } = useSession();
  const { setUser } = value;

  // Handle NextAuth session changes (Google login)
  useEffect(() => {
    if (session && session?.backendToken && session?.backendUser) {
      // Store backend JWT in localStorage
      apiService.setToken(session.backendToken);
      
      // Update user state with backend user data (including isNewUser flag)
      const updatedUser = { ...session.backendUser };
      if (session.isNewUser !== undefined) {
        updatedUser.isNewUser = session.isNewUser;
      }
      setUser(updatedUser);
      
      // Clear NextAuth session after successful bootstrap
      signOut({ redirect: false });
    }
  }, [session, setUser]);

  return (
    <AuthContext.Provider value={value}>
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
