const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

// Fail loudly, at load time, if this isn't a real absolute URL — every
// consumer (apiService.js's REST calls, and socketService.js, which
// derives its Socket.IO origin from this same value) trusts it enough to
// build requests/connections without re-validating it themselves. A bare
// value like "https" (missing "://host") would otherwise pass through
// silently and only surface deep inside socket.io-client as a garbled
// "wss://https/socket.io/..." connection attempt — this turns that into
// an immediate, actionable startup error naming the exact bad value
// instead of a confusing runtime symptom three layers away.
try {
  // eslint-disable-next-line no-new
  new URL(API_BASE_URL);
} catch {
  throw new Error(
    `NEXT_PUBLIC_API_URL is not a valid absolute URL: "${API_BASE_URL}". ` +
    'It must be a full origin, e.g. "https://oditoai.com/api" (or "http://localhost:5000/api" locally) — ' +
    'not a bare protocol, hostname, or path.'
  );
}

export default API_BASE_URL;
