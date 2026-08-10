"use client";

import ButtonGroup from './ButtonGroup';

/**
 * Structured keyword recommendation card — replaces the old approach of
 * dumping a numbered markdown list into the chat bubble's text. Real list
 * items get real spacing/wrapping instead of relying on white-space:
 * pre-line and manual "1. **keyword**" string formatting.
 */
export default function KeywordRecommendationCard({ keywords, onConfirm, onEnterOwn }) {
  return (
    <div className="keyword-card">
      <div className="keyword-card-header">
        <span>🔍</span>
        <span>Recommended Keywords</span>
      </div>

      <div className="keyword-card-list">
        {keywords.map((keyword, i) => (
          <div className="keyword-card-item" key={keyword}>
            <span className="keyword-card-number">{i + 1}</span>
            <span className="keyword-card-text">{keyword}</span>
          </div>
        ))}
      </div>

      <p className="keyword-card-prompt">Do you want to go with these?</p>

      <ButtonGroup
        buttons={[
          { key: 'confirm', label: 'Yes, use these', icon: '✅', variant: 'success', onClick: onConfirm },
          { key: 'own', label: 'Enter my own', icon: '✏️', variant: 'secondary', onClick: onEnterOwn },
        ]}
      />
    </div>
  );
}
