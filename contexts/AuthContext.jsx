"use client";



import { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { SessionProvider, useSession, signOut } from 'next-auth/react';

import apiService from '@/lib/apiService';

import { queryClient } from '@/lib/queryClient';

import socketService from '@/lib/socketService';



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

            if (response.data.hasProjects !== undefined) {

              setHasProjects(response.data.hasProjects);

            }

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



  // Application-level Socket.IO lifecycle — the single place this connects,
  // for every authenticated route (this provider wraps the whole app at the
  // root layout). Reacts to `user` rather than being called from individual
  // pages/features (BulkVerificationController, useUrlVerification, etc. only
  // ever join rooms / register listeners — they never call connect()).
  // socketService.connect() already no-ops if a live socket exists (see its
  // own `this.socket && this.connected` check), so a spurious re-run of this
  // effect (e.g. a fresh `user` object with the same identity from the
  // NextAuth bootstrap effect) can never create a second connection.
  useEffect(() => {

    if (user) {

      socketService.connect(apiService.getToken());

    } else {

      socketService.disconnect();

    }

  }, [user]);



  const login = async (email, password, rememberMe = false) => {

    try {

      const result = await apiService.login(email, password, rememberMe);

      apiService.setToken(result.data.token);

      setUser(result.data.user);

      if (result.data.user.hasProjects !== undefined) {

        setHasProjects(result.data.user.hasProjects);

      }

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

        if (result.data.user.hasProjects !== undefined) {

          setHasProjects(result.data.user.hasProjects);

        }

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

      // 🔒 PHASE 3: Clear React Query cache to prevent cross-user data contamination

      queryClient.clear();

      if (typeof window !== 'undefined') {

        localStorage.removeItem('odito-query-cache');  // Persisted RQ cache

        localStorage.removeItem('odito-active-project');  // Persisted project selection

      }

    }

  };



  // useCallback (keyed only on the actual dependency, `hasProjects`) is
  // required here, not just style: AuthGuard.jsx's project-existence-check
  // effect lists this function in its dependency array. Without a stable
  // identity, ANY re-render of AuthProvider — including one where nothing
  // it owns actually changed, e.g. the App Router simply handing it fresh
  // `children` during a client-side navigation such as the router.replace()
  // useMetaOAuthRedirect performs right after opening the Facebook Page
  // selector — hands AuthGuard's effect a "new" function and makes it
  // re-run. That effect synchronously flips `isCheckingProjects` true,
  // which makes AuthGuard render its "Loading your space..." screen
  // INSTEAD OF children — unmounting the entire protected page (and any
  // dialog open in it, resetting its local state) for the ~1 render cycle
  // that check takes, even though the check itself was already known
  // (hasProjects === true) and genuinely needed no re-verification.
  const checkProjectExistence = useCallback(async () => {

    // If hasProjects is true, we don't need to re-query

    if (hasProjects === true) {

      return true;

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

  }, [hasProjects]);



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

    setHasProjects, // Add setHasProjects to the value object

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

  const { setUser, setHasProjects } = value;



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

      if (session.backendUser.hasProjects !== undefined) {

        setHasProjects(session.backendUser.hasProjects);

      }

      

      // Clear NextAuth session after successful bootstrap

      signOut({ redirect: false });

    }

  }, [session, setUser, setHasProjects]);



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

