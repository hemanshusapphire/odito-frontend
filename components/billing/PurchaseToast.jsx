"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

/**
 * Small transient toast for purchase-flow feedback (checkout errors,
 * "purchase cancelled", "pages added"). Same visual convention already
 * used ad hoc on the Deleted Projects / Danger Zone pages
 * (components/settings/DangerZoneCard.jsx) and, until now, duplicated
 * again inline in url-selection/client.jsx — pulled out here once so
 * every "Buy More Pages" entry point (URL Selection, Settings →
 * Subscription, and any future one) renders the identical component
 * instead of each defining its own copy.
 */
export default function PurchaseToast({ message, type = "success", onClose }) {
  useEffect(() => {
    const id = setTimeout(onClose, 3500);
    return () => clearTimeout(id);
  }, [onClose]);

  if (typeof document === "undefined") return null;

  const bg = type === "success" ? "rgba(0,245,160,0.12)" : type === "error" ? "rgba(255,56,96,0.12)" : "rgba(0,229,255,0.12)";
  const border = type === "success" ? "rgba(0,245,160,0.28)" : type === "error" ? "rgba(255,56,96,0.28)" : "rgba(0,229,255,0.28)";
  const color = type === "success" ? "#00f5a0" : type === "error" ? "#ff3860" : "#00e5ff";
  const icon = type === "success" ? "✓" : type === "error" ? "✕" : "ℹ";

  return createPortal(
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 9999,
      background: bg, border: `1px solid ${border}`, color,
      borderRadius: 10, padding: "11px 18px", fontSize: 13, fontWeight: 600,
      display: "flex", alignItems: "center", gap: 8,
      backdropFilter: "blur(8px)", boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
    }}>
      <span>{icon}</span>
      {message}
    </div>,
    document.body
  );
}
