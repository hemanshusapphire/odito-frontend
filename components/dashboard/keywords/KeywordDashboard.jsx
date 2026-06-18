"use client"

import React, { useState, useEffect } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import apiService from '@/lib/apiService';
import UserAddedKeywords from './components/UserAddedKeywords';
import './styles/keywords.css';

export default function KeywordDashboard() {
  const [userKeywords, setUserKeywords] = useState(null);
  const [userKeywordsLoading, setUserKeywordsLoading] = useState(false);
  const [userKeywordsError, setUserKeywordsError] = useState(null);

  const { activeProject } = useProject();

  // Fetch user keywords when activeProject?._id changes
  useEffect(() => {
    if (activeProject?._id) {
      fetchUserKeywords();
    }
  }, [activeProject?._id]);

  const fetchUserKeywords = async () => {
    if (!activeProject?._id) return;

    setUserKeywordsLoading(true);
    setUserKeywordsError(null);

    try {
      const response = await apiService.getProjectRankings(activeProject._id);

      // Handle the response structure: { success: true, data: rankings }
      const rankings = response.data?.data || response.data || [];
      const rankingData = rankings[0]; // Get the most recent ranking

      if (rankingData) {
        setUserKeywords(rankingData);
      } else {
        setUserKeywords(null);
      }
    } catch (error) {
      console.error('Failed to fetch user keywords:', error);
      console.error('Error response:', error.response);

      // Handle different types of errors
      if (error.response?.status === 404) {
        setUserKeywordsError('No keyword rankings found for this project');
      } else if (error.response?.status >= 500) {
        setUserKeywordsError('Server error. Please try again later.');
      } else {
        setUserKeywordsError(error.message || 'Failed to load tracked keywords');
      }
    } finally {
      setUserKeywordsLoading(false);
    }
  };

  return (
    <div className="keyword-dashboard" style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>

      {/* TOP BAR */}
      <div style={{
        background: 'var(--bg2)',
        borderBottom: '1px solid var(--border)',
        padding: '14px 20px',
        flexShrink: 0
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap'
        }}>
          <div style={{ minWidth: 0 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              marginBottom: 3
            }}>
              <div style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#10ffa0',
                boxShadow: '0 0 8px #10ffa0',
                flexShrink: 0
              }} />
              <span style={{
                fontSize: 9,
                fontWeight: 800,
                color: '#10ffa0',
                letterSpacing: '0.12em',
                textTransform: 'uppercase'
              }}>
                MANUAL TRACKING · GOOGLE US
              </span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 8,
              flexWrap: 'wrap'
            }}>
              <h1 style={{
                fontFamily: "var(--font-metric)",
                fontSize: 20,
                fontWeight: 700,
                color: 'var(--text)',
                lineHeight: 1.2,
                letterSpacing: '-0.02em'
              }}>
                User Added Keywords
              </h1>
              <span style={{
                fontSize: 11,
                fontWeight: 500,
                color: 'var(--text2)',
                fontFamily: "'DM Sans',sans-serif"
              }}>
                {`${userKeywords?.keywords?.length || 0} keywords`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="kwdash-wrap" style={{
        flex: 1
      }}>
        <UserAddedKeywords
          data={userKeywords}
          loading={userKeywordsLoading}
          error={userKeywordsError}
          onRefresh={fetchUserKeywords}
        />
      </div>
    </div>
  );
}
