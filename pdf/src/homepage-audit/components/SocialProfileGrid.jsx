import React from 'react';
import SocialProfileCard from './SocialProfileCard';

// 2-column grid — supports any number of profiles; an odd count simply
// leaves the last row's second cell empty (matches the design's Instagram
// card sitting alone in row 3, unstretched).
export default function SocialProfileGrid({ profiles }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 20,
        breakInside: 'avoid',
        pageBreakInside: 'avoid',
      }}
    >
      {(profiles || []).map((p) => (
        <SocialProfileCard
          key={p.platformKey}
          platformKey={p.platformKey}
          displayName={p.displayName}
          connected={p.connected}
        />
      ))}
    </div>
  );
}
