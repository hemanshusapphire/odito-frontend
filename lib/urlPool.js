// Maps the GET /projects/:id/url-pool response onto URL Selection page state.
//
// Counts come from the backend's own totals. `qualification_summary` is the
// URL_QUALIFICATION job's self-report; it is only used to flag an
// inconsistency (job says URLs were discovered, pool says none) so the page
// never presents that as a legitimate "0 of 0".
export function mapUrlPoolResponse(data) {
  const urls = Array.isArray(data?.urls) ? data.urls : [];
  const totalDiscovered = data?.total_discovered || 0;
  const totalQualified = data?.total_qualified || 0;
  const reportedDiscovered = data?.qualification_summary?.discovered ?? null;

  return {
    urls,
    totalDiscovered,
    totalQualified,
    selectionLimit: data?.selection_limit ?? null,
    // Pool is empty but the job reported discovered URLs.
    poolInconsistent: totalDiscovered === 0 && reportedDiscovered != null && reportedDiscovered > 0,
    isEmpty: totalDiscovered === 0 && !(reportedDiscovered > 0),
  };
}
