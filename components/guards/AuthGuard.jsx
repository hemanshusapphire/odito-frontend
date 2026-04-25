"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function AuthGuard({ children }) {
  const { isAuthenticated, isLoading, isInitialized, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect after auth check is complete
    if (isInitialized && !isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // Check email verification for authenticated users
    if (isInitialized && !isLoading && isAuthenticated && user && !user.isEmailVerified) {
      router.push('/verify-email');
      return;
    }
  }, [isLoading, isAuthenticated, isInitialized, user, router]);

  // Show loading spinner during auth check
  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground text-sm">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render anything while redirecting
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground text-sm">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if user is not verified (redirecting to verify-email)
  if (user && !user.isEmailVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground text-sm">Redirecting to email verification...</p>
        </div>
      </div>
    );
  }

  // User is authenticated and verified, render protected content
  return children;
}

// For public routes that should redirect to dashboard/onboarding if user is already logged in
export function PublicGuard({ children }) {
  const { isAuthenticated, isLoading, isInitialized, user, checkProjectExistence } = useAuth();
  const router = useRouter();
  const [isCheckingProjects, setIsCheckingProjects] = useState(false);

  useEffect(() => {
    const handleRedirect = async () => {
      // Only redirect if user is authenticated, email is verified, and auth check is complete
      if (isInitialized && !isLoading && isAuthenticated && user?.isEmailVerified) {
        // Prevent multiple redirects
        if (isCheckingProjects) return;
        setIsCheckingProjects(true);

        try {
          const hasProjects = await checkProjectExistence();
          
          if (hasProjects) {
            router.push('/dashboard');
          } else {
            router.push('/onboarding');
          }
        } catch (error) {
          // On error, default to onboarding for safety
          router.push('/onboarding');
        }
      }
    };

    handleRedirect();
  }, [isLoading, isAuthenticated, isInitialized, user, router, checkProjectExistence, isCheckingProjects]);

  // For public routes, render content immediately - don't wait for auth check
  // This prevents blocking on login/signup pages
  if (!isAuthenticated || isLoading) {
    return children;
  }

  // If user is authenticated but not verified, show loading while redirecting to verify-email
  if (isAuthenticated && user && !user.isEmailVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground text-sm">Redirecting to email verification...</p>
        </div>
      </div>
    );
  }

  // Don't render anything while redirecting to dashboard
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-muted-foreground text-sm">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}
