"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import apiService from "@/lib/apiService";
import { useAuth } from "@/contexts/AuthContext";
import { queryClient } from "@/lib/queryClient";
import socketService from "@/lib/socketService";
import { useProjects } from "@/hooks/useDashboardQueries";

const ProjectContext = createContext();

export function ProjectProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [activeProject, setActiveProjectState] = useState(null);
  const [isSwitchingProject, setIsSwitchingProject] = useState(false);

  // Fetch projects list using the centralized TanStack Query hook
  const { data: projectsResponse, isLoading: isQueryLoading, refetch } = useProjects(1, 50, isAuthenticated);

  const projects = useMemo(() => {
    if (projectsResponse?.success && projectsResponse?.data?.projects) {
      return projectsResponse.data.projects;
    }
    if (Array.isArray(projectsResponse?.data)) {
      return projectsResponse.data;
    }
    if (Array.isArray(projectsResponse)) {
      return projectsResponse;
    }
    return [];
  }, [projectsResponse]);

  const isLoading = isAuthenticated ? isQueryLoading : false;

  useEffect(() => {
    if (!isAuthenticated || projects.length === 0) return;

    // 🔒 PHASE 3: Restore activeProject from localStorage (if valid)
    const savedProjectId = typeof window !== 'undefined'
      ? localStorage.getItem('odito-active-project')
      : null;
    
    if (savedProjectId) {
      const savedProject = projects.find(p => p._id === savedProjectId);
      if (savedProject) {
        setActiveProjectState(savedProject);
      } else {
        // Saved project no longer exists (deleted), fall back to first
        setActiveProjectState(projects[0]);
        if (typeof window !== 'undefined') {
          localStorage.setItem('odito-active-project', projects[0]._id);
        }
      }
    } else if (!activeProject) {
      // No saved project, auto-select first
      setActiveProjectState(projects[0]);
      if (typeof window !== 'undefined') {
        localStorage.setItem('odito-active-project', projects[0]._id);
      }
    } else {
      // Verify active project still exists in the list
      const stillExists = projects.some(p => p._id === activeProject._id);
      if (!stillExists) {
        // Active project was deleted, select first available
        setActiveProjectState(projects[0]);
        if (typeof window !== 'undefined') {
          localStorage.setItem('odito-active-project', projects[0]._id);
        }
      }
    }
  }, [projects, isAuthenticated]);

  // 🔒 PHASE 3+4: Wrapped setter — socket cleanup + persist + invalidate cache
  const setActiveProject = useCallback((project) => {
    // Skip if same project
    if (project?._id === activeProject?._id) return;

    // 🔒 PHASE 4: Show switching overlay
    setIsSwitchingProject(true);

    // 🔒 PHASE 4: Leave all socket rooms from previous project
    socketService.leaveAllRooms();

    setActiveProjectState(project);
    if (project?._id && typeof window !== 'undefined') {
      localStorage.setItem('odito-active-project', project._id);
    }
    // Invalidate all queries to force fresh data for the new project
    queryClient.invalidateQueries();

    // Clear switching state after a brief delay
    setTimeout(() => setIsSwitchingProject(false), 800);
  }, [activeProject]);

  // 🔒 PHASE 4: Expose refreshProjects for use after project creation
  const refreshProjects = useCallback(async () => {
    try {
      const result = await refetch();
      const apiResponse = result.data;
      const list = apiResponse?.data?.projects || apiResponse?.data || (Array.isArray(apiResponse) ? apiResponse : []);
      return list;
    } catch (error) {
      console.error("Failed to refresh projects:", error);
      return projects;
    }
  }, [refetch, projects]);

  const value = {
    activeProject,
    activeProjectId: activeProject?._id || null,
    setActiveProject,
    projects,
    isLoading,
    isSwitchingProject,
    refreshProjects,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}
