"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useProject } from '@/contexts/ProjectContext';
import { useEffect } from 'react';
import ProcessingScreen from '@/components/processing/ProcessingScreen';

export default function ProcessingProjectPageClient({ projectId }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { refreshProjects, setActiveProject } = useProject();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "var(--text)" }}>Loading...</div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const handleProcessingDone = async () => {
    // 🔒 PHASE 4: Refresh project list and auto-select the newly created project
    try {
      const updatedProjects = await refreshProjects();
      if (projectId && updatedProjects?.length > 0) {
        const newProject = updatedProjects.find(p => p._id === projectId);
        if (newProject) {
          setActiveProject(newProject);
        }
      }
    } catch (error) {
      console.error('Failed to refresh projects after processing:', error);
    }
    router.push('/app/dashboard');
  };

  return <ProcessingScreen projectId={projectId} onDone={handleProcessingDone} />;
}
