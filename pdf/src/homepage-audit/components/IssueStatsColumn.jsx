import React from 'react';
import IssueStatCard from './IssueStatCard';

export default function IssueStatsColumn({ total, critical, warnings, passed }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <IssueStatCard value={total} label="Total Issues" variant="neutral" />
      <IssueStatCard value={critical} label="Critical" variant="critical" />
      <IssueStatCard value={warnings} label="Warnings" variant="warning" />
      <IssueStatCard value={passed} label="Passed" variant="passed" />
    </div>
  );
}
