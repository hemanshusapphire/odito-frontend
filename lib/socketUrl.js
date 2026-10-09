// Single resolver for the Socket.IO server origin.
//
// socket.io-client wants a plain http(s) origin (it derives ws:// / wss://
// and the /socket.io/ path itself), so this returns `URL.origin` of the
// backend — never a hand-built ws:// string, and never a string produced by
// editing the REST base URL with .replace().
//
// Why this exists: socketService used `API_BASE_URL.replace('/api', '')`.
// With NEXT_PUBLIC_API_URL="https://api.oditoai.com/api" the FIRST "/api" is
// the one inside "//api.oditoai.com", so the result was "https:/.oditoai.com/api",
// which socket.io-client (no "://") treated as a host-relative string and
// turned into "wss://https/socket.io/" (host literally "https").

const SOCKET_PROTOCOLS = { 'http:': 'http:', 'https:': 'https:', 'ws:': 'http:', 'wss:': 'https:' };
const PROTOCOL_WORDS = new Set(['http', 'https', 'ws', 'wss']);

function toOrigin(value, source) {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(
      `${source} is not a valid absolute URL: "${value}". ` +
      'Use a full origin such as "https://oditoai.com" or "http://localhost:5000".'
    );
  }

  const protocol = SOCKET_PROTOCOLS[parsed.protocol];
  if (!protocol) {
    throw new Error(`${source} must use http(s) or ws(s), got "${parsed.protocol}" (${value}).`);
  }

  const host = parsed.hostname.toLowerCase();
  // "https", "wss", ... as a hostname is the signature of a mangled URL.
  if (!host || PROTOCOL_WORDS.has(host)) {
    throw new Error(`${source} has an invalid host "${parsed.hostname}" (${value}).`);
  }

  // Normalise ws(s) -> http(s) so socket.io-client negotiates the transport.
  return `${protocol}//${parsed.host}`;
}

/**
 * @param {{ socketUrl?: string, apiUrl?: string }} config
 *   socketUrl - optional NEXT_PUBLIC_SOCKET_URL, only needed when Socket.IO is
 *               served from a different origin than the REST API.
 *   apiUrl    - NEXT_PUBLIC_API_URL (e.g. "https://oditoai.com/api").
 * @returns {string} http(s) origin with no path, e.g. "https://api.oditoai.com"
 * @throws {Error} naming the offending variable when the configuration is invalid
 */
export function resolveSocketOrigin({ socketUrl, apiUrl } = {}) {
  const explicit = typeof socketUrl === 'string' ? socketUrl.trim() : '';
  if (explicit) return toOrigin(explicit, 'NEXT_PUBLIC_SOCKET_URL');

  const api = typeof apiUrl === 'string' ? apiUrl.trim() : '';
  if (!api) {
    throw new Error('Cannot resolve Socket.IO origin: set NEXT_PUBLIC_API_URL (or NEXT_PUBLIC_SOCKET_URL).');
  }
  return toOrigin(api, 'NEXT_PUBLIC_API_URL');
}
