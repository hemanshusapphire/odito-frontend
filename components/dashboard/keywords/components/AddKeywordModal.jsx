"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useAddKeyword } from '@/hooks/useKeywordQueries';

const MIN_LENGTH = 2;
const MAX_LENGTH = 100;

// Mirrors keywordValidation.js's normalizeForDuplicateCheck() on the
// backend closely enough for instant client-side feedback — the backend
// re-validates identically regardless (never trust client-side alone), this
// is purely a fast local check so the user doesn't wait on a request for
// the most common mistake (retyping a keyword that's already tracked).
function normalizeForClientCheck(kw) {
  return (kw || '').normalize('NFC').toLowerCase().trim().replace(/\s+/g, ' ');
}

// Maps backend error codes to a specific, professional message — falls
// back to the server's own message for anything not explicitly listed.
const ERROR_MESSAGES = {
  DUPLICATE_KEYWORD: (msg) => msg || 'This keyword is already tracked for this project.',
  KEYWORD_LIMIT_REACHED: (msg) => msg || 'Maximum keywords reached for your current plan. Upgrade your subscription to track more keywords.',
  SUBSCRIPTION_NOT_ACTIVE: (msg) => msg || 'Your subscription is not active. Resolve this via Billing Portal to add more keywords.',
  INVALID_KEYWORD_EMPTY: () => 'Please enter a keyword.',
  INVALID_KEYWORD_TOO_SHORT: (msg) => msg || `Keyword must be at least ${MIN_LENGTH} characters.`,
  INVALID_KEYWORD_TOO_LONG: (msg) => msg || `Keyword cannot exceed ${MAX_LENGTH} characters.`,
  INVALID_KEYWORD_CHARS: (msg) => msg || 'Keyword contains invalid characters.',
  PROJECT_NOT_FOUND: () => 'Project not found.',
};

export default function AddKeywordModal({ isOpen, onClose, projectId, existingKeywords = [], usage }) {
  const [keyword, setKeyword] = useState('');
  const [clientError, setClientError] = useState('');
  const addMutation = useAddKeyword(projectId);

  const resetAndClose = () => {
    setKeyword('');
    setClientError('');
    addMutation.reset();
    onClose();
  };

  const validateClientSide = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return 'Please enter a keyword.';
    if (trimmed.length < MIN_LENGTH) return `Keyword must be at least ${MIN_LENGTH} characters.`;
    if (trimmed.length > MAX_LENGTH) return `Keyword cannot exceed ${MAX_LENGTH} characters.`;

    const normalized = normalizeForClientCheck(trimmed);
    const isDuplicate = existingKeywords.some((k) => normalizeForClientCheck(k) === normalized);
    if (isDuplicate) return 'This keyword is already tracked for this project.';

    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationError = validateClientSide(keyword);
    if (validationError) {
      setClientError(validationError);
      return;
    }
    setClientError('');

    addMutation.mutate(keyword.trim(), {
      onSuccess: () => {
        resetAndClose();
      },
      // Form values are deliberately NOT cleared on failure (no reset here)
      // — the user's typed keyword stays in the input so they can see and
      // correct exactly what was rejected.
    });
  };

  const serverError = addMutation.isError
    ? (ERROR_MESSAGES[addMutation.error?.code]?.(addMutation.error?.message) || addMutation.error?.message || 'Something went wrong. Please try again.')
    : null;

  const displayError = clientError || serverError;
  const atLimit = usage?.limit !== null && usage?.limit !== undefined && usage.used >= usage.limit;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) resetAndClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Track a New Keyword</DialogTitle>
          <DialogDescription>
            We'll check your current Google ranking for this keyword right away.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="add-keyword-input" className="text-sm font-medium text-foreground">
              Keyword
            </label>
            <input
              id="add-keyword-input"
              type="text"
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setClientError(''); }}
              placeholder="e.g. best software company near me"
              autoFocus
              disabled={addMutation.isPending}
              maxLength={MAX_LENGTH + 20 /* allow a little overtyping room; server/client both still enforce the real cap */}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
            />
            {usage && (
              <p className="text-xs text-muted-foreground">
                {usage.limit === null
                  ? `${usage.used} keywords tracked`
                  : `${usage.used} / ${usage.limit} keywords used — ${usage.remaining} remaining`}
              </p>
            )}
          </div>

          {displayError && (
            <div className="mt-3 p-3 rounded-lg text-sm" style={{ background: 'var(--color-status-error-surface, rgba(239,68,68,0.1))', color: 'var(--re, #ef4444)', border: '1px solid var(--color-status-error-border, rgba(239,68,68,0.2))' }}>
              {displayError}
            </div>
          )}

          <DialogFooter className="mt-5">
            <button
              type="button"
              onClick={resetAndClose}
              disabled={addMutation.isPending}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-border bg-transparent hover:bg-muted transition-colors disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addMutation.isPending || atLimit || !keyword.trim()}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              {addMutation.isPending ? 'Checking Ranking…' : 'Track Keyword'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
