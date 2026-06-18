"use client";

import React, { useState, useRef, useEffect } from "react";
import { Building2, MapPin, ArrowRight } from "lucide-react";
import apiService from "@/lib/apiService";

/**
 * BusinessDiscoveryStep — inline, no modal/overlay.
 *
 * Rendered directly in the page flow below the URL input.
 * Parent controls visibility via the grid-rows expand animation.
 *
 * Props:
 *   discoveredData  – { businessName, location, city, state, source, confidence }
 *   url             – the URL being audited
 *   onConfirm(ctx)  – called with auditBusinessContext
 *   onSkip()        – skip and start audit without business context
 */
export default function BusinessDiscoveryStep({ discoveredData, url, onConfirm, onSkip }) {
  const [businessName, setBusinessName] = useState('');
  const [location, setLocation] = useState('');

  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchTimerRef = useRef(null);
  const dropdownRef = useRef(null);

  // Populate fields when discoveredData arrives (may come in after mount)
  useEffect(() => {
    if (discoveredData?.businessName) setBusinessName(discoveredData.businessName);
    if (discoveredData?.location) setLocation(discoveredData.location);
  }, [discoveredData?.businessName, discoveredData?.location]);

  // Close suggestion dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
  }, []);

  const hasDetected = discoveredData?.confidence !== 'none' &&
    (discoveredData?.businessName || discoveredData?.location);

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
          // autocomplete is best-effort
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
    if (businessName.trim().length >= 3) triggerAutocomplete(businessName, val);
  };

  const handleSuggestionSelect = (s) => {
    setBusinessName(s.name);
    // Best-effort city extraction from "Street, City, State, Country"
    const parts = s.address.split(',').map(p => p.trim()).filter(Boolean);
    if (parts.length >= 2) setLocation(parts[parts.length - 2]);
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
        : 'manual',
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Connector from URL bar to this step */}
      <div className="flex flex-col items-center mb-3">
        <div className="w-px h-5 bg-gradient-to-b from-cyan-500/40 to-cyan-500/10" />
        <span className="text-[11px] font-semibold text-cyan-400/70 uppercase tracking-widest px-3 py-0.5">
          Step 2 — Business Details
        </span>
        <div className="w-px h-3 bg-gradient-to-b from-cyan-500/10 to-transparent" />
      </div>

      {/* Card */}
      <div className="bg-white/[0.04] backdrop-blur-md border border-cyan-500/20 rounded-2xl p-6 soft-bloom">

        {/* Header row */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Building2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="text-sm font-bold text-white leading-snug">
              {hasDetected
                ? 'We found your business information'
                : 'Tell us about your business'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {hasDetected
                ? 'Confirm or edit below — this powers your Local SEO analysis'
                : 'Enter details to unlock Local SEO analysis'}
            </p>
          </div>
        </div>

        {/* Detected badge */}
        {hasDetected && (
          <div className="mb-4 px-3 py-1.5 rounded-xl bg-cyan-500/5 border border-cyan-500/15 flex items-center gap-2 text-xs text-cyan-400">
            <span>✨</span>
            <span>Auto-detected from your website — confirm or update below</span>
          </div>
        )}

        {/* Fields row — side by side on md+ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">

          {/* Business Name */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">
              Business Name
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={businessName}
                onChange={(e) => handleNameChange(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                placeholder="e.g. Odito AI"
                className="w-full pl-9 pr-8 py-2.5 text-sm text-white bg-white/5 border border-white/10 rounded-xl outline-none focus:border-cyan-400/50 transition-colors placeholder-slate-600"
              />
              {isSearching && (
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                  <div className="w-3.5 h-3.5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Autocomplete dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#111827] border border-cyan-500/20 rounded-xl overflow-hidden z-30 shadow-2xl shadow-black/50">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); handleSuggestionSelect(s); }}
                    className="w-full px-3.5 py-2.5 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                  >
                    <div className="text-xs font-semibold text-white">{s.name}</div>
                    {s.address && (
                      <div className="text-[10px] text-slate-400 mt-0.5 truncate">{s.address}</div>
                    )}
                  </button>
                ))}
                <div className="px-3.5 py-1.5 text-[10px] text-slate-500 border-t border-white/5">
                  Can&apos;t find yours? Enter manually below.
                </div>
              </div>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={location}
                onChange={(e) => handleLocationChange(e.target.value)}
                placeholder="e.g. Nashik, Maharashtra"
                className="w-full pl-9 pr-4 py-2.5 text-sm text-white bg-white/5 border border-white/10 rounded-xl outline-none focus:border-cyan-400/50 transition-colors placeholder-slate-600"
              />
            </div>
            <p className="mt-1 text-[10px] text-slate-600">City, State, or Country</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onSkip}
            className="px-5 py-2.5 text-sm font-semibold text-slate-400 border border-white/10 rounded-full hover:border-white/20 hover:text-slate-300 transition-all"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
          >
            Continue Audit
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Footer hint */}
        <p className="mt-3.5 text-[11px] text-slate-500 text-center">
          SaaS, e-commerce, or service-area business?{' '}
          <button
            type="button"
            onClick={onSkip}
            className="text-cyan-400/80 hover:text-cyan-300 underline underline-offset-2 transition-colors"
          >
            Skip this step
          </button>{' '}
          — the audit runs in full either way.
        </p>
      </div>
    </div>
  );
}
