import React, { useState } from 'react';

function UserAddedKeywords({ data, loading, error, onRefresh }) {
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (index) => {
    setExpandedRows(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const getUrlLabel = (url) => {
    try {
      const path = new URL(url).pathname.replace(/\/$/, '');
      if (!path) return 'Homepage';
      // Convert "/software-development-company-in-nashik" → "Software Development Company In Nashik"
      return path.split('/').filter(Boolean).pop()
        .replace(/-/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
    } catch {
      return url;
    }
  };
  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Helper function to get rank badge style
  const getRankBadgeStyle = (rank) => {
    if (rank >= 1 && rank <= 10) {
      return { background: 'var(--color-status-success-surface)', color: 'var(--gr)', border: '1px solid var(--color-status-success-border)' }; // green
    } else if (rank >= 11 && rank <= 20) {
      return { background: 'var(--color-status-warning-surface)', color: 'var(--am)', border: '1px solid var(--color-status-warning-border)' }; // yellow
    } else {
      return { background: 'var(--color-status-error-surface)', color: 'var(--re)', border: '1px solid var(--color-status-error-border)' }; // red
    }
  };

  // Helper function to get status from rank
  const getStatusFromRank = (rank) => {
    if (rank >= 1 && rank <= 10) {
      return { text: 'Page 1', style: { background: 'var(--color-status-success-surface)', color: 'var(--gr)', border: '1px solid var(--color-status-success-border)' } };
    } else if (rank >= 11 && rank <= 20) {
      return { text: 'Page 2', style: { background: 'var(--color-status-warning-surface)', color: 'var(--am)', border: '1px solid var(--color-status-warning-border)' } };
    } else {
      return { text: 'Page 3+', style: { background: 'var(--color-status-error-surface)', color: 'var(--re)', border: '1px solid var(--color-status-error-border)' } };
    }
  };

  // Helper function to extract domain from URL
  const getDomainFromUrl = (url) => {
    if (!url) return '';
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={{
        padding: '60px 0',
        textAlign: 'center',
        color: 'var(--text3)',
        fontSize: '13px'
      }}>
        Loading tracked keywords...
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{
        padding: '60px 0',
        textAlign: 'center',
        color: 'var(--red)',
        fontSize: '13px'
      }}>
        <div style={{ marginBottom: '10px' }}>⚠️ Error loading keywords</div>
        <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '20px' }}>{error}</div>
        <button
          onClick={onRefresh}
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            padding: '6px 12px',
            color: 'var(--text)',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  // No data state
  if (!data || !data.keywords || !Array.isArray(data.keywords) || data.keywords.length === 0) {
    return (
      <div style={{
        padding: '60px 0',
        textAlign: 'center',
        color: 'var(--text3)',
        fontSize: '13px'
      }}>
        No tracked keywords yet
      </div>
    );
  }

  const { domain, location, keywords, created_at } = data;

  return (
    <div>
      {/* Domain info card */}
      <div style={{
        background: 'var(--bg2)',
        border: '0.5px solid var(--border)',
        borderRadius: '10px',
        padding: '14px 16px',
        marginBottom: '16px',
        display: 'flex',
        gap: '24px',
        alignItems: 'flex-start'
      }}>
        <div>
          <div style={{
            fontSize: '10px',
            color: 'var(--text3)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '4px'
          }}>
            Domain
          </div>
          <div style={{
            color: 'var(--cyan)',
            fontSize: '13px'
          }}>
            {domain}
          </div>
        </div>
        <div>
          <div style={{
            fontSize: '10px',
            color: 'var(--text3)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '4px'
          }}>
            Location
          </div>
          <div style={{
            color: 'var(--text2)',
            fontSize: '12px',
            maxWidth: '380px',
            lineHeight: '1.5'
          }}>
            {location}
          </div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{
            fontSize: '10px',
            color: 'var(--text3)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '4px'
          }}>
            Added
          </div>
          <div style={{
            color: 'var(--text2)',
            fontSize: '12px'
          }}>
            {formatDate(created_at)}
          </div>
        </div>
      </div>

      {/* Keywords table */}
      <div style={{
        background: 'var(--bg2)',
        border: '0.5px solid var(--border)',
        borderRadius: '10px',
        overflow: 'hidden'
      }}>
        {/* Section header */}
        <div style={{
          padding: '14px 16px 10px',
          borderBottom: '0.5px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{
            fontSize: '11px',
            color: 'var(--text3)',
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase'
          }}>
            Tracked Keywords
          </div>
          <div style={{
            background: 'var(--bg)',
            color: 'var(--cyan)',
            fontSize: '11px',
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: '20px'
          }}>
            {keywords.length} keywords
          </div>
        </div>

        {/* Table header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '40px 1fr 100px 90px 32px',
          padding: '8px 16px',
          borderBottom: '0.5px solid var(--border)',
          fontSize: '10px',
          color: 'var(--text3)',
          fontWeight: 600,
          letterSpacing: '0.05em',
          textTransform: 'uppercase'
        }}>
          <div>#</div>
          <div>Keyword</div>
          <div>Best Rank</div>
          <div>Status</div>
          <div></div>
        </div>

        {/* Table rows */}
        {keywords.map((keyword, index) => {
          const effectiveRank = keyword.best_rank ?? keyword.rank;
          const rankBadgeStyle = getRankBadgeStyle(effectiveRank);
          const status = getStatusFromRank(effectiveRank);
          const rankingUrls = keyword.ranking_urls || [];
          const isExpanded = !!expandedRows[index];
          const hasUrls = rankingUrls.length > 0;

          return (
            <div
              key={keyword._id || index}
              style={{ borderBottom: index < keywords.length - 1 ? '0.5px solid var(--border)' : 'none' }}
            >
              {/* Main row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '40px 1fr 100px 90px 32px',
                padding: '12px 16px',
                alignItems: 'center'
              }}>
                <div style={{ fontSize: '12px', color: 'var(--text3)' }}>
                  {index + 1}
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 500 }}>
                    {keyword.keyword}
                  </div>
                  {hasUrls && (
                    <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>
                      {rankingUrls.length} ranking URL{rankingUrls.length > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
                <div>
                  {effectiveRank != null ? (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '36px',
                      height: '24px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      padding: '0 8px',
                      ...rankBadgeStyle
                    }}>
                      #{effectiveRank}
                    </span>
                  ) : (
                    <span style={{ fontSize: '12px', color: 'var(--text3)' }}>—</span>
                  )}
                </div>
                <div>
                  {effectiveRank != null ? (
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 500,
                      ...status.style,
                      borderRadius: '6px',
                      padding: '4px 10px',
                      display: 'inline-block'
                    }}>
                      {status.text}
                    </span>
                  ) : (
                    <span style={{ fontSize: '12px', color: 'var(--text3)' }}>Not ranked</span>
                  )}
                </div>
                <div>
                  {hasUrls && (
                    <button
                      onClick={() => toggleRow(index)}
                      style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        color: 'var(--text3)',
                        cursor: 'pointer',
                        fontSize: '11px',
                        padding: '3px 7px',
                        lineHeight: 1
                      }}
                    >
                      {isExpanded ? '▲' : '▼'}
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded ranking URLs */}
              {isExpanded && hasUrls && (
                <div style={{
                  padding: '0 16px 12px 56px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  {rankingUrls.map((ru, ri) => (
                    <div key={ri} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '7px 12px',
                      background: 'var(--bg)',
                      border: '0.5px solid var(--border)',
                      borderRadius: '8px'
                    }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '30px',
                        height: '22px',
                        padding: '0 6px',
                        borderRadius: '5px',
                        fontSize: '11px',
                        fontWeight: 700,
                        flexShrink: 0,
                        ...getRankBadgeStyle(ru.rank)
                      }}>
                        #{ru.rank}
                      </span>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        color: ru.type === 'homepage' ? 'var(--cyan)' : 'var(--text3)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        flexShrink: 0,
                        width: '80px'
                      }}>
                        {ru.type === 'homepage' ? 'Homepage' : 'Page'}
                      </span>
                      <a
                        href={ru.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '12px',
                          color: 'var(--text2)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          textDecoration: 'none',
                          flex: 1
                        }}
                        title={ru.url}
                      >
                        {getUrlLabel(ru.url)}
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Footer */}
        <div style={{
          padding: '8px 16px',
          fontSize: '11px',
          color: 'var(--text3)',
          textAlign: 'center',
          borderTop: '0.5px solid var(--border)'
        }}>
          Manual tracking · Last updated {formatDate(created_at)}
        </div>
      </div>
    </div>
  );
}

export default UserAddedKeywords;
