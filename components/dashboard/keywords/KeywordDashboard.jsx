"use client"

import React, { useState, useCallback } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import apiService from '@/lib/apiService';
import ProgressBar from '@/components/ui/ProgressBar';
import UserAddedKeywords from './components/UserAddedKeywords';
import AddKeywordModal from './components/AddKeywordModal';
import { useKeywords, useDeleteKeyword } from '@/hooks/useKeywordQueries';
import './styles/keywords.css';

export default function KeywordDashboard() {
  const { activeProject } = useProject();
  const projectId = activeProject?._id;

  // React Query owns the data/loading/error state — no manual useState/useEffect.
  const { data: response, isLoading, isError, error, refetch } = useKeywords(projectId);
  const deleteMutation = useDeleteKeyword(projectId);

  // Set of keyword strings currently being rescanned — drives per-row spinner
  const [rescanningKeywords, setRescanningKeywords] = useState(new Set());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  // Distinct from a DataForSEO scan_error (which the backend already
  // reports as a normal 200 success with last_scan_status='error' — see
  // UserAddedKeywords.jsx's "Scan Error" row state). This is for a HARD
  // failure of the rescan request itself (network drop, cooldown 429,
  // unexpected 500) that never reaches that success path at all — those
  // used to be swallowed with only a console.error, leaving the row
  // silently unchanged with no feedback that anything went wrong.
  const [rescanError, setRescanError] = useState(null);

  const rankingData = response?.data?.[0] ?? null;
  const usage = rankingData?.usage ?? null;

  // Was a hardcoded "GOOGLE US" regardless of the project's actual location —
  // e.g. always wrong for a project like Nashik, Maharashtra, India, whose
  // rankings are genuinely checked against location_code 9040235 (India), not
  // the US. rankingData.country already carries the real value (see
  // SeoRankingCurrent's country field / getProjectRankings) — no change to
  // any ranking/location logic, this only corrects what the label displays.
  const trackingCountryLabel = rankingData?.country || 'US';

  const handleRescanKeyword = useCallback(async (keyword) => {
    if (!projectId || rescanningKeywords.has(keyword)) return;

    setRescanError(null);
    setRescanningKeywords(prev => new Set(prev).add(keyword));
    try {
      await apiService.rescanKeyword(projectId, keyword);
      // Rescan changes rank data but not the tracked-keyword count/usage —
      // a simple refetch keeps this in sync with React Query's cache
      // without hand-rolling a local-state merge (the old approach). A
      // DataForSEO-side scan failure still resolves here successfully
      // (200, last_scan_status='error' on the keyword) — this refetch is
      // what makes that row's "Scan Error" state show up without a manual
      // page reload.
      await refetch();
    } catch (err) {
      // A hard failure of the REQUEST itself (network drop, the 30-minute
      // cooldown's 429, an unexpected 500) — never silently reverted to
      // whatever the row showed before; the user is told the rescan itself
      // didn't go through.
      console.error('Rescan failed for keyword:', keyword, err);
      setRescanError({ keyword, message: err?.message || 'Failed to rescan this keyword. Please try again.' });
    } finally {
      setRescanningKeywords(prev => {
        const next = new Set(prev);
        next.delete(keyword);
        return next;
      });
    }
  }, [projectId, rescanningKeywords, refetch]);

  const handleDeleteKeyword = useCallback((keyword) => {
    setDeleteError(null);
    deleteMutation.mutate(keyword, {
      onError: (err) => {
        setDeleteError(err?.message || 'Failed to remove keyword. Please try again.');
      },
    });
  }, [deleteMutation]);

  const atLimit = usage?.limit !== null && usage?.limit !== undefined && usage.used >= usage.limit;
  const usedPercent = usage?.limit ? Math.min(100, Math.round((usage.used / usage.limit) * 100)) : 0;

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
          gap: 16,
          flexWrap: 'wrap'
        }}>
          <div style={{ minWidth: 0, flex: '1 1 260px' }}>
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
                MANUAL TRACKING · GOOGLE {trackingCountryLabel}
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
                Tracked Keywords
              </h1>
            </div>
          </div>

          {/* Usage indicator — used/limit, progress bar, remaining slots */}
          {usage && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14,
              flex: '1 1 280px', maxWidth: 340
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 11 }}>
                  <span style={{ color: 'var(--text2)', fontWeight: 600 }}>
                    {usage.limit === null ? `${usage.used} tracked` : `${usage.used} / ${usage.limit} Used`}
                  </span>
                  <span style={{ color: atLimit ? 'var(--red)' : 'var(--text3)', fontWeight: 600 }}>
                    {usage.limit === null ? 'Unlimited' : `${usage.remaining} Remaining`}
                  </span>
                </div>
                {usage.limit !== null && (
                  <ProgressBar val={usedPercent} color={atLimit ? 'var(--red)' : 'var(--cyan)'} />
                )}
              </div>
            </div>
          )}

          <button
            onClick={() => setIsAddModalOpen(true)}
            disabled={atLimit}
            title={atLimit ? 'Maximum keywords reached for your current plan. Upgrade your subscription to track more keywords.' : undefined}
            style={{
              flexShrink: 0,
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '9px 16px',
              background: atLimit ? 'var(--bg)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: atLimit ? 'var(--text3)' : '#fff',
              border: atLimit ? '1px solid var(--border)' : 'none',
              borderRadius: 8,
              fontSize: 13, fontWeight: 700,
              cursor: atLimit ? 'not-allowed' : 'pointer',
              transition: 'opacity 0.2s',
              opacity: atLimit ? 0.7 : 1,
            }}
          >
            <span style={{ fontSize: 15, lineHeight: 1 }}>+</span>
            Add Keyword
          </button>
        </div>

        {atLimit && (
          <div style={{ marginTop: 10, fontSize: 12, color: 'var(--red)' }}>
            Maximum keywords reached for your current plan. Upgrade your subscription to track more keywords.
          </div>
        )}

        {deleteError && (
          <div style={{
            marginTop: 10, fontSize: 12, color: 'var(--red)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10
          }}>
            <span>{deleteError}</span>
            <button
              onClick={() => setDeleteError(null)}
              style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: 12, padding: 0 }}
            >
              Dismiss
            </button>
          </div>
        )}

        {rescanError && (
          <div style={{
            marginTop: 10, fontSize: 12, color: 'var(--red)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10
          }}>
            <span>Scan failed for "{rescanError.keyword}": {rescanError.message}</span>
            <button
              onClick={() => setRescanError(null)}
              style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: 12, padding: 0 }}
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* MAIN CONTENT */}
      <div className="kwdash-wrap" style={{ flex: 1 }}>
        <UserAddedKeywords
          data={rankingData}
          loading={isLoading}
          error={isError ? (error?.message || 'Failed to load tracked keywords') : null}
          onRefresh={refetch}
          onRescan={handleRescanKeyword}
          onDelete={handleDeleteKeyword}
          rescanningKeywords={rescanningKeywords}
          deletingKeyword={deleteMutation.isPending ? deleteMutation.variables : null}
        />
      </div>

      <AddKeywordModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        projectId={projectId}
        existingKeywords={(rankingData?.keywords || []).map(k => k.keyword)}
        usage={usage}
      />
    </div>
  );
}
