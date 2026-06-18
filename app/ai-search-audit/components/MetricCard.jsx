import { useState, useEffect } from "react";
import styles from "../ai-search-audit.module.css";

export default function MetricCard({ icon, label, val, color, index }) {
  const [filled, setFilled] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setFilled(true), 350 + index * 40);
    return () => clearTimeout(t);
  }, [index]);

  const col = val < 40 ? "var(--re)" : val < 65 ? "var(--am)" : "var(--gr)";

  return (
    <div className={styles.mCard}>
      <div className={styles.mTop}>
        <span className={styles.mIcon}>{icon}</span>
        <span style={{ fontSize:9, color:col, fontWeight:600 }}>▲ +{Math.floor(val / 12)}</span>
      </div>
      <div className={styles.mVal} style={{ color:col }}>
        {val}<span className={styles.mValSub}>/100</span>
      </div>
      <div className={styles.mLabel}>{label}</div>
      <div className={styles.mBar}>
        <div
          className={styles.mFill}
          style={{
            width: filled ? val + "%" : "0%",
            background: color,
            transition: "width .9s cubic-bezier(.4,0,.2,1)"
          }}
        />
      </div>
      <div className={styles.mBottomStripe} style={{ background:color }} />
    </div>
  );
}
