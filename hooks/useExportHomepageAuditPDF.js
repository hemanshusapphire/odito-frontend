import { useState, useCallback, useRef } from 'react';
import apiService from '../lib/apiService';

/**
 * Hook for exporting the Homepage Audit PDF report using the backend
 * Puppeteer-based PDF generation pipeline.
 *
 * @returns {object} - { exportPDF, cancelExport, clearError, loading, error, progress }
 */
export function useExportHomepageAuditPDF() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const abortControllerRef = useRef(null);
  const isExportingRef = useRef(false);

  const exportPDF = useCallback(async (auditId) => {
    if (isExportingRef.current) {
      console.warn('[HOMEPAGE_PDF_EXPORT] Export already in progress, ignoring duplicate request');
      return;
    }

    if (!auditId) {
      const err = new Error('Missing auditId');
      setError(err.message);
      throw err;
    }

    isExportingRef.current = true;
    setLoading(true);
    setError(null);
    setProgress(0);
    abortControllerRef.current = new AbortController();

    try {
      console.log('[HOMEPAGE_PDF_EXPORT] Triggering backend PDF generation for audit:', auditId);

      // Trigger the backend Puppeteer process (synchronous download)
      const blob = await apiService.generateHomepageAuditPdf(auditId);

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `homepage-audit-${auditId}-${timestamp}.pdf`;
      link.download = filename;

      document.body.appendChild(link);
      link.click();
      if (link && link.parentNode) {
        document.body.removeChild(link);
      }

      URL.revokeObjectURL(url);

      console.log('[HOMEPAGE_PDF_EXPORT] PDF export completed successfully');

      return { success: true, filename };
    } catch (err) {
      console.error('[HOMEPAGE_PDF_EXPORT] PDF export failed:', err.message);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
      setProgress(0);
      isExportingRef.current = false;
      abortControllerRef.current = null;
    }
  }, []);

  const cancelExport = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    isExportingRef.current = false;
    setLoading(false);
    setProgress(0);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { exportPDF, cancelExport, clearError, loading, error, progress };
}

export default useExportHomepageAuditPDF;
