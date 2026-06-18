/**
 * DIY Renderer
 * =============
 * 
 * Renders DIY guides from shared recommendation intelligence.
 * 
 * This component transforms recommendation sections into:
 * - Step-by-step guides
 * - Checklists
 * - Code examples
 * - Validation instructions
 * 
 * WITHOUT requiring separate backend intelligence.
 * 
 * Reuses the SAME recommendation intelligence as AI Recommendation Engine.
 */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { transformRecommendationToDIY } from "./DIYStepsBuilder";
import RecommendationCodeBlock from "@/components/recommendations/RecommendationCodeBlock";

const styles = {
  diyContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    padding: "16px",
  },
  contextBanner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    background: "rgba(119, 48, 237, 0.08)",
    border: "1px solid rgba(119, 48, 237, 0.2)",
    borderRadius: "12px",
  },
  contextLabel: {
    fontSize: "11px",
    fontWeight: 700,
    color: "#a78bfa",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  contextInfo: {
    display: "flex",
    gap: "8px",
  },
  contextBadge: {
    fontSize: "9px",
    fontWeight: 600,
    color: "#00dfff",
    padding: "4px 8px",
    background: "rgba(0, 223, 255, 0.1)",
    borderRadius: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  sectionLabel: {
    fontSize: "10px",
    fontWeight: 700,
    color: "var(--t3)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: "4px",
  },
  sectionContent: {
    fontSize: "12px",
    lineHeight: "1.6",
    color: "var(--t)",
    padding: "12px",
    background: "var(--s)",
    borderRadius: "8px",
    border: "1px solid var(--b)",
  },
  stepsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  step: {
    display: "flex",
    gap: "12px",
    padding: "12px",
    background: "var(--s)",
    borderRadius: "8px",
    border: "1px solid var(--b)",
    transition: "all 0.2s ease",
  },
  stepNumber: {
    flexShrink: 0,
    width: "28px",
    height: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #7730ed, #00dfff)",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: 700,
    color: "white",
  },
  stepContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  stepTitle: {
    fontSize: "12px",
    fontWeight: 600,
    color: "var(--t)",
  },
  stepDescription: {
    fontSize: "11px",
    lineHeight: "1.5",
    color: "var(--t2)",
  },
  codeReferences: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  impactList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  impactItem: {
    display: "flex",
    gap: "8px",
    alignItems: "flex-start",
  },
  impactBullet: {
    color: "#00f5a0",
    fontSize: "12px",
    lineHeight: "1.5",
  },
  impactText: {
    fontSize: "11px",
    lineHeight: "1.5",
    color: "var(--t2)",
  },
  actions: {
    display: "flex",
    gap: "8px",
    paddingTop: "8px",
  },
  actionButton: {
    flex: 1,
    padding: "10px 16px",
    fontSize: "11px",
    fontWeight: 600,
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  actionPrimary: {
    background: "linear-gradient(135deg, #7730ed, #00dfff)",
    color: "white",
  },
  actionSecondary: {
    background: "var(--s)",
    color: "var(--t2)",
    border: "1px solid var(--b)",
  },
};

// Parses "1. step one\n2. step two" or "1) ..." into an ordered list.
// Falls back to a single prose block if no numbered pattern is detected.
function HowToFixList({ text }) {
  if (!text) return null;

  // Match lines starting with "1." / "1)" / "Step 1:" etc.
  const numberedPattern = /(?:^|\n)\s*(?:\d+[.):]|Step\s+\d+[.):–-]?)\s+/i;
  const isNumbered = numberedPattern.test(text);

  if (isNumbered) {
    // Split on any numbered prefix
    const rawItems = text
      .split(/\n?\s*(?:\d+[.):]|Step\s+\d+[.):–-]?)\s+/i)
      .map(s => s.trim())
      .filter(Boolean);

    return (
      <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
        {rawItems.map((item, i) => (
          <li
            key={i}
            style={{
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
              padding: "10px 14px",
              background: "var(--s)",
              border: "1px solid var(--b)",
              borderRadius: 10,
            }}
          >
            <span style={{
              flexShrink: 0,
              width: 24,
              height: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg,#7730ed,#00dfff)",
              borderRadius: 7,
              fontSize: 11,
              fontWeight: 700,
              color: "#fff",
              lineHeight: 1,
            }}>
              {i + 1}
            </span>
            <span style={{ fontSize: 12.5, lineHeight: 1.6, color: "var(--t)" }}>{item}</span>
          </li>
        ))}
      </ol>
    );
  }

  // Plain prose fallback
  return (
    <div style={{
      fontSize: 12.5,
      lineHeight: 1.65,
      color: "var(--t)",
      padding: "12px 14px",
      background: "var(--s)",
      border: "1px solid var(--b)",
      borderRadius: 10,
    }}>
      {text}
    </div>
  );
}

