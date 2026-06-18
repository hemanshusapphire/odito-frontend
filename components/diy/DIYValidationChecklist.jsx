/**
 * DIY Validation Checklist
 * =========================
 * 
 * Renders an interactive checklist for DIY validation.
 * 
 * Derived dynamically from recommendation sections.
 */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const styles = {
  checklistContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  progressContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  progressBar: {
    height: "6px",
    background: "rgba(255, 255, 255, 0.1)",
    borderRadius: "3px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #7730ed, #00dfff)",
    borderRadius: "3px",
  },
  progressText: {
    fontSize: "10px",
    fontWeight: 600,
    color: "#8494b0",
    textAlign: "right",
  },
  checklistItems: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  checklistItem: {
    display: "flex",
    gap: "10px",
    padding: "10px 12px",
    background: "rgba(255, 255, 255, 0.02)",
    borderRadius: "8px",
    border: "1px solid rgba(255, 255, 255, 0.06)",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  checked: {
    background: "rgba(0, 245, 160, 0.08)",
    borderColor: "rgba(0, 245, 160, 0.2)",
  },
  checkbox: {
    flexShrink: 0,
    width: "18px",
    height: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    borderRadius: "4px",
  },
  checkmark: {
    fontSize: "12px",
    color: "#00f5a0",
  },
  itemText: {
    fontSize: "11px",
    lineHeight: "1.5",
    color: "#eef2ff",
  },
  completionMessage: {
    padding: "12px",
    background: "rgba(0, 245, 160, 0.1)",
    border: "1px solid rgba(0, 245, 160, 0.2)",
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: 600,
    color: "#00f5a0",
    textAlign: "center",
  },
};

export default function DIYValidationChecklist({ checklist }) {
  const [items, setItems] = useState(
    checklist.map((item, index) => ({ ...item, id: index }))
  );

  const toggleItem = (id) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const completedCount = items.filter(item => item.checked).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div style={styles.checklistContainer}>
      {/* Progress Bar */}
      <div style={styles.progressContainer}>
        <div style={styles.progressBar}>
          <motion.div
            style={styles.progressFill}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div style={styles.progressText}>
          {completedCount} of {totalCount} completed
        </div>
      </div>

      {/* Checklist Items */}
      <div style={styles.checklistItems}>
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            style={{ ...styles.checklistItem, ...(item.checked ? styles.checked : {}) }}
            onClick={() => toggleItem(item.id)}
          >
            <div style={styles.checkbox}>
              {item.checked && <span style={styles.checkmark}>✓</span>}
            </div>
            <div style={styles.itemText}>{item.text}</div>
          </motion.div>
        ))}
      </div>

      {/* Completion Message */}
      {progress === 100 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.completionMessage}
        >
          🎉 All steps completed! You're ready to mark this issue as fixed.
        </motion.div>
      )}
    </div>
  );
}
