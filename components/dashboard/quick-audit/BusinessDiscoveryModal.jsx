"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Building2, MapPin } from "lucide-react";
import apiService from "@/lib/apiService";

/**
 * BusinessDiscoveryModal
 *
 * Shows after URL submission, before audit starts.
 * Displays auto-detected business name + location (editable).
 * Provides debounced autocomplete via /external/search-businesses.
 *
 * Props:
 *   discoveredData  – { businessName, location, city, state, source, confidence }
 *   url             – the URL being audited
 *   onConfirm(ctx)  – called with auditBusinessContext when user continues
 *   onSkip()        – called when user skips; audit starts without business context
 */
export default function BusinessDiscoveryModal({ discoveredData, url, onConfirm, onSkip }) {
  const [businessName, setBusinessName] = useState(discoveredData?.businessName || '');
  const [location, setLocation] = useState(discoveredData?.location || '');

  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchTimerRef = useRef(null);
  const dropdownRef = useRef(null);

  const hasDetected = discoveredData?.confidence !== 'none' &&
    (discoveredData?.businessName || discoveredData?.location);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, []);

  const triggerAutocomplete = (name, loc) => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    setSuggestions([]);
    setShowSuggestions(false);

    if (name.trim().length >= 3 && loc.trim().length >= 2) {
      searchTimerRef.current = setTimeout(async () => {
        setIsSearching(true);
        try {
          const res = await apiService.searchBusinessCandidates(name.trim(), loc.trim());
          if (res?.success && res.data?.length > 0) {
            setSuggestions(res.data);
            setShowSuggestions(true);
          }
        } catch {
          // silently fail — autocomplete is enhancement only
        } finally {
          setIsSearching(false);
        }
      }, 500);
    }
  };

  const handleNameChange = (val) => {
    setBusinessName(val);
    triggerAutocomplete(val, location);
  };

  const handleLocationChange = (val) => {
    setLocation(val);
    if (businessName.trim().length >= 3) {
      triggerAutocomplete(businessName, val);
    }
  };

  const handleSuggestionSelect = (s) => {
    setBusinessName(s.name);
    // Extract city from "123 Street, City, State, Country" → second-to-last token
    const parts = s.address.split(',').map(p => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      const city = parts[parts.length - 2];
      if (city) setLocation(city);
    }
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleConfirm = () => {
    onConfirm({
      url,
      businessName: businessName.trim(),
      location: location.trim(),
      city: location.trim(),
      state: '',
      country: '',
      source: businessName.trim() === discoveredData?.businessName
        ? (discoveredData?.source || 'detected')
        : 'manual'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-[#0d1117] border border-[#263244] rounded-2xl p-8 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white leading-snug">
              {hasDetected
                ? 'We found your business information'
                : 'Tell us about your business'}
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              {hasDetected
                ? 'Confirm or edit the details below before we start the audit'
                : 'Enter your business details to unlock Local SEO analysis'}
            </p>
          </div>
          <button
            type="button"
            onClick={onSkip}
            className="text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0 mt-0.5"
            aria-label="Skip"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Detected badge */}
        {hasDetected && (
          <div className="mb-5 px-3 py-2 rounded-xl bg-cyan-500/5 border border-cyan-500/20 flex items-center gap-2 text-xs text-cyan-400">
            <span>✨</span>
            <span>Detected from your website — please confirm these details</span>
          </div>
        )}

        {/* Business Name */}
        <div className="mb-4 relative" ref={dropdownRef}>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
            Business Name
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={businessName}
              onChange={(e) => handleNameChange(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="e.g. Odito AI"
              className="w-full pl-10 pr-10 py-3 text-sm text-white bg-[#1a2332] border border-[#263244] rounded-xl outline-none focus:border-cyan-400/60 transition-colors placeholder-slate-600"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Autocomplete dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a2332] border border-[#263244] rounded-xl overflow-hidden z-20 shadow-xl">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); handleSuggestionSelect(s); }}
                  className="w-full px-4 py-3 text-left hover:bg-[#263244] transition-colors border-b border-[#263244]/60 last:border-0"
                >
                  <div className="text-sm font-medium text-white">{s.name}</div>
                  {s.address && (
                    <div className="text-xs text-slate-400 mt-0.5 truncate">{s.address}</div>
                  )}
                </button>
              ))}
              <div className="px-4 py-2 text-xs text-slate-500 border-t border-[#263244]/60">
                Can&apos;t find yours? Type to search or edit manually below.
              </div>
            </div>
          )}
        </div>

        {/* Location */}
        <div className="mb-7">
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
            Location
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={location}
              onChange={(e) => handleLocationChange(e.target.value)}
              placeholder="e.g. Nashik, Maharashtra"
              className="w-full pl-10 pr-4 py-3 text-sm text-white bg-[#1a2332] border border-[#263244] rounded-xl outline-none focus:border-cyan-400/60 transition-colors placeholder-slate-600"
            />
          </div>
          <p className="mt-1.5 text-xs text-slate-500">City, State, or Country</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onSkip}
            className="flex-1 px-4 py-3 text-sm font-semibold text-slate-400 border border-[#263244] rounded-xl hover:bg-slate-400/5 transition-colors"
          >
            Skip for now
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 px-4 py-3 text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-cyan-500/20"
          >
            Continue Audit
          </button>
        </div>

        {/* Footer hint */}
        <p className="mt-4 text-xs text-slate-500 text-center">
          Service-area or SaaS business?{' '}
          <button
            type="button"
            onClick={onSkip}
            className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors"
          >
            Skip this step
          </button>
          {' '}— the audit will still run fully.
        </p>
      </div>
    </div>
  );
}
