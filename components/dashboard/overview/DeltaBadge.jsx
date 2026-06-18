"use client";

import { memo } from "react";

/**
 * DeltaBadge — reusable metric-change indicator for audit comparisons.
 *
 * Auto-format usage (pass a delta object from the comparison API):
 *   <DeltaBadge delta={d.websiteScore} suffix="pts" />
 *   <DeltaBadge delta={d.totalIssues} suffix="fewer" isLowerBetter />
 *
 * Manual usage (supply direction + children):
 *   <DeltaBadge direction="improved">↑ +14 pts</DeltaBadge>
 */
function DeltaBadge({ direction, delta, suffix = '', isLowerBetter = false, className = '', children }) {
  if (delta) {
    const { direction: dir, change } = delta;

    if (dir === 'unchanged' || change == null) {
      return <span className={`delta-badge unchanged ${className}`}>— No change</span>;
    }

    const abs = Math.abs(Math.round(change));
    const arrowImproved = isLowerBetter ? '↓' : '↑';
    const arrowDeclined = isLowerBetter ? '↑' : '↓';
    const arrow = dir === 'improved' ? arrowImproved : arrowDeclined;
    const label = suffix ? `${arrow} ${abs} ${suffix}` : `${arrow} ${abs}`;

    return <span className={`delta-badge ${dir} ${className}`}>{label}</span>;
  }

  const dir = direction ?? 'unchanged';
  if (dir === 'unchanged' || !children) {
    return <span className={`delta-badge unchanged ${className}`}>— No change</span>;
  }
  return <span className={`delta-badge ${dir} ${className}`}>{children}</span>;
}

export default memo(DeltaBadge);
