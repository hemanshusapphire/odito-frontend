"use client"

import { useQuery } from '@tanstack/react-query'
import apiService from '@/lib/apiService'

// ==================== OVERVIEW QUERIES ====================

export function useProjectOverview(projectId) {
  return useQuery({
    queryKey: ['overview', projectId],
    queryFn: () => apiService.getProjectOverview(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useIssueCounts(projectId) {
  return useQuery({
    queryKey: ['issue-counts', projectId],
    queryFn: () => apiService.getIssueCounts(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// ==================== TECHNICAL CHECKS QUERIES ====================

export function useTechnicalChecks(projectId) {
  return useQuery({
    queryKey: ['technical', projectId],
    queryFn: () => apiService.getTechnicalChecks(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useTechnicalCheckDetail(projectId, checkId) {
  return useQuery({
    queryKey: ['technical', projectId, checkId],
    queryFn: () => apiService.getTechnicalCheckDetail(projectId, checkId),
    enabled: !!projectId && !!checkId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// ==================== ON-PAGE ISSUES QUERIES ====================

export function useOnPageIssues(projectId) {
  return useQuery({
    queryKey: ['onpage', projectId],
    queryFn: () => apiService.getOnPageIssues(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useIssueUrls(projectId, issueCode) {
  return useQuery({
    queryKey: ['onpage', projectId, issueCode],
    queryFn: () => apiService.getIssueUrls(projectId, issueCode),
    enabled: !!projectId && !!issueCode,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function usePageIssues(projectId, pageUrl) {
  return useQuery({
    queryKey: ['page-issues', projectId, pageUrl],
    queryFn: () => apiService.getPageIssues(projectId, pageUrl),
    enabled: !!projectId && !!pageUrl,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// ==================== ACCESSIBILITY QUERIES ====================

export function useAccessibilityIssues(projectId) {
  return useQuery({
    queryKey: ['accessibility', projectId],
    queryFn: () => apiService.getAccessibilityIssues({ projectId }),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// ==================== PAGESPEED QUERIES ====================

export function usePageSpeedData(projectId) {
  return useQuery({
    queryKey: ['pagespeed', projectId],
    queryFn: () => apiService.getPageSpeedData(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// ==================== KEYWORDS QUERIES ====================

export function useKeywords(projectId, options = {}) {
  return useQuery({
    queryKey: ['keywords', projectId, options],
    queryFn: () => apiService.getKeywords(projectId, options),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useKeywordIntelligence(projectId) {
  return useQuery({
    queryKey: ['keywords-intelligence', projectId],
    queryFn: () => apiService.getKeywordIntelligence(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// ==================== AI SEARCH AUDIT QUERIES ====================

export function useAISearchAuditProject(projectId) {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: () => apiService.getProjectById(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useAISearchAudit(projectId) {
  return useQuery({
    queryKey: ['ai-audit', projectId],
    queryFn: () => apiService.getAISearchAudit(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useAISearchAuditIssues(projectId) {
  return useQuery({
    queryKey: ['ai-audit-issues', projectId],
    queryFn: () => apiService.getAISearchAuditIssues(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useAISearchAuditIssue(projectId, issueId) {
  return useQuery({
    queryKey: ['ai-audit-issue', projectId, issueId],
    queryFn: () => apiService.getAISearchAuditIssue(projectId, issueId),
    enabled: !!projectId && !!issueId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useAISearchAuditIssuePages(projectId, issueId, options = {}) {
  return useQuery({
    queryKey: ['ai-audit-issue-pages', projectId, issueId, options],
    queryFn: () => apiService.getAISearchAuditIssuePages(projectId, issueId, options),
    enabled: !!projectId && !!issueId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// ==================== AI VIDEO QUERIES ====================

export function useAIVisibilityPages(projectId, params = {}) {
  return useQuery({
    queryKey: ['ai-video', projectId, params],
    queryFn: () => apiService.getAIVisibilityPages(projectId, params),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useAIVisibilityPage(projectId, url) {
  return useQuery({
    queryKey: ['ai-video-page', projectId, url],
    queryFn: () => apiService.getAIVisibilityPage(projectId, url),
    enabled: !!projectId && !!url,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useAIVisibilityWorstPages(projectId, limit = 5) {
  return useQuery({
    queryKey: ['ai-video-worst', projectId, limit],
    queryFn: () => apiService.getAIVisibilityWorstPages(projectId, limit),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useAIVisibilityEntityGraph(projectId) {
  return useQuery({
    queryKey: ['ai-video-graph', projectId],
    queryFn: () => apiService.getAIVisibilityEntityGraph(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
