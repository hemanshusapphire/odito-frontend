'use client'

/**
 * Core Web Vitals reporting.
 *
 * Uses Next's built-in `useReportWebVitals` (no extra `web-vitals` dependency).
 * It emits the same metrics — CLS, INP, LCP, FCP, TTFB — plus Next-specific
 * timings. Each metric is routed through the structured logger, and forwarded
 * to an optional external reporter so a Sentry/PostHog/analytics sink can be
 * attached without touching this component.
 *
 * Mounted once in the root layout. Renders nothing.
 */

import { useReportWebVitals } from 'next/web-vitals'
import { logger } from '@/lib/monitoring/logger'

// Core Web Vitals thresholds (good / needs-improvement boundary, ms unless noted).
const THRESHOLDS = {
  LCP: 2500,
  INP: 200,
  CLS: 0.1,
  FCP: 1800,
  TTFB: 800,
}

// Optional external reporter (e.g. analytics beacon). Wire via setVitalsReporter().
let reporter = null

/** Register an external Web Vitals reporter. Receives the raw metric object. */
export function setVitalsReporter(fn) {
  reporter = typeof fn === 'function' ? fn : null
}

export function WebVitals() {
  useReportWebVitals((metric) => {
    const threshold = THRESHOLDS[metric.name]
    const overThreshold = threshold !== undefined && metric.value > threshold

    const payload = {
      id: metric.id,
      name: metric.name,
      value: Math.round(metric.value * 100) / 100,
      rating: metric.rating,
    }

    if (overThreshold) {
      logger.warn('web-vital over threshold', { ...payload, threshold })
    } else {
      logger.debug('web-vital', payload)
    }

    if (reporter) {
      try {
        reporter(metric)
      } catch {
        /* never let the reporter break rendering */
      }
    }
  })

  return null
}

export default WebVitals
