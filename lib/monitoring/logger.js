/**
 * Structured logger — replaces scattered `console.log` calls with leveled,
 * structured output that can be filtered in dev and routed to a sink in prod.
 *
 * Usage:
 *   import { logger } from '@/lib/monitoring/logger'
 *   logger.info('socket connected', { url })
 *   logger.error('audit failed', { jobId }, err)
 *
 * In production the minimum level is `info` (debug is dropped). Set
 * NEXT_PUBLIC_LOG_LEVEL to override (debug | info | warn | error).
 */

const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 }

const isProd = process.env.NODE_ENV === 'production'

function resolveMinLevel() {
  const fromEnv = process.env.NEXT_PUBLIC_LOG_LEVEL
  if (fromEnv && fromEnv in LOG_LEVELS) return LOG_LEVELS[fromEnv]
  return isProd ? LOG_LEVELS.info : LOG_LEVELS.debug
}

const MIN_LEVEL = resolveMinLevel()

// Optional external sink (e.g. Sentry/PostHog). Wire up via setLogSink().
let sink = null

/**
 * Register an external log sink. Receives ({ level, message, data, timestamp }).
 * @param {(entry: object) => void} fn
 */
export function setLogSink(fn) {
  sink = typeof fn === 'function' ? fn : null
}

function log(level, message, data) {
  if (LOG_LEVELS[level] < MIN_LEVEL) return

  const entry = {
    level,
    message,
    data: data ?? undefined,
    timestamp: new Date().toISOString(),
  }

  // Console output (structured object, not string concat).
  const consoleFn =
    level === 'error' ? console.error : level === 'warn' ? console.warn : console.log
  if (data !== undefined) {
    consoleFn(`[${level}] ${message}`, data)
  } else {
    consoleFn(`[${level}] ${message}`)
  }

  // Forward to external sink, never let it throw into the caller.
  if (sink) {
    try {
      sink(entry)
    } catch {
      /* swallow sink failures */
    }
  }
}

export const logger = {
  debug: (message, data) => log('debug', message, data),
  info: (message, data) => log('info', message, data),
  warn: (message, data) => log('warn', message, data),
  error: (message, data, error) =>
    log('error', message, {
      ...(data || {}),
      ...(error
        ? { error: error.message, stack: error.stack }
        : {}),
    }),
}

export default logger
