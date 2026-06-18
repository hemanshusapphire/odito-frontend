/**
 * DIY Code Renderer
 * ==================
 * 
 * Renders code examples with framework-specific syntax highlighting.
 * 
 * Adapts implementation examples to framework-specific display.
 */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const styles = {
  codeContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  codeHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 12px",
    background: "rgba(0, 223, 255, 0.08)",
    border: "1px solid rgba(0, 223, 255, 0.15)",
    borderRadius: "8px",
  },
  codeLabel: {
    fontSize: "10px",
    fontWeight: 600,
    color: "#00dfff",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  copyButton: {
    fontSize: "10px",
    fontWeight: 600,
    color: "#8494b0",
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "6px",
    padding: "4px 8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  codeContent: {
    padding: "12px",
    background: "rgba(0, 0, 0, 0.3)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "8px",
    overflow: "auto",
    fontSize: "11px",
    lineHeight: "1.5",
    color: "#eef2ff",
  },
  codeBlock: {
    fontFamily: "monospace",
  },
};

export default function DIYCodeRenderer({ code, type = "html", label, language = "generic" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  const getLanguageLabel = () => {
    const langMap = {
      nextjs: "JSX",
      wordpress: "PHP",
      shopify: "Liquid",
      react: "JSX",
      nuxtjs: "Vue",
      gatsby: "JSX",
      html: "HTML",
      json: "JSON",
      css: "CSS",
      javascript: "JavaScript",
    };
    return langMap[language] || langMap[type] || "Code";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      style={styles.codeContainer}
    >
      {/* Code Header */}
      <div style={styles.codeHeader}>
        <div style={styles.codeLabel}>
          {label || `${getLanguageLabel()} Example`}
        </div>
        <button
          onClick={handleCopy}
          style={styles.copyButton}
          title="Copy code"
        >
          {copied ? "✓ Copied" : "📋 Copy"}
        </button>
      </div>

      {/* Code Content */}
      <pre style={styles.codeContent}>
        <code style={styles.codeBlock}>{code}</code>
      </pre>
    </motion.div>
  );
}
