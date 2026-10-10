import { describe, it, expect } from 'vitest';
import { mapUrlPoolResponse } from './urlPool';

const poolUrls = (n, qualifiedCount) =>
  Array.from({ length: n }, (_, i) => ({
    url: `https://krishnaeyecentre.com/p-${i}`,
    page_type: 'other',
    qualified: i < qualifiedCount,
  }));

describe('mapUrlPoolResponse', () => {
  it('maps the supplied job: 162 discovered, 161 qualified, canonical 50 does not cap the pool', () => {
    const mapped = mapUrlPoolResponse({
      total_discovered: 162,
      total_qualified: 161,
      urls: poolUrls(162, 161),
      selection_limit: null,
      qualification_summary: { discovered: 162, qualified: 161, canonical_count: 50 },
    });
    expect(mapped.totalDiscovered).toBe(162);
    expect(mapped.totalQualified).toBe(161);
    expect(mapped.urls).toHaveLength(162);
    expect(mapped.urls.filter((u) => u.qualified)).toHaveLength(161);
    expect(mapped.selectionLimit).toBeNull();
    expect(mapped.poolInconsistent).toBe(false);
    expect(mapped.isEmpty).toBe(false);
  });

  it('flags an empty pool when the job reported discovered URLs (must not render as 0 of 0)', () => {
    const mapped = mapUrlPoolResponse({
      total_discovered: 0,
      total_qualified: 0,
      urls: [],
      qualification_summary: { discovered: 162 },
    });
    expect(mapped.poolInconsistent).toBe(true);
    expect(mapped.isEmpty).toBe(false);
  });

  it('treats a genuinely empty run as empty, not inconsistent', () => {
    const mapped = mapUrlPoolResponse({
      total_discovered: 0,
      total_qualified: 0,
      urls: [],
      qualification_summary: { discovered: 0 },
    });
    expect(mapped.poolInconsistent).toBe(false);
    expect(mapped.isEmpty).toBe(true);
  });

  it('keeps an explicit per-project selection limit and tolerates missing fields', () => {
    expect(mapUrlPoolResponse({ total_discovered: 5, total_qualified: 5, urls: poolUrls(5, 5), selection_limit: 3 }).selectionLimit).toBe(3);
    const mapped = mapUrlPoolResponse(undefined);
    expect(mapped).toMatchObject({ urls: [], totalDiscovered: 0, totalQualified: 0, selectionLimit: null, poolInconsistent: false, isEmpty: true });
  });
});
