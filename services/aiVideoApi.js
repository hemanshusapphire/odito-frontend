import apiService from '@/lib/apiService';

/**
 * AI Video Service - Handles video creation, status polling, and downloads.
 * Follows clean architecture principles and integrates with the centralized ApiService.
 */

export const generateVideo = async (projectId) => {
  return apiService.request('/ai-video/video', {
    method: 'POST',
    body: JSON.stringify({ projectId }),
  });
};

export const getJobStatus = async (jobId) => {
  return apiService.request(`/jobs/${jobId}/status`);
};

export const getGeneratedVideo = async (projectId) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const response = await fetch(`${apiService.baseURL}/video/ai-generated/${projectId}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  // Expected empty state — project has never generated a video. Not an error.
  if (response.status === 404) {
    return { success: true, video: null };
  }

  // Unexpected failure — surface to caller for proper error handling.
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || `Server error: ${response.status}`);
  }

  return response.json();
};

export const downloadVideo = async (videoFileName) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const response = await fetch(`${apiService.baseURL}/video/ai-generated/download/${videoFileName}`, {
    method: 'GET',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to download video file');
  }
  
  return response.blob();
};

