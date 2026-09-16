/**
 * Renders one JSON-LD <script> block from a plain data object. Server
 * Component only (no "use client", no useEffect, no document.* access) —
 * the tag must exist in the initial server-rendered HTML for crawlers that
 * only fetch and parse HTML (never execute JavaScript) to see it.
 *
 * Serialization is escaped defensively (</script>, <, >, &) even though the
 * current callers only ever pass static, developer-authored data — this is
 * the standard safe pattern for JSON-LD in React (see Next.js's own
 * script-injection guidance) and costs nothing to apply unconditionally, so
 * it stays correct if a future caller ever includes request-derived data.
 */
function safeJsonLdString(data) {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

export default function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: safeJsonLdString(data) }}
    />
  );
}