export default function DIYRenderer({
  recommendation,
  issue,
  task = null,
  selUrl = null,
  onMarkImplemented,
  isMarkingImplemented = false,
}) {
  const [checkedReviewed, setCheckedReviewed] = useState(false)
  const [checkedImplemented, setCheckedImplemented] = useState(false)

  const diyData = transformRecommendationToDIY(recommendation);
  const { steps, codeReferences, context } = diyData;

  const recommendedFix = recommendation?.sections?.recommendedFix;
  const implExample    = recommendation?.sections?.implementationExample;
  const implCode       = implExample?.content && !implExample.content.includes("No implementation example available")
    ? implExample.content : null;
  const implLang       = implExample?.type || "html";
  const framework      = context?.framework && !['unknown', 'Unknown'].includes(context.framework)
    ? context.framework : null;
  const cms            = context?.cms && !['unknown', 'Unknown'].includes(context.css)
    ? context.cms : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={styles.diyContainer}
    >
      {/* Context banner — page type + framework badges */}
      {context && (framework || cms || context.pageType) && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.contextBanner}
        >
          <div style={styles.contextLabel}>🛠 DIY Guide</div>
          <div style={styles.contextInfo}>
            {context.pageType && !['unknown', 'Unknown', 'generic', 'Generic'].includes(context.pageType) && (
              <span style={styles.contextBadge}>{context.pageType}</span>
            )}
            {(framework || cms) && (
              <span style={styles.contextBadge}>{framework || cms}</span>
            )}
          </div>
        </motion.div>
      )}

      {/* How to Fix — parses numbered steps (1. 2. 3.) or plain text */}
      {recommendedFix && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          style={styles.section}
        >
          <div style={styles.sectionLabel}>📋 How to Fix</div>
          <HowToFixList text={recommendedFix} />
        </motion.div>
      )}

      {/* Step-by-Step Guide */}
      {steps.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={styles.section}
        >
          <div style={styles.sectionLabel}>🔢 Steps</div>
          <div style={styles.stepsContainer}>
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + index * 0.06 }}
                style={styles.step}
              >
                <div style={styles.stepNumber}>{index + 1}</div>
                <div style={styles.stepContent}>
                  <div style={styles.stepTitle}>{step.title}</div>
                  <div style={styles.stepDescription}>{step.description}</div>
                  {step.code && (
                    <RecommendationCodeBlock type={step.codeType || "text"} content={step.code} />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Implementation example — moved from AI panel "Implementation Guidance → Implementation Example" */}
      {implCode && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          style={styles.section}
        >
          <div style={styles.sectionLabel}>
            💻 Implementation Example{framework ? ` · ${framework}` : ''}
          </div>
          <RecommendationCodeBlock type={implLang} content={implCode} />
        </motion.div>
      )}

      {/* Additional code references from DIYStepsBuilder */}
      {codeReferences.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={styles.section}
        >
          <div style={styles.sectionLabel}>💻 Code Reference</div>
          <div style={styles.codeReferences}>
            {codeReferences.map((ref, index) => (
              <RecommendationCodeBlock key={index} type={ref.type || "text"} content={ref.content} />
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Implementation Confirmation ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        style={{
          marginTop: 8,
          border: "1px solid var(--b)",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {/* Divider header */}
        <div style={{
          padding: "10px 16px",
          background: "var(--s2)",
          borderBottom: "1px solid var(--b)",
          fontSize: 9.5,
          fontWeight: 700,
          color: "var(--t3)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}>
          Implementation Confirmation
        </div>

        <div style={{ padding: "16px" }}>
          {task?.status === 'verified_fixed' ? (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 14px",
              background: "rgba(0,245,160,0.08)",
              border: "1px solid rgba(0,245,160,0.2)",
              borderRadius: 8,
              fontSize: 12.5,
              fontWeight: 600,
              color: "#00f5a0",
            }}>
              <span>✓</span> Verified Fixed — confirmed by recrawl
            </div>
          ) : task?.status === 'implemented' ? (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 14px",
              background: "rgba(157,78,221,0.08)",
              border: "1px solid rgba(157,78,221,0.2)",
              borderRadius: 8,
              fontSize: 12.5,
              fontWeight: 600,
              color: "#b580ff",
            }}>
              <span>⏳</span> Implemented — pending verification on next recrawl
            </div>
          ) : (
            <>
              {/* Checkbox 1 */}
              <label style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                marginBottom: 10,
                cursor: "pointer",
              }}>
                <input
                  type="checkbox"
                  checked={checkedReviewed}
                  onChange={e => setCheckedReviewed(e.target.checked)}
                  style={{ marginTop: 2, accentColor: "#00dfff", width: 14, height: 14, flexShrink: 0 }}
                />
                <span style={{ fontSize: 12, color: "var(--t)", lineHeight: 1.5 }}>
                  I have reviewed all implementation steps.
                </span>
              </label>

              {/* Checkbox 2 */}
              <label style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                marginBottom: 12,
                cursor: "pointer",
              }}>
                <input
                  type="checkbox"
                  checked={checkedImplemented}
                  onChange={e => setCheckedImplemented(e.target.checked)}
                  style={{ marginTop: 2, accentColor: "#00dfff", width: 14, height: 14, flexShrink: 0 }}
                />
                <span style={{ fontSize: 12, color: "var(--t)", lineHeight: 1.5 }}>
                  I have implemented all recommended changes on my website.
                </span>
              </label>

              {/* Disclaimer */}
              <div style={{
                fontSize: 10.5,
                color: "var(--t3)",
                lineHeight: 1.55,
                marginBottom: 14,
                padding: "8px 10px",
                background: "var(--s2)",
                borderRadius: 7,
                borderLeft: "3px solid var(--b)",
              }}>
                By continuing I confirm the implementation is complete. This will mark the task as implemented
                and schedule automatic verification on the next recrawl.
              </div>

              {/* Mark as Implemented button */}
              {!selUrl ? (
                <div style={{
                  padding: "9px 14px",
                  borderRadius: 8,
                  fontSize: 11.5,
                  color: "var(--t3)",
                  background: "var(--s2)",
                  border: "1px solid var(--b)",
                  textAlign: "center",
                }}>
                  Select a URL from the affected pages list to mark as implemented
                </div>
              ) : (
                <button
                  disabled={!checkedReviewed || !checkedImplemented || isMarkingImplemented}
                  onClick={onMarkImplemented}
                  style={{
                    width: "100%",
                    padding: "10px 16px",
                    borderRadius: 8,
                    fontSize: 12.5,
                    fontWeight: 600,
                    border: "none",
                    cursor: (!checkedReviewed || !checkedImplemented || isMarkingImplemented) ? "not-allowed" : "pointer",
                    background: (!checkedReviewed || !checkedImplemented)
                      ? "var(--s2)"
                      : "rgba(0,245,160,0.1)",
                    color: (!checkedReviewed || !checkedImplemented)
                      ? "var(--t3)"
                      : "#00f5a0",
                    border: `1px solid ${(!checkedReviewed || !checkedImplemented) ? "var(--b)" : "rgba(0,245,160,0.25)"}`,
                    opacity: isMarkingImplemented ? 0.6 : 1,
                    transition: "all 0.2s",
                  }}
                >
                  {isMarkingImplemented ? "⏳ Saving…" : "✓ Mark as Implemented"}
                </button>
              )}
            </>
          )}
        </div>
      </motion.div>

    </motion.div>
  );
}
