import { useCallback } from 'react';
import apiService from '@/lib/apiService';
import { useProject } from '@/contexts/ProjectContext';
import { useKeywords, useKeywordIntelligence } from './useDashboardQueries';

export function useKeywordData() {
  const { activeProjectId } = useProject();

  // Use React Query for cached data fetching
  const { data: intelligenceData, isLoading: intelligenceLoading, error: intelligenceError } = useKeywordIntelligence(activeProjectId)
  const { data: keywordsData, isLoading: keywordsLoading, error: keywordsError } = useKeywords(activeProjectId, { limit: 50 })

  // Extract data from query results
  const intelligence = intelligenceData?.data
  const keywords = keywordsData?.data?.keywords || []
  const pagination = keywordsData?.data?.pagination || null

  const loading = {
    intelligence: intelligenceLoading,
    keywords: keywordsLoading,
    detail: false
  }
  const error = intelligenceError || keywordsError

  // Fetch keyword detail (not cached - user action)
  const fetchKeywordDetail = useCallback(async (keyword) => {
    if (!activeProjectId || !keyword) return null;

    try {
      const response = await apiService.getKeywordDetail(activeProjectId, keyword);
      return response.data;
    } catch (err) {
      console.error('Failed to fetch keyword detail:', err);
      return null;
    }
  }, [activeProjectId]);

  // Start keyword research (not cached - user action)
  const startResearch = useCallback(async (keyword, depth = 2) => {
    if (!activeProjectId) return;

    try {
      const response = await apiService.startKeywordResearch(activeProjectId, keyword, depth);
      return response.data;
    } catch (err) {
      console.error('Failed to start keyword research:', err);
      throw err;
    }
  }, [activeProjectId]);

  // Fetch keywords with options (for filter/sort changes)
  const fetchKeywords = useCallback(async (options = {}) => {
    // This is handled by React Query - just return the cached data
    return keywords
  }, [keywords]);

  return {
    intelligence,
    keywords,
    pagination,
    loading,
    error,
    fetchIntelligence: () => intelligence,
    fetchKeywords,
    fetchKeywordDetail,
    startResearch
  };
}
