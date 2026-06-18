import React, { useState } from "react";

/**
 * LocalPresenceModal - Input form for Google Places business lookup
 * Collects business name and location, then calls the parent callback
 */
export default function LocalPresenceModal({ onSubmit, onClose, loading }) {
  const [businessName, setBusinessName] = useState("");
  const [location, setLocation] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!businessName.trim() || !location.trim()) return;
    onSubmit(businessName.trim(), location.trim());
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-[#111827] border border-[#263244] rounded-2xl p-8 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-white mb-1">
          Get Your Local Presence
        </h3>
        <p className="text-sm text-slate-400 mb-5">
          Enter your business details to fetch data from Google Places.
        </p>

        <form onSubmit={handleSubmit}>
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            Business Name
          </label>
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="e.g. Sapphire Digital Agency"
            disabled={loading}
            className="w-full px-3 py-2 text-sm text-white bg-[#1a2332] border border-[#263244] rounded-xl outline-none mb-4 focus:border-blue-400/50 transition-colors"
          />

          <label className="block text-xs font-semibold text-slate-400 mb-1">
            Location (City)
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Mumbai"
            disabled={loading}
            className="w-full px-3 py-2 text-sm text-white bg-[#1a2332] border border-[#263244] rounded-xl outline-none mb-5 focus:border-blue-400/50 transition-colors"
          />

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-semibold text-slate-400 bg-transparent border border-[#263244] rounded-xl hover:bg-slate-400/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !businessName.trim() || !location.trim()}
              className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 border-none rounded-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 inline-flex items-center gap-2 shadow-lg"
            >
              {loading && (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {loading ? "Fetching..." : "Fetch Data"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
